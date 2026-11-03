import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { TaskItem } from "./task-item"
import type { Task } from "../types"
import { getTaskStatus, type TaskDisplayStatus } from "../lib/status"

interface TaskListProps {
  tasks: Task[]
  onAdd: () => void
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const STATUS_ORDER: Record<TaskDisplayStatus, number> = {
  overdue: 0,
  pending: 1,
  complete: 2,
}

function byDueDate(a: Task, b: Task) {
  if (!a.dueDate) return b.dueDate ? 1 : 0
  if (!b.dueDate) return -1
  return a.dueDate.localeCompare(b.dueDate)
}

export function TaskList({
  tasks,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps) {
  const today = new Date()
  const items = tasks
    .map((task) => ({ task, status: getTaskStatus(task, today) }))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        byDueDate(a.task, b.task)
    )
  const count = (s: TaskDisplayStatus) =>
    items.filter((i) => i.status === s).length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={onAdd} className="w-fit">
          <PlusIcon data-icon="inline-start" />
          Nueva actividad
        </Button>
        {items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {count("pending")} pendientes · {count("overdue")} vencidas ·{" "}
            {count("complete")} completadas
          </p>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay actividades programadas.
        </p>
      ) : (
        items.map(({ task, status }) => (
          <TaskItem
            key={task.id}
            task={task}
            status={status}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  )
}
