import { Button } from "@/components/ui/button"
import { CourseCard } from "./course-card"
import type { CourseWithStats } from "../types"
import type { CourseFormData } from "../types"

interface CourseListProps {
  courses: CourseWithStats[]
  onUpdate: (id: string, data: CourseFormData) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function CourseList({ courses, onUpdate, onDelete, onAdd }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          No courses yet. Add your first course to this career.
        </p>
        <Button onClick={onAdd}>Add Course</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
