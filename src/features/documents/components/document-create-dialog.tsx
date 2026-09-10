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

interface DocumentCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string) => void
  isCreating: boolean
}

export function DocumentCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isCreating,
}: DocumentCreateDialogProps) {
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (trimmed.length === 0) {
      setError("El título es obligatorio.")
      return
    }
    if (trimmed.length > 200) {
      setError("El título no puede superar los 200 caracteres.")
      return
    }
    setError(null)
    onSubmit(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo entregable</DialogTitle>
          <DialogDescription>
            Se creará con la plantilla APA por defecto, lista para completar
            por secciones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-title">Título</Label>
            <Input
              id="document-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="p. ej. Ensayo sobre la Revolución Industrial"
              aria-invalid={error !== null}
              aria-describedby={error ? "document-title-error" : undefined}
            />
            {error && (
              <p id="document-title-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando…" : "Crear documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
