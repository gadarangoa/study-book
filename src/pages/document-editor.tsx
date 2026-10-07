import { Link, useParams } from "react-router"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon } from "lucide-react"
import { getById } from "@/lib/db"
import type { Course } from "@/features/courses/types"
import { useApaFormDocument } from "@/features/documents/hooks/useApaFormDocument"
import { useTeamMembers } from "@/features/collaboration/hooks/use-team-members"
import { ApaPageStyle } from "@/features/documents/components/apa-pdf-preview"
import { ApaFormEditor } from "@/features/documents/components/apa-form-editor"
import { APA_STATUS_LABELS_ES } from "@/features/documents/types"

export function DocumentEditorPage() {
  const { courseId, documentId } = useParams<{
    courseId: string
    documentId: string
  }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExportingDocx, setIsExportingDocx] = useState(false)
  const prefilledTeacherRef = useRef<string | null>(null)
  const { document, isLoading, saveState, updateSections, updateFields, retrySave } =
    useApaFormDocument(documentId ?? "")
  const { members: teamMembers } = useTeamMembers(courseId ?? "")
  const authorEligibleMembers = teamMembers.filter((m) => m.status !== "revoked")

  useEffect(() => {
    if (!courseId) return
    getById("courses", courseId).then((c) => {
      setCourse(c ?? null)
    })
  }, [courseId])

  // Pre-fill the cover teacher from the course when the document has none.
  useEffect(() => {
    if (!document || !course || prefilledTeacherRef.current === document.id) {
      return
    }
    prefilledTeacherRef.current = document.id
    const courseTeacher = course.teacher?.trim() ?? ""
    if (
      courseTeacher.length > 0 &&
      document.sections.cover.teacherName.trim().length === 0
    ) {
      updateSections({
        cover: { ...document.sections.cover, teacherName: courseTeacher },
      })
    }
  }, [document, course, updateSections])

  const handleExportPdf = () => {
    setExportError(null)
    // Flush any pending autosave so the PDF matches the latest edits.
    void retrySave()
      .then(() => {
        try {
          window.print()
        } catch {
          setExportError(
            "No se pudo abrir el diálogo de impresión. Revisa el bloqueador de ventanas emergentes e inténtalo de nuevo."
          )
        }
      })
      .catch(() => {
        setExportError(
          "No se pudo guardar el documento antes de exportar. Reintenta el guardado y vuelve a exportar."
        )
      })
  }

  const handleExportDocx = () => {
    setExportError(null)
    setIsExportingDocx(true)
    // Flush any pending autosave so the Word export matches the latest edits.
    void retrySave()
      .catch(() => {
        throw new Error(
          "No se pudo guardar el documento antes de exportar. Reintenta el guardado y vuelve a exportar."
        )
      })
      // Code-split: the docx library is only needed when actually exporting.
      .then(() => import("@/features/documents/lib/apa-docx"))
      .then(({ buildApaDocxBlob, docxFileName }) => {
        if (!document) return null
        return buildApaDocxBlob(document).then((blob) => ({
          blob,
          fileName: docxFileName(document.title),
        }))
      })
      .then((result) => {
        if (!result) return
        const url = URL.createObjectURL(result.blob)
        const link = window.document.createElement("a")
        link.href = url
        link.download = `${result.fileName}.docx`
        link.click()
        URL.revokeObjectURL(url)
      })
      .catch((error: unknown) => {
        setExportError(
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo Word. Inténtalo de nuevo."
        )
      })
      .finally(() => {
        setIsExportingDocx(false)
      })
  }

  const wrongCourse =
    document !== undefined && courseId !== undefined && document.courseId !== courseId

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to={courseId ? `/courses/${courseId}` : "/dashboard"} />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Volver al curso</span>
        </Button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold">
              {document?.title ?? (isLoading ? "Cargando…" : "Documento no encontrado")}
            </h1>
            {document && (
              <Badge variant="secondary">{APA_STATUS_LABELS_ES[document.status]}</Badge>
            )}
          </div>
          {course && (
            <p className="text-sm text-muted-foreground">{course.name}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="no-print text-muted-foreground">Cargando documento…</p>
      ) : !document || wrongCourse ? (
        <div className="no-print flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Este documento no existe o no pertenece a este curso.
          </p>
          <Button
            variant="outline"
            className="w-fit"
            render={<Link to={courseId ? `/courses/${courseId}` : "/dashboard"} />}
          >
            Volver al curso
          </Button>
        </div>
      ) : (
        <>
          <p className="no-print text-xs text-muted-foreground">
            Basado en la plantilla APA 7.ª ed. (español), versión{" "}
            {document.templateVersion}.
          </p>
          {exportError && (
            <div className="no-print flex flex-wrap items-center gap-2">
              <p role="alert" className="text-sm text-destructive">
                {exportError}
              </p>
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                Reintentar exportación
              </Button>
            </div>
          )}
          <ApaFormEditor
            document={document}
            saveState={saveState}
            teamMembers={authorEligibleMembers}
            onSectionChange={updateSections}
            onPageSizeChange={(pageSize) => updateFields({ pageSize })}
            onFormatChange={(patch) => updateFields(patch)}
            onRetrySave={() => void retrySave()}
            onExportPdf={handleExportPdf}
            onExportDocx={handleExportDocx}
            isExportingDocx={isExportingDocx}
          />
          <ApaPageStyle pageSize={document.pageSize} />
        </>
      )}
    </div>
  )
}
