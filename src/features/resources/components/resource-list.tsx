import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVerticalIcon, PencilIcon, TrashIcon, PlusIcon } from "lucide-react"
import type { Resource } from "../types"
import { NoteForm } from "./note-form"
import { LinkForm } from "./link-form"
import type { NoteFormData, LinkFormData } from "../types"

interface ResourceListProps {
  resources: Resource[]
  filter?: "note" | "link"
  onFilterChange: (filter: "note" | "link" | undefined) => void
  onAddNote: (data: NoteFormData) => void
  onAddLink: (data: LinkFormData) => void
  onEdit: (id: string, data: NoteFormData | LinkFormData) => void
  onDelete: (id: string) => void
}

export function ResourceList({
  resources,
  filter,
  onFilterChange,
  onAddNote,
  onAddLink,
  onEdit,
  onDelete,
}: ResourceListProps) {
  const [noteFormOpen, setNoteFormOpen] = useState(false)
  const [linkFormOpen, setLinkFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | undefined>()

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    if (resource.type === "note") setNoteFormOpen(true)
    else setLinkFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
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
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resources yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant={resource.type === "note" ? "secondary" : "outline"}>
                  {resource.type}
                </Badge>
                <span className="truncate text-sm">{resource.title}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <MoreVerticalIcon />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { setEditingResource(undefined); setNoteFormOpen(true) }}>
          <PlusIcon data-icon="inline-start" />
          Note
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setEditingResource(undefined); setLinkFormOpen(true) }}>
          <PlusIcon data-icon="inline-start" />
          Link
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
    </div>
  )
}
