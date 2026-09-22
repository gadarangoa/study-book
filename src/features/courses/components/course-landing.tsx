import { CalendarIcon, UsersIcon, BookOpenIcon, FileTextIcon } from "lucide-react"
import type { Course } from "../types"
import type { ScheduleEntry } from "../types"
import type { Resource } from "@/features/resources/types"
import type { ApaFormDocument } from "@/features/documents"
import type { Partner } from "@/features/partners/types"
import { FeatureCard } from "./feature-card"

interface CourseLandingProps {
  course: Course
  scheduleEntries: ScheduleEntry[]
  resources: Resource[]
  documents: ApaFormDocument[]
  partners: Partner[]
}

export function CourseLanding({
  course,
  scheduleEntries,
  resources,
  documents,
  partners,
}: CourseLandingProps) {
  const notes = resources.filter((r) => r.type === "note")
  const links = resources.filter((r) => r.type === "link")
  const pdfs = resources.filter((r) => r.type === "pdf")

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
          title="Documentos APA"
          description={
            documents.length === 0
              ? "Crea tu primer entregable con la plantilla APA"
              : `${documents.length} documento${documents.length !== 1 ? "s" : ""} en este curso`
          }
          icon={FileTextIcon}
          stats={documents.length > 0 ? `${documents.length}` : undefined}
          href={`/courses/${course.id}/documents`}
          color="orange"
        />
        <FeatureCard
          title="Resources"
          description={resources.length === 0 ? "No resources yet" : `${notes.length} notes • ${links.length} links • ${pdfs.length} PDFs`}
          icon={BookOpenIcon}
          stats={resources.length > 0 ? `${resources.length}` : undefined}
          href={`/courses/${course.id}/resources`}
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
