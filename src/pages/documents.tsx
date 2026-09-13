import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, PlusIcon } from "lucide-react"
import { getById } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { useApaDocuments } from "@/features/documents/hooks/useApaDocuments"
import { DocumentList } from "@/features/documents/components/document-list"
import { DocumentCreateDialog } from "@/features/documents/components/document-create-dialog"

export function DocumentsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    documents,
    isLoading,
    createDocument,
    renameDocument,
    duplicateDocument,
    deleteDocument,
    changeStatus,
  } = useApaDocuments(courseId ?? "")

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

  const runAction = (action: () => Promise<unknown>, failureMessage: string) => {
    setActionError(null)
    action().catch(() => setActionError(failureMessage))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to={courseId ? `/courses/${courseId}` : "/dashboard"} />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Volver al curso</span>
        </Button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="truncate text-xl font-semibold">Documentos</h1>
          {course && (
            <p className="text-sm text-muted-foreground">{course.name}</p>
          )}
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon aria-hidden />
          Nuevo entregable
        </Button>
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Cargando documentos…</p>
      ) : (
        <DocumentList
          documents={documents}
          onOpen={(id) => navigate(`/courses/${courseId}/documents/${id}`)}
          onCreate={() => setIsCreateOpen(true)}
          onRename={(id, title) =>
            runAction(() => renameDocument(id, title), "No se pudo renombrar el documento.")
          }
          onDuplicate={(id) =>
            runAction(() => duplicateDocument(id), "No se pudo duplicar el documento.")
          }
          onDelete={(id) =>
            runAction(() => deleteDocument(id), "No se pudo eliminar el documento.")
          }
          onStatusChange={(id, status) =>
            runAction(
              () => changeStatus(id, status),
              "No se pudo cambiar el estado del documento."
            )
          }
        />
      )}

      <DocumentCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isCreating={isCreating}
        onSubmit={(title) => {
          if (!courseId || !course) return
          setIsCreating(true)
          createDocument(course.name, title, course.teacher ?? "")
            .then((created) => {
              setIsCreateOpen(false)
              navigate(`/courses/${courseId}/documents/${created.id}`)
            })
            .catch(() =>
              setActionError("No se pudo crear el documento.")
            )
            .finally(() => setIsCreating(false))
        }}
      />
    </div>
  )
}
