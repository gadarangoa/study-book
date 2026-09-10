import { CalendarIcon, UsersIcon, BookOpenIcon, ClipboardListIcon } from "lucide-react"
import type { Course } from "../types"
import type { ScheduleEntry } from "../types"
import type { Resource } from "@/features/resources/types"
import type { Task } from "@/features/tasks/types"
import type { Partner } from "@/features/partners/types"
import { FeatureCard } from "./feature-card"

interface CourseLandingProps {
  course: Course
  scheduleEntries: ScheduleEntry[]
  resources: Resource[]
  tasks: Task[]
  partners: Partner[]
}

export function CourseLanding({
  course,
  scheduleEntries,
  resources,
  tasks,
  partners,
}: CourseLandingProps) {
  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const notes = resources.filter((r) => r.type === "note")
  const links = resources.filter((r) => r.type === "link")

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
      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard
          title="Team"
          description={
            course.teamName
              ? `${course.teamName} • ${partners.length} member${partners.length !== 1 ? "s" : ""}`
              : partners.length === 0
                ? "No team members yet"
                : `${partners.length} member${partners.length !== 1 ? "s" : ""}`
          }
          icon={UsersIcon}
          stats={partners.length > 0 ? `${partners.length}` : undefined}
          href={`/courses/${course.id}/team`}
          color="blue"
        />
        <FeatureCard
          title="Deliverables"
          description={pendingTasks.length === 0 ? "All caught up!" : `${pendingTasks.length} pending task${pendingTasks.length !== 1 ? "s" : ""}`}
          icon={ClipboardListIcon}
          stats={pendingTasks.length > 0 ? `${pendingTasks.length}` : undefined}
          href="#tasks"
          color="orange"
        />
        <FeatureCard
          title="Resources"
          description={resources.length === 0 ? "No resources yet" : `${notes.length} notes • ${links.length} links`}
          icon={BookOpenIcon}
          stats={resources.length > 0 ? `${resources.length}` : undefined}
          href="#resources"
          color="green"
        />
        <FeatureCard
          title="Schedule"
          description={scheduleDisplay || "No schedule set"}
          icon={CalendarIcon}
          href="#schedule"
          color="purple"
        />
      </div>
    </div>
  )
}
