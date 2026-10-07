import { useCallback, useEffect, useState } from "react"
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  removeTeamMember,
  removeCourseMember,
} from "@/lib/db"
import type { TeamMember, TeamMemberStatus } from "../types"
import { auth } from "@/lib/firebase"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "")
}

function formatDate(date: Date): string {
  return date.toISOString()
}

function displayStatus(member: TeamMember): TeamMemberStatus {
  if (
    member.status === "pending" &&
    member.expiresAt &&
    new Date(member.expiresAt) < new Date()
  ) {
    return "expired"
  }
  return member.status
}

type ActionResult = { success: boolean; error?: string }
type ShareResult = ActionResult & { shareUrl?: string }

export function useTeamMembers(courseId: string) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    try {
      const all = await getTeamMembers(courseId)
      setMembers(all.map((m) => ({ ...m, status: displayStatus(m) })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el equipo")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const findDuplicateEmail = useCallback(
    async (emailLower: string, excludeId?: string) => {
      const all = await getTeamMembers(courseId)
      return all.find(
        (m) =>
          m.id !== excludeId &&
          m.emailLower === emailLower &&
          (m.status === "pending" || m.status === "accepted")
      )
    },
    [courseId]
  )

  const addMember = useCallback(
    async (
      name: string,
      email: string,
      courseName: string
    ): Promise<ShareResult & { member?: TeamMember }> => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        return { success: false, error: "invalid-name" }
      }

      const currentUser = auth.currentUser
      if (!currentUser) {
        return { success: false, error: "not-authenticated" }
      }

      const trimmedEmail = email.trim()
      const emailLower = trimmedEmail.toLowerCase()
      if (trimmedEmail && !EMAIL_REGEX.test(emailLower)) {
        return { success: false, error: "invalid-email" }
      }

      if (trimmedEmail) {
        const duplicate = await findDuplicateEmail(emailLower)
        if (duplicate) {
          return { success: false, error: `duplicate-active:${duplicate.status}` }
        }
      }

      try {
        const id = generateId()
        const now = new Date()
        const member: TeamMember = {
          id,
          courseId,
          courseName,
          name: trimmedName,
          status: trimmedEmail ? "pending" : "local",
          invitedByUid: currentUser.uid,
          invitedByEmail: currentUser.email ?? "",
          createdAt: formatDate(now),
          resendCount: 0,
          ...(trimmedEmail
            ? {
                email: trimmedEmail,
                emailLower,
                expiresAt: formatDate(new Date(now.getTime() + INVITE_TTL_MS)),
              }
            : {}),
        }

        await createTeamMember(member)
        setMembers((prev) => [member, ...prev])

        return {
          success: true,
          member,
          shareUrl: trimmedEmail
            ? `${window.location.origin}/invite/${id}`
            : undefined,
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error al agregar miembro",
        }
      }
    },
    [courseId, findDuplicateEmail]
  )

  const inviteExistingMember = useCallback(
    async (memberId: string, email: string): Promise<ShareResult> => {
      const trimmedEmail = email.trim()
      const emailLower = trimmedEmail.toLowerCase()
      if (!EMAIL_REGEX.test(emailLower)) {
        return { success: false, error: "invalid-email" }
      }

      try {
        const member = await getTeamMemberById(memberId)
        if (!member) {
          return { success: false, error: "not-found" }
        }
        if (member.status !== "local") {
          return { success: false, error: "already-invited" }
        }

        const duplicate = await findDuplicateEmail(emailLower, memberId)
        if (duplicate) {
          return { success: false, error: `duplicate-active:${duplicate.status}` }
        }

        const now = new Date()
        const updated: TeamMember = {
          ...member,
          email: trimmedEmail,
          emailLower,
          status: "pending",
          expiresAt: formatDate(new Date(now.getTime() + INVITE_TTL_MS)),
        }
        await updateTeamMember(updated)
        setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
        return {
          success: true,
          shareUrl: `${window.location.origin}/invite/${memberId}`,
        }
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Error al generar el enlace",
        }
      }
    },
    [findDuplicateEmail]
  )

  const renewInvitation = useCallback(
    async (memberId: string): Promise<ShareResult> => {
      try {
        const member = await getTeamMemberById(memberId)
        if (!member) {
          return { success: false, error: "not-found" }
        }
        if (member.status === "accepted" || member.status === "revoked") {
          return { success: false, error: `cannot-renew:${member.status}` }
        }

        const now = new Date()
        const updated: TeamMember = {
          ...member,
          status: "pending",
          expiresAt: formatDate(new Date(now.getTime() + INVITE_TTL_MS)),
          resendCount: member.resendCount + 1,
        }
        await updateTeamMember(updated)
        setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
        return {
          success: true,
          shareUrl: `${window.location.origin}/invite/${memberId}`,
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error al renovar el enlace",
        }
      }
    },
    []
  )

  const revokeMember = useCallback(
    async (memberId: string): Promise<ActionResult> => {
      try {
        const member = await getTeamMemberById(memberId)
        if (!member) {
          return { success: false, error: "not-found" }
        }
        if (member.status !== "pending" && member.status !== "accepted") {
          return { success: false, error: `cannot-revoke:${member.status}` }
        }

        const updated: TeamMember = {
          ...member,
          status: "revoked",
          revokedAt: formatDate(new Date()),
        }
        await updateTeamMember(updated)

        if (member.status === "accepted" && member.acceptedByUid) {
          await removeCourseMember(courseId, member.acceptedByUid)
        }

        setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error al revocar acceso",
        }
      }
    },
    [courseId]
  )

  const deleteLocalMember = useCallback(
    async (memberId: string): Promise<ActionResult> => {
      try {
        await removeTeamMember(memberId)
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error al eliminar",
        }
      }
    },
    []
  )

  return {
    members,
    loading,
    error,
    load,
    addMember,
    inviteExistingMember,
    renewInvitation,
    revokeMember,
    deleteLocalMember,
  }
}
