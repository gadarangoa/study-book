import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { TaskItem } from "./task-item"
import type { Task } from "../types"

interface TaskListProps {
  pendingTasks: Task[]
  completedTasks: Task[]
  onAdd: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskList({
  pendingTasks,
  completedTasks,
  onAdd,
  onToggle,
  onDelete,
}: TaskListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Pending</h4>
          <Button variant="outline" size="sm" onClick={onAdd}>
            <PlusIcon data-icon="inline-start" />
            Add Task
          </Button>
        </div>
        {pendingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending tasks.</p>
        ) : (
          pendingTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
