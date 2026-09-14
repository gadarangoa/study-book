import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { EmbeddedImageInput } from "../lib/development-content"

interface DevelopmentImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (input: EmbeddedImageInput) => Promise<void>
  mode?: "insert" | "edit"
  initialAlt?: string
  initialTitle?: string
  onUpdate?: (patch: { alt: string; title: string }) => Promise<void>
}

export function DevelopmentImageDialog({
  open,
  onOpenChange,
  onInsert,
  mode = "insert",
  initialAlt = "",
  initialTitle = "",
  onUpdate,
}: DevelopmentImageDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState(initialAlt)
  const [title, setTitle] = useState(initialTitle)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === "insert" && !file) {
      setError("Selecciona una imagen para continuar.")
      return
    }
    setError(null)
    setIsSaving(true)
    try {
      if (mode === "edit") {
        if (!onUpdate) throw new Error("No se pudo actualizar la imagen.")
        await onUpdate({ alt, title })
      } else {
        if (!file) throw new Error("Selecciona una imagen para continuar.")
        await onInsert({ file, alt, title })
      }
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo insertar la imagen.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar imagen" : "Insertar imagen"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Actualiza la descripción de la imagen seleccionada."
              : "Usa PNG, JPEG o WebP de hasta 5 MB. La imagen se conservará dentro del documento."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "insert" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="development-image-file">Archivo de imagen</Label>
              <Input
                id="development-image-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="development-image-alt">Texto alternativo</Label>
            <Input
              id="development-image-alt"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Describe la imagen"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="development-image-title">Título opcional</Label>
            <Input
              id="development-image-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título de la figura"
            />
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Insertar imagen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
