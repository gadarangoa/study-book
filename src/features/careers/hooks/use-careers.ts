import { useCallback, useEffect, useState } from "react"
import {
  getAll,
  create as dbCreate,
  update as dbUpdate,
  deleteCareerCascade,
} from "@/lib/db"
import type { Career, CareerFormData, CareerWithStats } from "../types"

export function useCareers() {
  const [careers, setCareers] = useState<CareerWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const allCareers = await getAll("careers")
    const allCourses = await getAll("courses")
    const allTasks = await getAll("tasks")

    const withStats: CareerWithStats[] = allCareers.map((career) => {
      const courses = allCourses.filter((c) => c.careerId === career.id)
      const courseIds = new Set(courses.map((c) => c.id))
      const pendingTasks = allTasks.filter(
        (t) => courseIds.has(t.courseId) && t.status === "pending"
      )
      return {
        ...career,
        courseCount: courses.length,
        totalPendingTasks: pendingTasks.length,
      }
    })

    withStats.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setCareers(withStats)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createCareer = useCallback(
    async (data: CareerFormData): Promise<Career> => {
      const now = new Date().toISOString()
      const career: Career = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      }
      await dbCreate("careers", career)
      await load()
      return career
    },
    [load]
  )

  const updateCareer = useCallback(
    async (id: string, data: CareerFormData): Promise<Career> => {
      const all = await getAll("careers")
      const found = all.find((c) => c.id === id)
      if (!found) throw new Error("Career not found")
      const updated: Career = {
        ...found,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("careers", updated)
      await load()
      return updated
    },
    [load]
  )

  const deleteCareer = useCallback(
    async (id: string): Promise<void> => {
      await deleteCareerCascade(id)
      await load()
    },
    [load]
  )

  return { careers, isLoading, createCareer, updateCareer, deleteCareer }
}
