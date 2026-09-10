import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Task, TaskFormData } from "../types"

interface TaskFormProps {
  task?: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskFormData) => void
}

export function TaskForm({ task, open, onOpenChange, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "")
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "")
  const [titleError, setTitleError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    onSubmit({ title: title.trim(), dueDate: dueDate || undefined })
    setTitle("")
    setDueDate("")
    setTitleError(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details." : "Add a new task to this course."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(false)
              }}
              placeholder="e.g. Assignment 1"
              aria-invalid={titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">Title is required.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-due">Due Date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
