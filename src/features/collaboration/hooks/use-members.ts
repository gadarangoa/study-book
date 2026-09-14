import { useCallback, useState } from "react"
import {
  getActiveMembers,
  getSharedCourses,
  removeCourseMember,
} from "@/lib/db"
import type { CourseMember } from "../types"
import { auth } from "@/lib/firebase"

export function useMembers(courseId: string) {
  const [members, setMembers] = useState<CourseMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    try {
      const activeMembers = await getActiveMembers(courseId)
      setMembers(activeMembers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar miembros")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const removeMember = useCallback(
    async (memberUid: string): Promise<{ success: boolean; error?: string }> => {
      const currentUser = auth.currentUser
      if (!currentUser) {
        return { success: false, error: "not-authenticated" }
      }

      const member = members.find((m) => m.uid === memberUid)
      if (!member) {
        return { success: false, error: "member-not-found" }
      }

      if (member.role === "owner" && member.uid === currentUser.uid) {
        return { success: false, error: "cannot-remove-self" }
      }

      try {
        await removeCourseMember(courseId, memberUid)
        setMembers((prev) => prev.filter((m) => m.uid !== memberUid))
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Error al revocar acceso" }
      }
    },
    [courseId, members]
  )

  return {
    members,
    loading,
    error,
    loadMembers,
    removeMember,
  }
}

export function useSharedCourses() {
  const [courses, setCourses] = useState<Awaited<ReturnType<typeof getSharedCourses>>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSharedCourses = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    setLoading(true)
    setError(null)
    try {
      const shared = await getSharedCourses(currentUser.uid)
      setCourses(shared)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cursos compartidos")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    courses,
    loading,
    error,
    loadSharedCourses,
  }
}