import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TeamMember } from "@/features/collaboration/types"
import type { CoverData } from "../types"

interface CoverFieldsProps {
  value: CoverData
  /** Team members of the course; each gets an include/exclude checkbox. */
  teamMembers: TeamMember[]
  onChange: (patch: Partial<CoverData>) => void
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function CoverFields({ value, teamMembers, onChange }: CoverFieldsProps) {
  const titleError =
    value.workTitle.trim().length === 0 ? "El título es obligatorio." : null
  const authorsError =
    value.authors.length === 0
      ? "Selecciona al menos un integrante."
      : null

  const toggleAuthor = (name: string, checked: boolean | "indeterminate") => {
    const included = checked === true
    const next = included
      ? [...value.authors, name]
      : value.authors.filter((author) => author !== name)
    onChange({ authors: next })
  }

  return (
    <section aria-labelledby="cover-heading" className="flex flex-col gap-4">
      <h2 id="cover-heading" className="text-base font-semibold">
        1. Portada
      </h2>
      <Field id="cover-title" label="Título del trabajo" required error={titleError}>
        <Input
          id="cover-title"
          value={value.workTitle}
          onChange={(event) => onChange({ workTitle: event.target.value })}
          placeholder="Título del trabajo"
          aria-invalid={titleError !== null}
          aria-describedby={titleError ? "cover-title-error" : undefined}
        />
      </Field>

      <fieldset aria-describedby={authorsError ? "cover-authors-error" : "cover-authors-hint"}>
        <legend className="mb-1.5 text-sm font-medium">
          Integrantes <span aria-hidden="true">*</span>
        </legend>
        {teamMembers.length === 0 ? (
          <p id="cover-authors-hint" className="text-sm text-muted-foreground">
            Este curso aún no tiene integrantes en el Team. Agrégalos en la
            sección Team del curso para seleccionarlos aquí.
          </p>
        ) : (
          <>
            <p id="cover-authors-hint" className="mb-2 text-xs text-muted-foreground">
              Marca quiénes participaron en el trabajo. Solo los marcados
              aparecen en la portada.
            </p>
            <ul className="flex list-none flex-col gap-2 p-0">
              {teamMembers.map((member) => {
                const checked = value.authors.includes(member.name)
                const checkboxId = `cover-author-${member.id}`
                return (
                  <li key={member.id} className="flex items-center gap-2.5">
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={(state) => toggleAuthor(member.name, state)}
                      aria-describedby={
                        authorsError ? "cover-authors-error" : undefined
                      }
                    />
                    <Label htmlFor={checkboxId} className="font-normal">
                      {member.name}
                    </Label>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        {authorsError && (
          <p id="cover-authors-error" role="alert" className="mt-1.5 text-sm text-destructive">
            {authorsError}
          </p>
        )}
      </fieldset>

      <Field id="cover-institution" label="Institución">
        <Input
          id="cover-institution"
          value={value.institution}
          onChange={(event) => onChange({ institution: event.target.value })}
          placeholder="Universidad o institución"
        />
      </Field>
      <Field id="cover-course" label="Curso">
        <Input
          id="cover-course"
          value={value.courseName}
          onChange={(event) => onChange({ courseName: event.target.value })}
          placeholder="Nombre del curso o asignatura"
        />
      </Field>
      <Field id="cover-teacher" label="Docente">
        <Input
          id="cover-teacher"
          value={value.teacherName}
          onChange={(event) => onChange({ teacherName: event.target.value })}
          placeholder="Nombre del docente"
        />
      </Field>
      <Field id="cover-date" label="Fecha">
        <Input
          id="cover-date"
          type="date"
          value={value.date}
          onChange={(event) => onChange({ date: event.target.value })}
        />
      </Field>
    </section>
  )
}
