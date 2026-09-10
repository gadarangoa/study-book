import { useCallback, useEffect, useRef, useState } from "react"
import { getById, update as dbUpdate } from "@/lib/db"
import { createApaFormTemplate } from "../apa-template"
import { APA_FORM_TEMPLATE_VERSION, normalizeCoverData } from "../types"
import type { JSONContent } from "@tiptap/react"
import type {
  ApaFormDocument,
  ApaFormSections,
  SaveState,
} from "../types"

const AUTOSAVE_DELAY_MS = 800

function isFormDocument(value: unknown): value is ApaFormDocument {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.sections === "object" && record.sections !== null
}

/**
 * Migrates a legacy 002 free-form document (whole TipTap `content`) into the
 * v2 sectioned model, keeping all prior text inside development. Returns null
 * when the value already is a form document.
 */
export function migrateLegacyDocument(
  value: unknown,
  courseName = ""
): ApaFormDocument | null {
  if (isFormDocument(value)) return null
  if (typeof value !== "object" || value === null) return null
  const record = value as Record<string, unknown> & {
    id?: string
    courseId?: string
    title?: string
    content?: JSONContent
    status?: ApaFormDocument["status"]
    createdAt?: string
    updatedAt?: string
  }
  if (typeof record.id !== "string" || typeof record.courseId !== "string") {
    return null
  }
  const now = new Date().toISOString()
  const development: JSONContent =
    typeof record.content === "object" && record.content !== null
      ? (record.content as JSONContent)
      : createApaFormTemplate(courseName).development
  return {
    id: record.id,
    courseId: record.courseId,
    title: typeof record.title === "string" ? record.title : "Nuevo entregable",
    sections: {
      ...createApaFormTemplate(courseName),
      development,
    },
    status: record.status ?? "draft",
    templateVersion: APA_FORM_TEMPLATE_VERSION,
    migratedFrom: "002-tiptap",
    createdAt: typeof record.createdAt === "string" ? record.createdAt : now,
    updatedAt: now,
  }
}

export function useApaFormDocument(documentId: string) {
  const [document, setDocument] = useState<ApaFormDocument | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>("saved")
  const pendingRef = useRef<ApaFormDocument | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getById("apaDocuments", documentId)
      .then((found) => {
        if (cancelled) return
        if (!found) {
          setDocument(undefined)
        } else if (isFormDocument(found)) {
          setDocument({ ...found, sections: { ...found.sections, cover: normalizeCoverData(found.sections.cover) } })
        } else {
          const migrated = migrateLegacyDocument(found)
          setDocument(migrated ?? undefined)
          if (migrated) {
            setSaveState("saving")
            dbUpdate("apaDocuments", migrated)
              .then(() => {
                if (!cancelled) setSaveState("saved")
              })
              .catch(() => {
                if (!cancelled) setSaveState("error")
              })
          }
        }
        setIsLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setDocument(undefined)
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [documentId])

  const persist = useCallback(async (doc: ApaFormDocument) => {
    setSaveState("saving")
    try {
      await dbUpdate("apaDocuments", {
        ...doc,
        updatedAt: new Date().toISOString(),
      })
      setDocument((current) =>
        current && current.id === doc.id
          ? { ...doc, updatedAt: new Date().toISOString() }
          : current
      )
      setSaveState("saved")
    } catch {
      setSaveState("error")
    }
  }, [])

  // Flush pending saves on unmount (covers closing the editor view).
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pendingRef.current) {
        const pending = pendingRef.current
        pendingRef.current = null
        void dbUpdate("apaDocuments", {
          ...pending,
          updatedAt: new Date().toISOString(),
        }).catch(() => undefined)
      }
    }
  }, [])

  const updateSections = useCallback(
    (patch: Partial<ApaFormSections>) => {
      setDocument((current) => {
        if (!current) return current
        const next: ApaFormDocument = {
          ...current,
          sections: { ...current.sections, ...patch },
        }
        pendingRef.current = next
        setSaveState("saving")
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          const toSave = pendingRef.current
          pendingRef.current = null
          if (toSave) void persist(toSave)
        }, AUTOSAVE_DELAY_MS)
        return next
      })
    },
    [persist]
  )

  const retrySave = useCallback(async () => {
    const pending = pendingRef.current
    pendingRef.current = null
    if (pending) {
      await persist(pending)
      return
    }
    if (document) await persist(document)
  }, [document, persist])

  return { document, isLoading, saveState, updateSections, retrySave }
}
