import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { getById } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { useTasks, type Task, type TaskFormData } from "@/features/tasks"
import { TaskForm } from "@/features/tasks/components/task-form"
import { TaskList } from "@/features/tasks/components/task-list"

export function CourseSchedulePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()

  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(
    courseId ?? ""
  )

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

  if (!course) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  const openForm = (task?: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
    } else {
      createTask(data)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Actividades</h1>
          <p className="text-sm text-muted-foreground">{course.name}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando actividades...</p>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onAdd={() => openForm()}
          onEdit={openForm}
          onDelete={deleteTask}
        />
      )}

      {/* Mounted per open so the form state always starts from the selected task. */}
      {formOpen && (
        <TaskForm
          task={editingTask}
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
