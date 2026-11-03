import { Link } from "react-router"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DueBadge } from "./due-badge"

export interface DeadlineItem {
  id: string
  title: string
  dueDate: string
  days: number
  courseId: string
  courseName: string
  careerName?: string
}

interface UpcomingDeadlinesProps {
  items: DeadlineItem[]
  /** Name of the course the list is filtered by, if any. */
  filterLabel?: string
  onClearFilter?: () => void
  /** When provided, each row shows a checkbox to mark the activity complete. */
  onComplete?: (id: string) => void
}

export function UpcomingDeadlines({
  items,
  filterLabel,
  onClearFilter,
  onComplete,
}: UpcomingDeadlinesProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="min-w-0 truncate text-base">
          Próximas entregas
          {filterLabel && (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {filterLabel}
            </span>
          )}
        </CardTitle>
        {filterLabel && onClearFilter && (
          <Button variant="ghost" size="sm" onClick={onClearFilter}>
            <XIcon data-icon="inline-start" />
            Ver todas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filterLabel
              ? "Este curso no tiene actividades pendientes."
              : "No hay actividades pendientes. ¡Todo al día!"}
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                {onComplete && (
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => onComplete(item.id)}
                    aria-label={`Marcar "${item.title}" como completada`}
                    title="Marcar como completada"
                  />
                )}
                <Link
                  to={`/courses/${item.courseId}/schedule`}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.courseName}
                      {item.careerName ? ` · ${item.careerName}` : ""} ·{" "}
                      {format(parseISO(item.dueDate), "EEE d MMM", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <DueBadge days={item.days} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
