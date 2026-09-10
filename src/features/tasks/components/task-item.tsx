import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TrashIcon } from "lucide-react"
import type { Task } from "../types"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <Checkbox
        checked={task.status === "complete"}
        onCheckedChange={() => onToggle(task.id)}
      />
      <div className="flex-1 min-w-0">
        <span
          className={
            task.status === "complete"
              ? "text-sm text-muted-foreground line-through"
              : "text-sm"
          }
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span className="ml-2 text-xs text-muted-foreground">
            Due {task.dueDate}
          </span>
        )}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(task.id)}>
        <TrashIcon />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  )
}
