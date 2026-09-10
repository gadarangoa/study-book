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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Course, CourseFormData } from "../types"
import { formatTagsValue, parseTagsInput } from "../lib/tags"

interface CourseFormProps {
  careerId: string
  course?: Course
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CourseFormData) => void
}

export function CourseForm({
  careerId,
  course,
  open,
  onOpenChange,
  onSubmit,
}: CourseFormProps) {
  const [name, setName] = useState(course?.name ?? "")
  const [teacher, setTeacher] = useState(course?.teacher ?? "")
  const [description, setDescription] = useState(course?.description ?? "")
  const [schedule, setSchedule] = useState(course?.schedule ?? "")
  const [startDate, setStartDate] = useState(course?.startDate ?? "")
  const [endDate, setEndDate] = useState(course?.endDate ?? "")
  const [tagsInput, setTagsInput] = useState(() =>
    course?.tags ? formatTagsValue(course.tags) : ""
  )
  const [nameError, setNameError] = useState(false)

  const previewTags = parseTagsInput(tagsInput)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(true)
      return
    }
    onSubmit({
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      description: description.trim() || undefined,
      schedule: schedule.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tags: previewTags,
    })
    setName("")
    setTeacher("")
    setDescription("")
    setSchedule("")
    setStartDate("")
    setEndDate("")
    setTagsInput("")
    setNameError(false)
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName(course?.name ?? "")
      setTeacher(course?.teacher ?? "")
      setDescription(course?.description ?? "")
      setSchedule(course?.schedule ?? "")
      setStartDate(course?.startDate ?? "")
      setEndDate(course?.endDate ?? "")
      setTagsInput(course?.tags ? formatTagsValue(course.tags) : "")
      setNameError(false)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Add Course"}</DialogTitle>
          <DialogDescription>
            {course
              ? "Update the course information."
              : "Add a new course to this career."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-name">Name</Label>
            <Input
              id="course-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(false)
              }}
              placeholder="e.g. Data Structures"
              aria-invalid={nameError}
            />
            {nameError && (
              <p className="text-xs text-destructive">Name is required.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-teacher">Teacher</Label>
            <Input
              id="course-teacher"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Optional teacher name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-schedule">Schedule</Label>
            <Input
              id="course-schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Mon/Wed/Fri 08:00-10:00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="course-start-date">Start Date</Label>
              <Input
                id="course-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="course-end-date">End Date</Label>
              <Input
                id="course-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-tags">Tags</Label>
            <Input
              id="course-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. programacion, matematicas, avanzado"
            />
            <p className="text-xs text-muted-foreground">
              Separate with commas. Max 10 tags, lowercase.
            </p>
            {previewTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {previewTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{course ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
