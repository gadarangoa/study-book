import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  create as dbCreate,
  update as dbUpdate,
  remove as dbRemove,
} from "@/lib/db"
import { createApaFormTemplate } from "../apa-template"
import {
  APA_DEFAULT_PAGE_SIZE,
  APA_FORM_TEMPLATE_VERSION,
  normalizeCoverData,
} from "../types"
import type {
  ApaDocumentStatus,
  ApaFormDocument,
  BibEntry,
} from "../types"

export function useApaDocuments(courseId: string) {
  const [documents, setDocuments] = useState<ApaFormDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const all = await getByIndex("apaDocuments", "courseId", courseId)
    all.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    setDocuments(all)
    setIsLoading(false)
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const createDocument = useCallback(
    async (courseName: string, title = "Nuevo entregable"): Promise<ApaFormDocument> => {
      const now = new Date().toISOString()
      const document: ApaFormDocument = {
        id: crypto.randomUUID(),
        courseId,
        title,
        sections: createApaFormTemplate(courseName),
        status: "draft",
        pageSize: APA_DEFAULT_PAGE_SIZE,
        templateVersion: APA_FORM_TEMPLATE_VERSION,
        createdAt: now,
        updatedAt: now,
      }
      await dbCreate("apaDocuments", document)
      await load()
      return document
    },
    [courseId, load]
  )

  const renameDocument = useCallback(
    async (id: string, title: string): Promise<ApaFormDocument> => {
      const found = documents.find((d) => d.id === id)
      if (!found) throw new Error("Document not found")
      const updated: ApaFormDocument = {
        ...found,
        title,
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("apaDocuments", updated)
      await load()
      return updated
    },
    [documents, load]
  )

  const duplicateDocument = useCallback(
    async (id: string): Promise<ApaFormDocument> => {
      const found = documents.find((d) => d.id === id)
      if (!found) throw new Error("Document not found")
      const now = new Date().toISOString()
      const bibliography: BibEntry[] = found.sections.bibliography.map(
        (entry, index) => ({ ...entry, id: crypto.randomUUID(), order: index })
      )
      const copy: ApaFormDocument = {
        ...found,
        id: crypto.randomUUID(),
        title: `${found.title} (copia)`,
        sections: {
          ...found.sections,
          cover: normalizeCoverData(found.sections.cover),
          bibliography,
        },
        createdAt: now,
        updatedAt: now,
      }
      delete copy.migratedFrom
      await dbCreate("apaDocuments", copy)
      await load()
      return copy
    },
    [documents, load]
  )

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      await dbRemove("apaDocuments", id)
      await load()
    },
    [load]
  )

  const changeStatus = useCallback(
    async (id: string, status: ApaDocumentStatus): Promise<ApaFormDocument> => {
      const found = documents.find((d) => d.id === id)
      if (!found) throw new Error("Document not found")
      const updated: ApaFormDocument = {
        ...found,
        status,
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("apaDocuments", updated)
      await load()
      return updated
    },
    [documents, load]
  )

  return {
    documents,
    isLoading,
    createDocument,
    renameDocument,
    duplicateDocument,
    deleteDocument,
    changeStatus,
  }
}
