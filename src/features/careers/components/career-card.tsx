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
  CardDescription,
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
import type { CareerWithStats } from "../types"
import { CareerForm } from "./career-form"
import type { CareerFormData } from "../types"

interface CareerCardProps {
  career: CareerWithStats
  onUpdate: (id: string, data: CareerFormData) => void
  onDelete: (id: string) => void
}

export function CareerCard({ career, onUpdate, onDelete }: CareerCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <Link
            to={`/careers/${career.id}`}
            className="flex-1 min-w-0"
          >
            <CardTitle className="text-base truncate">{career.name}</CardTitle>
            {career.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {career.description}
              </CardDescription>
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
          <div className="flex gap-2">
            <Badge variant="secondary">
              {career.courseCount} {career.courseCount === 1 ? "course" : "courses"}
            </Badge>
            {career.totalPendingTasks > 0 && (
              <Badge variant="outline">
                {career.totalPendingTasks} pending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <CareerForm
        career={career}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={(data) => onUpdate(career.id, data)}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{career.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this career and all its{" "}
              {career.courseCount} {career.courseCount === 1 ? "course" : "courses"}{" "}
              along with all associated resources, tasks, and partners. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(career.id)}
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
