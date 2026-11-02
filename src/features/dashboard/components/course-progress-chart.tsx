import { cn } from "@/lib/utils"
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

const SEGMENTS = [
  { key: "completed", label: "Completadas", className: "bg-emerald-500" },
  { key: "onTime", label: "Pendientes", className: "bg-sky-500/70" },
  { key: "overdue", label: "Vencidas", className: "bg-destructive" },
] as const

function endLabel(days?: number): string | undefined {
  if (days === undefined) return undefined
  if (days < 0) return "Curso finalizado"
  if (days === 0) return "Termina hoy"
  return `Termina en ${days} día${days !== 1 ? "s" : ""}`
}

interface CourseProgressChartProps {
  courses: CourseOverview[]
  /** Course currently used to filter the deadlines list, if any. */
  selectedId?: string | null
  onSelect?: (courseId: string) => void
}

export function CourseProgressChart({
  courses,
  selectedId,
  onSelect,
}: CourseProgressChartProps) {
  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay cursos. Crea una carrera y agrega tus cursos.
      </p>
    )
  }

  // Common scale so bar lengths are comparable across courses.
  const maxTotal = Math.max(1, ...courses.map((c) => c.pending + c.completed))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 ${s.className}`} />
            {s.label}
          </span>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {courses.map((course) => {
          const values = {
            completed: course.completed,
            onTime: course.pending - course.overdue,
            overdue: course.overdue,
          }
          const total = course.pending + course.completed
          const isSelected = course.id === selectedId
          const tooltip = [
            `${course.completed} completadas · ${values.onTime} pendientes · ${course.overdue} vencidas`,
            endLabel(course.daysToEnd),
            `${course.documentCount} documento${course.documentCount !== 1 ? "s" : ""} APA`,
            isSelected ? "Clic para ver todas las entregas" : "Clic para ver sus entregas",
          ]
            .filter(Boolean)
            .join("\n")

          return (
            <li key={course.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect?.(course.id)}
                title={tooltip}
                className={cn(
                  "grid w-full gap-1.5 border border-transparent p-1 text-left transition-[background-color,opacity] hover:bg-accent/50 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3",
                  isSelected && "border-border bg-accent",
                  selectedId && !isSelected && "opacity-50 hover:opacity-100"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{course.name}</p>
                  {course.careerName && (
                    <p className="truncate text-xs text-muted-foreground">
                      {course.careerName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 bg-muted">
                    <div
                      className="flex h-full"
                      style={{ width: `${(total / maxTotal) * 100}%` }}
                    >
                      {SEGMENTS.map((s) =>
                        values[s.key] > 0 ? (
                          <div
                            key={s.key}
                            className={s.className}
                            style={{ width: `${(values[s.key] / total) * 100}%` }}
                          />
                        ) : null
                      )}
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {course.completed}/{total}
                  </span>
                </div>

                <div className="sm:w-36 sm:text-right">
                  {course.nextTask ? (
                    <DueBadge days={course.nextTask.days} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin pendientes</span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
