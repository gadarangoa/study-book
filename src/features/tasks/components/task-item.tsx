import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PencilIcon, TrashIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "../types"
import {
  TASK_STATUS_CLASSES,
  TASK_STATUS_LABELS,
  type TaskDisplayStatus,
} from "../lib/status"

interface TaskItemProps {
  task: Task
  status: TaskDisplayStatus
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskItem({
  task,
  status,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const isComplete = status === "complete"
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <Checkbox
        checked={isComplete}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={
          isComplete ? "Marcar como pendiente" : "Marcar como completada"
        }
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm",
            isComplete && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Entrega:{" "}
            {format(parseISO(task.dueDate), "d MMM yyyy", { locale: es })}
          </p>
        )}
      </div>
      <span
        className={cn(
          "inline-flex h-5 shrink-0 items-center px-2 text-xs font-medium",
          TASK_STATUS_CLASSES[status]
        )}
      >
        {TASK_STATUS_LABELS[status]}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(task)}>
        <PencilIcon />
        <span className="sr-only">Editar</span>
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(task.id)}>
        <TrashIcon />
        <span className="sr-only">Eliminar</span>
      </Button>
    </div>
  )
}
