import { useState } from "react"
import { Link } from "react-router"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PencilIcon, MoreVerticalIcon, TrashIcon } from "lucide-react"
import type { CourseWithStats } from "../types"
import type { CourseFormData } from "../types"
import { CourseForm } from "./course-form"

interface CourseCardProps {
  course: CourseWithStats
  onUpdate: (id: string, data: CourseFormData) => void
  onDelete: (id: string) => void
}

export function CourseCard({ course, onUpdate, onDelete }: CourseCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <Link
            to={`/courses/${course.id}`}
            className="flex-1 min-w-0"
          >
            <CardTitle className="text-sm truncate">{course.name}</CardTitle>
            {course.teacher && (
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {course.teacher}
              </p>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreVerticalIcon />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <PencilIcon data-icon="inline-start" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive"
              >
                <TrashIcon data-icon="inline-start" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {course.pendingTaskCount > 0 && (
              <Badge variant="outline">
                {course.pendingTaskCount} pending{" "}
                {course.pendingTaskCount === 1 ? "task" : "tasks"}
              </Badge>
            )}
            {(course.tags ?? []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {(course.tags?.length ?? 0) > 3 && (
              <Badge variant="ghost">+{(course.tags?.length ?? 0) - 3}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <CourseForm
        careerId={course.careerId}
        course={course}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={(data) => onUpdate(course.id, data)}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{course.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this course and all its resources,
              tasks, partners, and schedule entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(course.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
