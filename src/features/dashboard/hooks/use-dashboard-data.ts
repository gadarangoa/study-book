import { useEffect, useState } from "react"
import { getAll } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import type { Task } from "@/features/tasks/types"
import type { ApaFormDocument } from "@/features/documents/types"

export interface DashboardData {
  courses: Course[]
  tasks: Task[]
  documents: ApaFormDocument[]
  isLoading: boolean
}

/**
 * Loads every course, task and APA document owned by the current user so the
 * dashboard can build a cross-course overview. Reloads when `reloadKey` changes
 * (e.g. after careers are edited or deleted).
 */
export function useDashboardData(reloadKey?: unknown): DashboardData {
  const [data, setData] = useState<Omit<DashboardData, "isLoading">>({
    courses: [],
    tasks: [],
    documents: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAll("courses"), getAll("tasks"), getAll("apaDocuments")])
      .then(([courses, tasks, documents]) => {
        if (!cancelled) setData({ courses, tasks, documents })
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return { ...data, isLoading }
}
