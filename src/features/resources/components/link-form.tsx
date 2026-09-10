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
import type { Resource, LinkFormData } from "../types"

interface LinkFormProps {
  resource?: Resource
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LinkFormData) => void
}

export function LinkForm({ resource, open, onOpenChange, onSubmit }: LinkFormProps) {
  const [title, setTitle] = useState(resource?.title ?? "")
  const [url, setUrl] = useState(resource?.url ?? "")
  const [description, setDescription] = useState(resource?.description ?? "")
  const [titleError, setTitleError] = useState(false)
  const [urlError, setUrlError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false
    if (!title.trim()) {
      setTitleError(true)
      hasError = true
    }
    if (!url.trim()) {
      setUrlError(true)
      hasError = true
    }
    if (hasError) return
    onSubmit({
      type: "link",
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
    })
    setTitle("")
    setUrl("")
    setDescription("")
    setTitleError(false)
    setUrlError(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{resource ? "Edit Link" : "Add Link"}</DialogTitle>
          <DialogDescription>Add a link to this course.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-title">Title</Label>
            <Input
              id="link-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(false)
              }}
              placeholder="Link title"
              aria-invalid={titleError}
            />
            {titleError && (
              <p className="text-xs text-destructive">Title is required.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (urlError) setUrlError(false)
              }}
              placeholder="https://..."
              aria-invalid={urlError}
            />
            {urlError && (
              <p className="text-xs text-destructive">URL is required.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-description">Description</Label>
            <Textarea
              id="link-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
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
