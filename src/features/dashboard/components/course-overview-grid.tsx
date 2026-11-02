import { Link } from "react-router"
import { FileTextIcon, FlagIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DueBadge } from "./due-badge"

export interface CourseOverview {
  id: string
  name: string
  careerName?: string
  pending: number
  completed: number
  overdue: number
  nextTask?: { title: string; days: number }
  daysToEnd?: number
  documentCount: number
}

export function CourseOverviewGrid({ courses }: { courses: CourseOverview[] }) {
  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay cursos. Crea una carrera y agrega tus cursos.
      </p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const total = course.pending + course.completed
        return (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="truncate text-sm">{course.name}</CardTitle>
                {course.careerName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {course.careerName}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Próxima entrega</p>
                  {course.nextTask ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm">{course.nextTask.title}</span>
                      <DueBadge days={course.nextTask.days} />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin actividades pendientes
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {course.completed}/{total} actividades completadas
                    </span>
                    {course.overdue > 0 && (
                      <span className="text-destructive">
                        {course.overdue} vencida{course.overdue !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <Progress value={total ? (course.completed / total) * 100 : 0} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {course.daysToEnd !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <FlagIcon className="size-3" />
                      {course.daysToEnd < 0
                        ? "Curso finalizado"
                        : course.daysToEnd === 0
                          ? "Termina hoy"
                          : `Termina en ${course.daysToEnd} día${course.daysToEnd !== 1 ? "s" : ""}`}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <FileTextIcon className="size-3" />
                    {course.documentCount} documento{course.documentCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
