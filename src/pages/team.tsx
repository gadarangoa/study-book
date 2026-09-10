import { useCallback, useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { getById, update } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { usePartners } from "@/features/partners/hooks/use-partners"
import { TeamManager } from "@/features/partners/components/team-manager"

export function TeamPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const { partners, addPartner, removePartner } = usePartners(courseId ?? "")

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

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

  if (!course) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

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
              ? ` • ${partners.length} member${partners.length !== 1 ? "s" : ""}`
              : ` • Manage the group and its members`}
          </p>
        </div>
      </div>

      <TeamManager
        teamName={course.teamName}
        partners={partners}
        onTeamNameChange={handleTeamNameChange}
        onAdd={addPartner}
        onDelete={removePartner}
      />
    </div>
  )
}
