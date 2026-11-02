import { useParams } from "react-router"
import { getById } from "@/lib/db"
import { useEffect, useState } from "react"
import type { Course } from "@/features/courses/types"
import { useResources } from "@/features/resources/hooks/use-resources"
import { ResourceList } from "@/features/resources/components/resource-list"

export function CourseResourcesPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [courseLoading, setCourseLoading] = useState(true)

  const {
    resources,
    isLoading,
    filter,
    setFilter,
    createResource,
    updateResource,
    updateReadingProgress,
    toggleCompletion,
    deleteResource,
  } = useResources(courseId ?? "")

  useEffect(() => {
    if (!courseId) {
      setCourseLoading(false)
      return
    }
    setCourseLoading(true)
    getById("courses", courseId)
      .then((c) => {
        setCourse(c ?? null)
      })
      .finally(() => {
        setCourseLoading(false)
      })
  }, [courseId])

  if (courseLoading || !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Recursos</h1>
          <p className="text-sm text-muted-foreground">{course.name}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando recursos...</p>
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <ResourceList
            resources={resources}
            filter={filter}
            onFilterChange={setFilter}
            onAddNote={async (data) => {
              await createResource(data)
            }}
            onAddLink={async (data) => {
              await createResource(data)
            }}
            onAddPDF={async (data) => {
              await createResource(data)
            }}
            onEdit={async (id, data) => {
              if ("type" in data) {
                await updateResource(id, data)
              }
            }}
            onDelete={deleteResource}
            onUpdateProgress={updateReadingProgress}
            onToggleCompletion={toggleCompletion}
          />
        </div>
      )}
    </div>
  )
}
