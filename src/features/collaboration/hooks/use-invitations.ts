import { useCallback, useState } from "react"
import {
  getPendingInvitations,
  createInvitation,
  updateInvitation,
  getInvitationById,
} from "@/lib/db"
import type { Invitation } from "../types"
import { auth } from "@/lib/firebase"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "")
}

function formatDate(date: Date): string {
  return date.toISOString()
}

export function useInvitations(courseId: string) {
  const [pending, setPending] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPending = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    try {
      const invitations = await getPendingInvitations(courseId)
      setPending(invitations)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar invitaciones"
      )
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const sendInvitation = useCallback(
    async (
      email: string,
      courseName: string
    ): Promise<{
      success: boolean
      invitation?: Invitation
      shareUrl?: string
      error?: string
    }> => {
      const trimmed = email.trim().toLowerCase()
      if (!EMAIL_REGEX.test(trimmed)) {
        return { success: false, error: "invalid-email" }
      }

      const currentUser = auth.currentUser
      if (!currentUser) {
        return { success: false, error: "not-authenticated" }
      }

      try {
        const existing = await getPendingInvitations(courseId)
        const duplicate = existing.find((inv) => inv.emailLower === trimmed)
        if (duplicate) {
          return {
            success: false,
            error: `duplicate-active:${duplicate.status}`,
          }
        }

        const token = generateToken()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const invitation: Invitation = {
          id: token,
          courseId,
          courseName,
          email: email.trim(),
          emailLower: trimmed,
          invitedByUid: currentUser.uid,
          invitedByEmail: currentUser.email ?? "",
          status: "pending",
          createdAt: formatDate(now),
          expiresAt: formatDate(expiresAt),
          resendCount: 0,
        }

        await createInvitation(invitation)

        setPending((prev) => [invitation, ...prev])
        const appUrl = window.location.origin
        return {
          success: true,
          invitation,
          shareUrl: `${appUrl}/invite/${token}`,
        }
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Error al enviar invitación",
        }
      }
    },
    [courseId]
  )

  const renewInvitation = useCallback(
    async (
      invitationId: string
    ): Promise<{
      success: boolean
      invitation?: Invitation
      shareUrl?: string
      error?: string
    }> => {
      try {
        const invitation = await getInvitationById(invitationId)
        if (!invitation) {
          return { success: false, error: "not-found" }
        }
        if (
          invitation.status === "accepted" ||
          invitation.status === "revoked"
        ) {
          return { success: false, error: `cannot-renew:${invitation.status}` }
        }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const updated: Invitation = {
          ...invitation,
          status: "pending",
          expiresAt: formatDate(expiresAt),
          resendCount: invitation.resendCount + 1,
        }

        await updateInvitation(updated)

        setPending((prev) =>
          prev.map((inv) => (inv.id === invitationId ? updated : inv))
        )
        return {
          success: true,
          invitation: updated,
          shareUrl: `${window.location.origin}/invite/${invitation.id}`,
        }
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Error al renovar invitación",
        }
      }
    },
    []
  )

  const revokeInvitation = useCallback(
    async (
      invitationId: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const invitation = await getInvitationById(invitationId)
        if (!invitation) {
          return { success: false, error: "not-found" }
        }
        if (invitation.status !== "pending") {
          return { success: false, error: `cannot-revoke:${invitation.status}` }
        }

        const updated: Invitation = {
          ...invitation,
          status: "revoked",
          revokedAt: formatDate(new Date()),
        }

        await updateInvitation(updated)

        setPending((prev) =>
          prev.map((inv) => (inv.id === invitationId ? updated : inv))
        )
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Error al revocar invitación",
        }
      }
    },
    []
  )

  return {
    pending,
    loading,
    error,
    loadPending,
    sendInvitation,
    renewInvitation,
    revokeInvitation,
  }
}
