import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import { APA_DOCUMENT_STATUSES, APA_STATUS_LABELS_ES } from "../types"
import type { ApaDocumentStatus, ApaFormDocument } from "../types"

interface DocumentListProps {
  documents: ApaFormDocument[]
  onOpen: (documentId: string) => void
  onCreate: () => void
  onRename: (id: string, title: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ApaDocumentStatus) => void
}

function formatUpdatedAt(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function DocumentList({
  documents,
  onOpen,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
  onStatusChange,
}: DocumentListProps) {
  const [renameTarget, setRenameTarget] = useState<ApaFormDocument | null>(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [renameError, setRenameError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApaFormDocument | null>(null)

  const openRename = (document: ApaFormDocument) => {
    setRenameTarget(document)
    setRenameTitle(document.title)
    setRenameError(null)
  }

  const submitRename = () => {
    if (!renameTarget) return
    const trimmed = renameTitle.trim()
    if (trimmed.length === 0) {
      setRenameError("El título es obligatorio.")
      return
    }
    if (trimmed.length > 200) {
      setRenameError("El título no puede superar los 200 caracteres.")
      return
    }
    onRename(renameTarget.id, trimmed)
    setRenameTarget(null)
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-4" aria-hidden />
          <p className="font-medium">Sin documentos todavía</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Crea tu primer entregable con la plantilla APA por defecto.
        </p>
        <Button onClick={onCreate}>
          <PlusIcon aria-hidden />
          Nuevo entregable
        </Button>
      </div>
    )
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2">
        {documents.map((document) => (
          <li key={document.id}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <button
                  type="button"
                  onClick={() => onOpen(document.id)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <CardTitle className="truncate text-sm">
                    {document.title}
                  </CardTitle>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {document.sections.cover.workTitle.trim().length > 0
                      ? document.sections.cover.workTitle
                      : "Sin título de portada"}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <MoreVerticalIcon />
                    <span className="sr-only">
                      Acciones para {document.title}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onOpen(document.id)}>
                      <FileTextIcon data-icon="inline-start" />
                      Abrir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openRename(document)}>
                      <PencilIcon data-icon="inline-start" />
                      Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(document.id)}>
                      <CopyIcon data-icon="inline-start" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {APA_DOCUMENT_STATUSES.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusChange(document.id, status)}
                      >
                        {document.status === status ? (
                          <CheckIcon data-icon="inline-start" />
                        ) : (
                          <span className="w-4" data-icon="inline-start" aria-hidden />
                        )}
                        Marcar como: {APA_STATUS_LABELS_ES[status]}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(document)}
                      className="text-destructive"
                    >
                      <TrashIcon data-icon="inline-start" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">
                    {APA_STATUS_LABELS_ES[document.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Actualizado el {formatUpdatedAt(document.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar documento</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rename-title">Título</Label>
            <Input
              id="rename-title"
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              aria-invalid={renameError !== null}
              aria-describedby={renameError ? "rename-title-error" : undefined}
            />
            {renameError && (
              <p id="rename-title-error" role="alert" className="text-sm text-destructive">
                {renameError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={submitRename}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminar "{deleteTarget?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el documento y todo su
              contenido. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id)
                setDeleteTarget(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
