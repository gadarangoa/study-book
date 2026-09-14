import { useCallback } from "react"
import {
  getInvitationById,
  createCourseMember,
  updateInvitation,
} from "@/lib/db"
import type { Invitation, CourseMember } from "../types"
import { auth } from "@/lib/firebase"

export function useAcceptInvite() {
  const acceptInvitation = useCallback(
    async (token: string): Promise<{ success: boolean; error?: string; courseId?: string }> => {
      const currentUser = auth.currentUser
      if (!currentUser) {
        return { success: false, error: "not-authenticated" }
      }

      try {
        const invitation = await getInvitationById(token)
        if (!invitation) {
          return { success: false, error: "not-found" }
        }

        if (invitation.status !== "pending") {
          return { success: false, error: invitation.status }
        }

        const now = new Date()
        const expiresAt = new Date(invitation.expiresAt)
        if (now > expiresAt) {
          return { success: false, error: "expired" }
        }

        const userEmailLower = currentUser.email?.toLowerCase() ?? ""
        if (userEmailLower !== invitation.emailLower) {
          return { success: false, error: "wrong-email" }
        }

        const memberId = `${invitation.courseId}_${currentUser.uid}`
        const member: CourseMember = {
          id: memberId,
          courseId: invitation.courseId,
          uid: currentUser.uid,
          email: currentUser.email ?? "",
          emailLower: userEmailLower,
          role: "collaborator",
          addedAt: formatDate(now),
          addedByUid: invitation.invitedByUid,
        }

        const updatedInvitation: Invitation = {
          ...invitation,
          status: "accepted",
          acceptedAt: formatDate(now),
          acceptedByUid: currentUser.uid,
        }

        await Promise.all([
          createCourseMember(member),
          updateInvitation(updatedInvitation),
        ])

        return { success: true, courseId: invitation.courseId }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Error al aceptar invitación" }
      }
    },
    []
  )

  return { acceptInvitation }
}

function formatDate(date: Date): string {
  return date.toISOString()
}