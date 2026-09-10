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
import { Textarea } from "@/components/ui/textarea"
import type { Resource, NoteFormData } from "../types"

interface NoteFormProps {
  resource?: Resource
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: NoteFormData) => void
}

export function NoteForm({ resource, open, onOpenChange, onSubmit }: NoteFormProps) {
  const [title, setTitle] = useState(resource?.title ?? "")
  const [content, setContent] = useState(resource?.content ?? "")
  const [titleError, setTitleError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    onSubmit({ type: "note", title: title.trim(), content: content.trim() || undefined })
    setTitle("")
    setContent("")
    setTitleError(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{resource ? "Edit Note" : "Add Note"}</DialogTitle>
          <DialogDescription>Add a note to this course.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(false)
              }}
              placeholder="Note title"
              aria-invalid={titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">Title is required.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content"
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{resource ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
