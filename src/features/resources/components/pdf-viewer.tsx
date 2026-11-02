import { useEffect, useState } from "react"
import { getPDFBytes } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Download, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Resource } from "../types"

interface PDFViewerProps {
  resource: Resource
  open: boolean
  onOpenChange: (open: boolean) => void
  onProgressChange?: (progress: number) => void
  onToggleCompletion?: () => void
}

export function PDFViewer({
  resource,
  open,
  onOpenChange,
  onProgressChange,
  onToggleCompletion,
}: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !resource.storagePath) return

    const loadPDF = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const bytes = await getPDFBytes(resource.storagePath!)
        const blob = new Blob([bytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el PDF"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadPDF()

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [open, resource.storagePath])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative w-full max-w-4xl h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{resource.title}</h2>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {resource.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando PDF...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {pdfUrl && (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-4">
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Progreso de lectura</label>
                <span className="text-sm text-muted-foreground">
                  {resource.readingProgress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={resource.readingProgress ?? 0}
                onChange={(e) => {
                  const progress = parseInt(e.target.value)
                  onProgressChange?.(progress)
                }}
                className="w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = pdfUrl || ""
                  link.download = resource.fileName || "documento.pdf"
                  link.click()
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>

              <Button
                size="sm"
                variant={resource.isCompleted ? "default" : "outline"}
                onClick={onToggleCompletion}
              >
                {resource.isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcado como completado
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como completado
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
