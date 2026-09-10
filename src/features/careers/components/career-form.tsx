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
import type { Career, CareerFormData } from "../types"

interface CareerFormProps {
  career?: Career
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CareerFormData) => void
}

export function CareerForm({
  career,
  open,
  onOpenChange,
  onSubmit,
}: CareerFormProps) {
  const [name, setName] = useState(career?.name ?? "")
  const [description, setDescription] = useState(career?.description ?? "")
  const [nameError, setNameError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(true)
      return
    }
    onSubmit({ name: name.trim(), description: description.trim() || undefined })
    setName("")
    setDescription("")
    setNameError(false)
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName(career?.name ?? "")
      setDescription(career?.description ?? "")
      setNameError(false)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{career ? "Edit Career" : "Add Career"}</DialogTitle>
          <DialogDescription>
            {career
              ? "Update your career information."
              : "Create a new career to organize your courses."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="career-name">Name</Label>
            <Input
              id="career-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(false)
              }}
              placeholder="e.g. Software Engineering"
              aria-invalid={nameError}
            />
            {nameError && (
              <p className="text-xs text-destructive">Name is required.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="career-description">Description</Label>
            <Textarea
              id="career-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{career ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
