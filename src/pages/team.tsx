"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getById, update } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { useAuth } from "@/features/auth"
import { useTeamMembers } from "@/features/collaboration/hooks/use-team-members"
import { AddMemberDialog } from "@/features/collaboration/components/add-member-dialog"
import { TeamMemberList } from "@/features/collaboration/components/team-member-list"
import { usePublishBreadcrumb } from "@/components/breadcrumb-context"

export function TeamPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  usePublishBreadcrumb("course", course)
  const [draftTeamName, setDraftTeamName] = useState("")
  const {
    members,
    loading: membersLoading,
    load: loadMembers,
    inviteExistingMember,
    renewInvitation,
    revokeMember,
    deleteLocalMember,
  } = useTeamMembers(courseId ?? "")

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

  useEffect(() => {
    setDraftTeamName(course?.teamName ?? "")
  }, [course?.teamName])

  const handleTeamNameSave = useCallback(async () => {
    if (!course) return
    const teamName = draftTeamName.trim() || undefined
    if (teamName === course.teamName) return
    const updated: Course = {
      ...course,
      teamName,
      updatedAt: new Date().toISOString(),
    }
    await update("courses", updated)
    setCourse(updated)
  }, [course, draftTeamName])

  const handleMemberAdded = useCallback(() => {
    loadMembers()
  }, [loadMembers])

  const handleInviteExisting = useCallback(
    async (memberId: string, email: string) => {
      const result = await inviteExistingMember(memberId, email)
      loadMembers()
      return result
    },
    [inviteExistingMember, loadMembers]
  )

  const handleRenew = useCallback(
    async (memberId: string) => {
      await renewInvitation(memberId)
      loadMembers()
    },
    [renewInvitation, loadMembers]
  )

  const handleRevoke = useCallback(
    async (memberId: string) => {
      await revokeMember(memberId)
      loadMembers()
    },
    [revokeMember, loadMembers]
  )

  const handleDeleteLocal = useCallback(
    async (memberId: string) => {
      await deleteLocalMember(memberId)
      loadMembers()
    },
    [deleteLocalMember, loadMembers]
  )

  if (!course) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const isOwner = !!(user && course.uid === user.uid)
  const isTeamNameDirty =
    (draftTeamName.trim() || undefined) !== (course.teamName ?? undefined)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {course.teamName ?? "Team"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {course.name} • {members.length} miembro
            {members.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {isOwner && (
          <div className="flex flex-col gap-2 sm:max-w-sm">
            <Label htmlFor="team-name">Nombre del equipo</Label>
            <div className="flex gap-2">
              <Input
                id="team-name"
                value={draftTeamName}
                onChange={(e) => setDraftTeamName(e.target.value)}
                placeholder="p. ej. Los Algoritmos"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTeamNameSave}
                disabled={!isTeamNameDirty}
              >
                Guardar
              </Button>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Miembros del equipo</h2>
            {isOwner && (
              <AddMemberDialog
                courseId={courseId ?? ""}
                courseName={course.name}
                onMemberAdded={handleMemberAdded}
              />
            )}
          </div>
          <TeamMemberList
            members={members}
            canManage={isOwner}
            loading={membersLoading}
            onInviteExisting={handleInviteExisting}
            onRenew={handleRenew}
            onRevoke={handleRevoke}
            onDeleteLocal={handleDeleteLocal}
          />
        </section>
      </div>
    </div>
  )
}
