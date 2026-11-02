import type { LucideIcon } from "lucide-react"
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ListTodoIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatTilesProps {
  overdue: number
  dueThisWeek: number
  pending: number
  completed: number
}

interface TileProps {
  label: string
  value: number
  icon: LucideIcon
  tone?: string
}

function Tile({ label, value, icon: Icon, tone }: TileProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className={cn("text-2xl font-semibold tabular-nums", tone)}>
            {value}
          </p>
        </div>
        <Icon className={cn("size-5 shrink-0 text-muted-foreground", tone)} />
      </CardContent>
    </Card>
  )
}

export function StatTiles({
  overdue,
  dueThisWeek,
  pending,
  completed,
}: StatTilesProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Vencidas"
        value={overdue}
        icon={AlertTriangleIcon}
        tone={overdue > 0 ? "text-destructive" : undefined}
      />
      <Tile
        label="Vencen en 7 días"
        value={dueThisWeek}
        icon={CalendarClockIcon}
        tone={dueThisWeek > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
      />
      <Tile label="Pendientes" value={pending} icon={ListTodoIcon} />
      <Tile label="Completadas" value={completed} icon={CheckCircle2Icon} />
    </div>
  )
}
