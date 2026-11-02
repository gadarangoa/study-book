import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { TaskItem } from "./task-item"
import type { Task } from "../types"

interface TaskListProps {
  tasks: Task[]
  onAdd: () => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function byDueDate(a: Task, b: Task) {
  if (!a.dueDate) return b.dueDate ? 1 : 0
  if (!b.dueDate) return -1
  return a.dueDate.localeCompare(b.dueDate)
}

export function TaskList({ tasks, onAdd, onEdit, onDelete }: TaskListProps) {
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" onClick={onAdd} className="w-fit">
        <PlusIcon data-icon="inline-start" />
        Nueva actividad
      </Button>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay actividades programadas.
        </p>
      ) : (
        [...tasks]
          .sort(byDueDate)
          .map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
      )}
    </div>
  )
}
