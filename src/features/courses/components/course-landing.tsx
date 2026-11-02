import { CalendarIcon, UsersIcon, BookOpenIcon, FileTextIcon } from "lucide-react"
import type { Course } from "../types"
import type { Resource } from "@/features/resources/types"
import type { Task } from "@/features/tasks"
import type { ApaFormDocument } from "@/features/documents"
import type { TeamMember } from "@/features/collaboration/types"
import { FeatureCard } from "./feature-card"

interface CourseLandingProps {
  course: Course
  tasks: Task[]
  resources: Resource[]
  documents: ApaFormDocument[]
  teamMembers: TeamMember[]
}

export function CourseLanding({
  course,
  tasks,
  resources,
  documents,
  teamMembers,
}: CourseLandingProps) {
  const activeTeamMembers = teamMembers.filter((m) => m.status !== "revoked")
  const notes = resources.filter((r) => r.type === "note")
  const links = resources.filter((r) => r.type === "link")
  const pdfs = resources.filter((r) => r.type === "pdf")

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard
          title="Team"
          description={
            course.teamName
              ? `${course.teamName} • ${activeTeamMembers.length} member${activeTeamMembers.length !== 1 ? "s" : ""}`
              : activeTeamMembers.length === 0
                ? "No team members yet"
                : `${activeTeamMembers.length} member${activeTeamMembers.length !== 1 ? "s" : ""}`
          }
          icon={UsersIcon}
          stats={activeTeamMembers.length > 0 ? `${activeTeamMembers.length}` : undefined}
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
          description={
            tasks.length === 0
              ? "No hay actividades programadas"
              : `${tasks.length} actividad${tasks.length !== 1 ? "es" : ""} programada${tasks.length !== 1 ? "s" : ""}`
          }
          icon={CalendarIcon}
          stats={tasks.length > 0 ? `${tasks.length}` : undefined}
          href={`/courses/${course.id}/schedule`}
          color="purple"
        />
      </div>
    </div>
  )
}
