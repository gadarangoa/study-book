import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  create as dbCreate,
  update as dbUpdate,
  remove as dbRemove,
} from "@/lib/db"
import { uploadPDF, deletePDF } from "@/lib/storage"
import type { Resource, NoteFormData, LinkFormData, PDFFormData } from "../types"

export function useResources(courseId: string) {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"note" | "link" | "pdf" | undefined>(undefined)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const load = useCallback(async () => {
    setIsLoading(true)
    const all = await getByIndex("resources", "courseId", courseId)
    setResources(all)
    setIsLoading(false)
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const createResource = useCallback(
    async (data: NoteFormData | LinkFormData | PDFFormData): Promise<Resource> => {
      const now = new Date().toISOString()
      const resourceId = crypto.randomUUID()

      if (data.type === "pdf") {
        const { file, ...pdfData } = data
        setUploadProgress((prev) => ({ ...prev, [resourceId]: 0 }))

        const storagePath = await uploadPDF(file, courseId, resourceId)
        setUploadProgress((prev) => ({ ...prev, [resourceId]: 100 }))

        const resource: Resource = {
          id: resourceId,
          courseId,
          ...pdfData,
          storagePath,
          fileName: file.name,
          isCompleted: false,
          readingProgress: 0,
          createdAt: now,
          updatedAt: now,
        }
        await dbCreate("resources", resource)
        await load()
        return resource
      } else {
        const resource: Resource = {
          id: resourceId,
          courseId,
          ...data,
          createdAt: now,
          updatedAt: now,
        }
        await dbCreate("resources", resource)
        await load()
        return resource
      }
    },
    [courseId, load]
  )

  const updateResource = useCallback(
    async (
      id: string,
      data: Partial<Resource> | NoteFormData | LinkFormData
    ): Promise<Resource> => {
      const found = resources.find((r) => r.id === id)
      if (!found) throw new Error("Resource not found")
      const updated: Resource = {
        ...found,
        ...(data as any),
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("resources", updated)
      await load()
      return updated
    },
    [resources, load]
  )

  const updateReadingProgress = useCallback(
    async (id: string, progress: number): Promise<Resource> => {
      const found = resources.find((r) => r.id === id)
      if (!found) throw new Error("Resource not found")
      const updated: Resource = {
        ...found,
        readingProgress: Math.min(100, Math.max(0, progress)),
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("resources", updated)
      await load()
      return updated
    },
    [resources, load]
  )

  const toggleCompletion = useCallback(
    async (id: string): Promise<Resource> => {
      const found = resources.find((r) => r.id === id)
      if (!found) throw new Error("Resource not found")
      const updated: Resource = {
        ...found,
        isCompleted: !found.isCompleted,
        readingProgress: !found.isCompleted ? 100 : 0,
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("resources", updated)
      await load()
      return updated
    },
    [resources, load]
  )

  const deleteResource = useCallback(
    async (id: string): Promise<void> => {
      const resource = resources.find((r) => r.id === id)
      if (resource?.storagePath) {
        await deletePDF(resource.storagePath)
      }
      await dbRemove("resources", id)
      await load()
    },
    [resources, load]
  )

  const filtered = filter
    ? resources.filter((r) => r.type === filter)
    : resources

  return {
    resources: filtered,
    allResources: resources,
    isLoading,
    filter,
    setFilter,
    createResource,
    updateResource,
    updateReadingProgress,
    toggleCompletion,
    deleteResource,
    uploadProgress,
  }
}
