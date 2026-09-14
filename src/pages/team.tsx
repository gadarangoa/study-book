"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { getById, update } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { usePartners } from "@/features/partners/hooks/use-partners"
import { TeamManager } from "@/features/partners/components/team-manager"
import { useAuth } from "@/features/auth"
import { useInvitations } from "@/features/collaboration/hooks/use-invitations"
import { useMembers } from "@/features/collaboration/hooks/use-members"
import { InviteDialog } from "@/features/collaboration/components/invite-dialog"
import { InvitationList } from "@/features/collaboration/components/invitation-list"
import { MemberList } from "@/features/collaboration/components/member-list"

export function TeamPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const { partners, addPartner, removePartner } = usePartners(courseId ?? "")
  const { pending, loading: invitationsLoading, loadPending, sendInvitation, resendInvitation } = useInvitations(courseId ?? "")
  const { members, loading: membersLoading, loadMembers, removeMember } = useMembers(courseId ?? "")

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

  useEffect(() => {
    if (courseId) {
      loadPending()
      loadMembers()
    }
  }, [courseId, loadPending, loadMembers])

  const handleTeamNameChange = useCallback(
    async (teamName: string | undefined) => {
      if (!course) return
      const updated: Course = {
        ...course,
        teamName,
        updatedAt: new Date().toISOString(),
      }
      await update("courses", updated)
      setCourse(updated)
    },
    [course]
  )

  const handleInviteSent = useCallback(() => {
    loadPending()
  }, [loadPending])

  const handleResend = useCallback(
    async (invitationId: string) => {
      await resendInvitation(invitationId)
      loadPending()
    },
    [resendInvitation, loadPending]
  )

  const handleRemoveMember = useCallback(
    async (memberUid: string) => {
      await removeMember(memberUid)
      loadMembers()
    },
    [removeMember, loadMembers]
  )

  if (!course) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const isOwner = user && course.uid === user.uid
  const currentUserUid = user?.uid ?? ""

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to={`/courses/${course.id}`} />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back to course</span>
        </Button>
        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {course.teamName ?? "Team"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {course.name}
            {course.teamName
              ? ` • ${partners.length} member${partners.length !== 1 ? "s" : ""} (local)`
              : ` • Manage the group and its members`}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">Colaboradores con acceso (Firebase)</h2>
          {isOwner && <InviteDialog courseId={courseId ?? ""} courseName={course.name} onInviteSent={handleInviteSent} />}
          <InvitationList invitations={pending} onResend={handleResend} loading={invitationsLoading} />
          <MemberList
            members={members}
            currentUserUid={currentUserUid}
            onRemove={handleRemoveMember}
            loading={membersLoading}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Equipo local (para portadas APA)</h2>
          <TeamManager
            teamName={course.teamName}
            partners={partners}
            onTeamNameChange={handleTeamNameChange}
            onAdd={addPartner}
            onDelete={removePartner}
          />
        </section>
      </div>
    </div>
  )
}