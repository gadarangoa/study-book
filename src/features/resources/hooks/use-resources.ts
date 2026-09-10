import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  create as dbCreate,
  update as dbUpdate,
  remove as dbRemove,
} from "@/lib/db"
import type { Resource, NoteFormData, LinkFormData } from "../types"

export function useResources(courseId: string) {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"note" | "link" | undefined>(undefined)

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
    async (data: NoteFormData | LinkFormData): Promise<Resource> => {
      const now = new Date().toISOString()
      const resource: Resource = {
        id: crypto.randomUUID(),
        courseId,
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      await dbCreate("resources", resource)
      await load()
      return resource
    },
    [courseId, load]
  )

  const updateResource = useCallback(
    async (id: string, data: NoteFormData | LinkFormData): Promise<Resource> => {
      const found = resources.find((r) => r.id === id)
      if (!found) throw new Error("Resource not found")
      const updated: Resource = {
        ...found,
        ...data,
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
      await dbRemove("resources", id)
      await load()
    },
    [load]
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
    deleteResource,
  }
}
