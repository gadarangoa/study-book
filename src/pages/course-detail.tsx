import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { getById } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { CourseLanding } from "@/features/courses/components/course-landing"
import { useScheduleEntries } from "@/features/courses/hooks/use-schedule-entries"
import { useResources } from "@/features/resources/hooks/use-resources"
import { useTasks } from "@/features/tasks/hooks/use-tasks"
import { usePartners } from "@/features/partners/hooks/use-partners"
import { useApaDocuments } from "@/features/documents/hooks/useApaDocuments"
import { DocumentCreateDialog } from "@/features/documents/components/document-create-dialog"

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const { entries: scheduleEntries } = useScheduleEntries(courseId ?? "")
  const { resources } = useResources(courseId ?? "")
  const { tasks } = useTasks(courseId ?? "")
  const { partners } = usePartners(courseId ?? "")
  const { documents, createDocument } = useApaDocuments(courseId ?? "")

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
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to={`/careers/${course.careerId}`} />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back to career</span>
        </Button>
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
        tasks={tasks}
        partners={partners}
      />

      <section
        aria-labelledby="apa-documents-heading"
        className="flex flex-col gap-3 rounded-lg border p-4"
      >
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-4" aria-hidden />
          <h2 id="apa-documents-heading" className="text-lg font-semibold">
            Documentos APA
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {documents.length === 0
            ? "Crea tu primer entregable con la plantilla APA por defecto."
            : `${documents.length} documento${documents.length !== 1 ? "s" : ""} en este curso.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon aria-hidden />
            Nuevo entregable
          </Button>
          {documents.length > 0 ? (
            <Button
              variant="outline"
              render={<Link to={`/courses/${course.id}/documents`} />}
            >
              Ver documentos
            </Button>
          ) : (
            <Button
              variant="outline"
              render={<Link to={`/courses/${course.id}/documents`} />}
            >
              Ir a documentos
            </Button>
          )}
        </div>
      </section>

      <DocumentCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isCreating={isCreating}
        onSubmit={(title) => {
          if (!courseId || !course) return
          setIsCreating(true)
          createDocument(course.name, title)
            .then((created) => {
              setIsCreateOpen(false)
              navigate(`/courses/${courseId}/documents/${created.id}`)
            })
            .finally(() => setIsCreating(false))
        }}
      />
    </div>
  )
}
