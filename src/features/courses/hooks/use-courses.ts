import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  getAll,
  create as dbCreate,
  update as dbUpdate,
  deleteCourseCascade,
} from "@/lib/db"
import type { Course, CourseFormData, CourseWithStats } from "../types"
import { normalizeTags } from "../lib/tags"

export function useCourses(careerId: string) {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const allCourses = await getByIndex("courses", "careerId", careerId)
    const allTasks = await getAll("tasks", false)

    const withStats: CourseWithStats[] = allCourses.map((course) => {
      const pendingTasks = allTasks.filter(
        (t) => t.courseId === course.id && t.status === "pending"
      )
      return { ...course, pendingTaskCount: pendingTasks.length }
    })

    withStats.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setCourses(withStats)
    setIsLoading(false)
  }, [careerId])

  useEffect(() => {
    load()
  }, [load])

  const createCourse = useCallback(
    async (data: CourseFormData): Promise<Course> => {
      const now = new Date().toISOString()
      const tags = normalizeTags(data.tags)
      const course: Course = {
        id: crypto.randomUUID(),
        careerId,
        name: data.name,
        teacher: data.teacher,
        description: data.description,
        schedule: data.schedule,
        startDate: data.startDate,
        endDate: data.endDate,
        teamName: data.teamName,
        ...(tags.length > 0 ? { tags } : {}),
        createdAt: now,
        updatedAt: now,
      }
      await dbCreate("courses", course)
      await load()
      return course
    },
    [careerId, load]
  )

  const updateCourse = useCallback(
    async (id: string, data: CourseFormData): Promise<Course> => {
      const all = await getByIndex("courses", "careerId", careerId)
      const found = all.find((c) => c.id === id)
      if (!found) throw new Error("Course not found")
      const tags = normalizeTags(data.tags ?? found.tags)
      const updated: Course = {
        ...found,
        ...data,
        tags: tags.length > 0 ? tags : undefined,
        updatedAt: new Date().toISOString(),
      }
      // stripUndefined in db layer drops undefined, but for clearing tags
      // we need explicit removal: store empty case as missing field
      if (tags.length === 0) {
        delete (updated as Partial<Course>).tags
      }
      await dbUpdate("courses", updated)
      await load()
      return updated
    },
    [careerId, load]
  )

  const deleteCourse = useCallback(
    async (id: string): Promise<void> => {
      await deleteCourseCascade(id)
      await load()
    },
    [load]
  )

  return { courses, isLoading, createCourse, updateCourse, deleteCourse }
}


