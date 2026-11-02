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
  const [dueDateError, setDueDateError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    setTitleError(!trimmedTitle)
    setDueDateError(!dueDate)
    if (!trimmedTitle || !dueDate) return
    onSubmit({ title: trimmedTitle, dueDate })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Actualiza el nombre o la fecha de entrega."
              : "Programa una actividad para este curso."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Nombre</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(false)
              }}
              placeholder="ej. Taller 1"
              aria-invalid={titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">El nombre es obligatorio.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-due">Fecha de entrega</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                if (dueDateError) setDueDateError(false)
              }}
              aria-invalid={dueDateError}
            />
            {dueDateError && (
              <p className="text-xs text-destructive">
                La fecha de entrega es obligatoria.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{task ? "Guardar" : "Agregar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
