import { useCallback, useState } from "react"
import {
  getPendingInvitations,
  createInvitation,
  updateInvitation,
  getInvitationById,
  createMailDoc,
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
      setError(err instanceof Error ? err.message : "Error al cargar invitaciones")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const sendInvitation = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
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
          courseName: "", // Will be filled by caller or fetched
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

        // Enqueue email via Trigger Email extension
        const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
        await createMailDoc({
          to: trimmed,
          message: {
            subject: `${currentUser.email} te invitó a colaborar en ${invitation.courseName || "la asignatura"} (StudyBook)`,
            text: `Hola,\n${currentUser.email} te invitó a colaborar en la asignatura "${invitation.courseName || "la asignatura"}".\nAcepta aquí: ${appUrl}/invite/${token} (válido 7 días).\nDeberás iniciar sesión o crear tu cuenta con este mismo correo: ${trimmed}.\nSi no esperabas este mensaje, ignóralo.`,
            html: `<p>Hola,</p><p>${currentUser.email} te invitó a colaborar en la asignatura "<strong>${invitation.courseName || "la asignatura"}</strong>".</p><p><a href="${appUrl}/invite/${token}">Aceptar invitación</a> (válido 7 días).</p><p>Deberás iniciar sesión o crear tu cuenta con este mismo correo: <strong>${trimmed}</strong>.</p><p>Si no esperabas este mensaje, ignóralo.</p>`,
          },
        })

        setPending((prev) => [invitation, ...prev])
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Error al enviar invitación" }
      }
    },
    [courseId]
  )

  const resendInvitation = useCallback(
    async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const invitation = await getInvitationById(invitationId)
        if (!invitation) {
          return { success: false, error: "not-found" }
        }
        if (invitation.status === "accepted" || invitation.status === "revoked") {
          return { success: false, error: `cannot-resend:${invitation.status}` }
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

        const currentUser = auth.currentUser
        if (currentUser) {
          const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
          await createMailDoc({
            to: invitation.emailLower,
            message: {
              subject: `${currentUser.email} te invitó a colaborar en ${invitation.courseName || "la asignatura"} (StudyBook)`,
              text: `Hola,\n${currentUser.email} te invitó a colaborar en la asignatura "${invitation.courseName || "la asignatura"}".\nAcepta aquí: ${appUrl}/invite/${invitation.id} (válido 7 días).\nDeberás iniciar sesión o crear tu cuenta con este mismo correo: ${invitation.emailLower}.\nSi no esperabas este mensaje, ignóralo.`,
              html: `<p>Hola,</p><p>${currentUser.email} te invitó a colaborar en la asignatura "<strong>${invitation.courseName || "la asignatura"}</strong>".</p><p><a href="${appUrl}/invite/${invitation.id}">Aceptar invitación</a> (válido 7 días).</p><p>Deberás iniciar sesión o crear tu cuenta con este mismo correo: <strong>${invitation.emailLower}</strong>.</p><p>Si no esperabas este mensaje, ignóralo.</p>`,
            },
          })
        }

        setPending((prev) => prev.map((inv) => (inv.id === invitationId ? updated : inv)))
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Error al reenviar invitación" }
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
    resendInvitation,
  }
}