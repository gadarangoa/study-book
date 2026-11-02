import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { getById } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { CourseLanding } from "@/features/courses/components/course-landing"
import { useScheduleEntries } from "@/features/courses/hooks/use-schedule-entries"
import { useResources } from "@/features/resources/hooks/use-resources"
import { useTeamMembers } from "@/features/collaboration/hooks/use-team-members"
import { useApaDocuments } from "@/features/documents/hooks/useApaDocuments"
import { usePublishCourse } from "@/components/breadcrumb-context"

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  usePublishCourse(course)

  const { entries: scheduleEntries } = useScheduleEntries(courseId ?? "")
  const { resources } = useResources(courseId ?? "")
  const { members: teamMembers } = useTeamMembers(courseId ?? "")
  const { documents } = useApaDocuments(courseId ?? "")

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

  if (!course) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getScheduleDisplay = () => {
    if (course.schedule) return course.schedule
    if (scheduleEntries.length === 0) return null
    const days = [...new Set(scheduleEntries.map((e) => e.day))]
    const times = scheduleEntries.map((e) => `${e.startTime}-${e.endTime}`)
    return `${days.join(", ")} ${times[0]}`
  }

  const scheduleDisplay = getScheduleDisplay()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{course.name}</h1>
          {(course.teacher || scheduleDisplay) && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {course.teacher && <span>{course.teacher}</span>}
              {course.teacher && scheduleDisplay && <span>•</span>}
              {scheduleDisplay && <span>{scheduleDisplay}</span>}
            </div>
          )}
          {(course.startDate || course.endDate) && (
            <p className="text-sm text-muted-foreground">
              {course.startDate && formatDate(course.startDate)}
              {course.startDate && course.endDate && " — "}
              {course.endDate && formatDate(course.endDate)}
            </p>
          )}
          {(course.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(course.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {course.description && (
            <p className="text-sm text-muted-foreground">{course.description}</p>
          )}
        </div>
      </div>

      <CourseLanding
        course={course}
        scheduleEntries={scheduleEntries}
        resources={resources}
        documents={documents}
        teamMembers={teamMembers}
      />
    </div>
  )
}
