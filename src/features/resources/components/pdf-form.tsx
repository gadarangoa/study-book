import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Resource, PDFFormData } from "../types"

interface PDFFormProps {
  resource?: Resource
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PDFFormData) => Promise<void>
}

export function PDFForm({
  resource,
  open,
  onOpenChange,
  onSubmit,
}: PDFFormProps) {
  const [title, setTitle] = useState(resource?.title ?? "")
  const [description, setDescription] = useState(resource?.description ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Por favor selecciona un archivo PDF")
        setFile(null)
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("El archivo debe ser menor a 50MB")
        setFile(null)
        return
      }
      setError(null)
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("El título es requerido")
      return
    }
    if (!file && !resource) {
      setError("Debes seleccionar un archivo PDF")
      return
    }
    if (!file && resource) {
      setError("Debes seleccionar un nuevo archivo PDF para actualizar")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        type: "pdf",
        title: title.trim(),
        description: description.trim() || undefined,
        file: file!,
      })
      setTitle("")
      setDescription("")
      setFile(null)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {resource ? "Actualizar PDF" : "Agregar PDF"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Capítulo 1 - Introducción"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional: descripción del recurso"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="pdf-file">Archivo PDF *</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
                  <FileIcon className="h-4 w-4" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Subiendo..." : resource ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
