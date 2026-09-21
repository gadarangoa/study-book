import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVerticalIcon, PencilIcon, TrashIcon, PlusIcon, FileText, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Resource } from "../types"
import { NoteForm } from "./note-form"
import { LinkForm } from "./link-form"
import { PDFForm } from "./pdf-form"
import { PDFViewer } from "./pdf-viewer"
import type { NoteFormData, LinkFormData, PDFFormData } from "../types"

interface ResourceListProps {
  resources: Resource[]
  filter?: "note" | "link" | "pdf"
  onFilterChange: (filter: "note" | "link" | "pdf" | undefined) => void
  onAddNote: (data: NoteFormData) => void
  onAddLink: (data: LinkFormData) => void
  onAddPDF: (data: PDFFormData) => void
  onEdit: (id: string, data: NoteFormData | LinkFormData) => void
  onDelete: (id: string) => void
  onUpdateProgress?: (id: string, progress: number) => void
  onToggleCompletion?: (id: string) => void
}

export function ResourceList({
  resources,
  filter,
  onFilterChange,
  onAddNote,
  onAddLink,
  onAddPDF,
  onEdit,
  onDelete,
  onUpdateProgress,
  onToggleCompletion,
}: ResourceListProps) {
  const [noteFormOpen, setNoteFormOpen] = useState(false)
  const [linkFormOpen, setLinkFormOpen] = useState(false)
  const [pdfFormOpen, setPdfFormOpen] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [viewingPdf, setViewingPdf] = useState<Resource | undefined>()
  const [editingResource, setEditingResource] = useState<Resource | undefined>()

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    if (resource.type === "note") setNoteFormOpen(true)
    else if (resource.type === "link") setLinkFormOpen(true)
    else if (resource.type === "pdf") setPdfFormOpen(true)
  }

  const getBadgeVariant = (type: string) => {
    if (type === "note") return "secondary"
    if (type === "link") return "outline"
    if (type === "pdf") return "default"
    return "outline"
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        <Button
          variant={filter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(undefined)}
        >
          All
        </Button>
        <Button
          variant={filter === "note" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("note")}
        >
          Notes
        </Button>
        <Button
          variant={filter === "link" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("link")}
        >
          Links
        </Button>
        <Button
          variant={filter === "pdf" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("pdf")}
        >
          PDFs
        </Button>
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resources yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-md border px-3 py-3 space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <Badge variant={getBadgeVariant(resource.type)}>
                    {resource.type === "pdf" ? (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </>
                    ) : (
                      resource.type
                    )}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    {resource.type === "pdf" ? (
                      <button
                        onClick={() => {
                          setViewingPdf(resource)
                          setPdfViewerOpen(true)
                        }}
                        className="truncate text-sm font-medium hover:underline text-left"
                      >
                        {resource.title}
                      </button>
                    ) : (
                      <span className="truncate text-sm font-medium">
                        {resource.title}
                      </span>
                    )}
                    {resource.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {resource.description}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                    <MoreVerticalIcon />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {resource.type === "pdf" && (
                      <DropdownMenuItem
                        onClick={() => {
                          setViewingPdf(resource)
                          setPdfViewerOpen(true)
                        }}
                      >
                        <FileText data-icon="inline-start" />
                        Ver
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleEdit(resource)}>
                      <PencilIcon data-icon="inline-start" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(resource.id)}
                      className="text-destructive"
                    >
                      <TrashIcon data-icon="inline-start" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {resource.type === "pdf" && (
                <div className="pl-9 space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{resource.readingProgress ?? 0}%</span>
                    </div>
                    <Progress value={resource.readingProgress ?? 0} className="h-1.5" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        setViewingPdf(resource)
                        setPdfViewerOpen(true)
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Ver PDF
                    </Button>
                    <Button
                      size="xs"
                      variant={resource.isCompleted ? "default" : "outline"}
                      onClick={() => onToggleCompletion?.(resource.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {resource.isCompleted ? "Completado" : "Marcar"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => { setEditingResource(undefined); setNoteFormOpen(true) }}>
          <PlusIcon data-icon="inline-start" />
          Note
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setEditingResource(undefined); setLinkFormOpen(true) }}>
          <PlusIcon data-icon="inline-start" />
          Link
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setEditingResource(undefined); setPdfFormOpen(true) }}>
          <PlusIcon data-icon="inline-start" />
          PDF
        </Button>
      </div>

      <NoteForm
        resource={editingResource}
        open={noteFormOpen}
        onOpenChange={setNoteFormOpen}
        onSubmit={(data) => {
          if (editingResource) onEdit(editingResource.id, data)
          else onAddNote(data)
          setEditingResource(undefined)
        }}
      />
      <LinkForm
        resource={editingResource}
        open={linkFormOpen}
        onOpenChange={setLinkFormOpen}
        onSubmit={(data) => {
          if (editingResource) onEdit(editingResource.id, data)
          else onAddLink(data)
          setEditingResource(undefined)
        }}
      />
      <PDFForm
        resource={editingResource}
        open={pdfFormOpen}
        onOpenChange={setPdfFormOpen}
        onSubmit={async (data) => {
          if (editingResource) {
            // Note: PDF updates require re-uploading the file
            await onAddPDF(data)
          } else {
            await onAddPDF(data)
          }
          setEditingResource(undefined)
        }}
      />
      {viewingPdf && (
        <PDFViewer
          resource={viewingPdf}
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          onProgressChange={(progress) => {
            onUpdateProgress?.(viewingPdf.id, progress)
          }}
          onToggleCompletion={() => {
            onToggleCompletion?.(viewingPdf.id)
          }}
        />
      )}
    </div>
  )
}
