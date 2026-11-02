import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"
import type { Task } from "../types"

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm">{task.title}</p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Entrega: {format(parseISO(task.dueDate), "d MMM yyyy", { locale: es })}
          </p>
        )}
      </div>
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
