import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  create as dbCreate,
  remove as dbRemove,
} from "@/lib/db"
import type { ScheduleEntry, ScheduleEntryFormData } from "../types"

export function useScheduleEntries(courseId: string) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const all = await getByIndex("scheduleEntries", "courseId", courseId)
    setEntries(all)
    setIsLoading(false)
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const addEntry = useCallback(
    async (data: ScheduleEntryFormData): Promise<ScheduleEntry> => {
      const entry: ScheduleEntry = {
        id: crypto.randomUUID(),
        courseId,
        ...data,
      }
      await dbCreate("scheduleEntries", entry)
      await load()
      return entry
    },
    [courseId, load]
  )

  const removeEntry = useCallback(
    async (id: string): Promise<void> => {
      await dbRemove("scheduleEntries", id)
      await load()
    },
    [load]
  )

  return { entries, isLoading, addEntry, removeEntry }
}
