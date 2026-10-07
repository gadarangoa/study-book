import { useCallback } from "react"
import {
  getTeamMemberById,
  createCourseMember,
  updateTeamMember,
} from "@/lib/db"
import type { TeamMember, CourseMember } from "../types"
import { auth } from "@/lib/firebase"

export function useAcceptInvite() {
  const acceptInvitation = useCallback(
    async (token: string): Promise<{ success: boolean; error?: string; courseId?: string }> => {
      const currentUser = auth.currentUser
      if (!currentUser) {
        return { success: false, error: "not-authenticated" }
      }

      try {
        const member = await getTeamMemberById(token)
        if (!member) {
          return { success: false, error: "not-found" }
        }

        if (member.status !== "pending") {
          return { success: false, error: member.status }
        }

        const now = new Date()
        if (member.expiresAt && now > new Date(member.expiresAt)) {
          return { success: false, error: "expired" }
        }

        const userEmailLower = currentUser.email?.toLowerCase() ?? ""
        if (userEmailLower !== member.emailLower) {
          return { success: false, error: "wrong-email" }
        }

        const courseMemberId = `${member.courseId}_${currentUser.uid}`
        const courseMember: CourseMember = {
          id: courseMemberId,
          courseId: member.courseId,
          uid: currentUser.uid,
          email: currentUser.email ?? "",
          emailLower: userEmailLower,
          role: "collaborator",
          addedAt: formatDate(now),
          addedByUid: member.invitedByUid,
        }

        const updatedMember: TeamMember = {
          ...member,
          status: "accepted",
          acceptedAt: formatDate(now),
          acceptedByUid: currentUser.uid,
        }

        await Promise.all([
          createCourseMember(courseMember),
          updateTeamMember(updatedMember),
        ])

        return { success: true, courseId: member.courseId }
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
