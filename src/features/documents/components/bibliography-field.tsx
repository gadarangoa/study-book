import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import {
  formatBibEntry,
  isBibEntryComplete,
  isValidBibYear,
} from "../lib/apa-format"
import type { BibEntry, BibEntryFormData } from "../types"

interface BibliographyFieldProps {
  entries: BibEntry[]
  onAdd: (entry: BibEntryFormData) => void
  onUpdate: (id: string, patch: Partial<BibEntryFormData>) => void
  onRemove: (id: string) => void
  onReorder: (idsInOrder: string[]) => void
}

const EMPTY_FORM: BibEntryFormData = { author: "", year: "", title: "", source: "" }

interface EntryErrors {
  author?: string
  year?: string
  title?: string
}

function validateEntry(data: BibEntryFormData): EntryErrors {
  const errors: EntryErrors = {}
  if (data.author.trim().length === 0) errors.author = "El autor es obligatorio."
  if (data.year.trim().length > 0 && !isValidBibYear(data.year)) {
    errors.year = "El año debe tener 4 dígitos (p. ej. 2024) o dejarse vacío."
  }
  if (data.title.trim().length === 0) errors.title = "El título es obligatorio."
  return errors
}

function EntryForm({
  idPrefix,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  idPrefix: string
  initial: BibEntryFormData
  submitLabel: string
  onSubmit: (data: BibEntryFormData) => void
  onCancel?: () => void
}) {
  const [draft, setDraft] = useState<BibEntryFormData>(initial)
  const [errors, setErrors] = useState<EntryErrors>({})

  const set = (patch: Partial<BibEntryFormData>) =>
    setDraft((current) => ({ ...current, ...patch }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const validation = validateEntry(draft)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    onSubmit({
      author: draft.author.trim(),
      year: draft.year.trim(),
      title: draft.title.trim(),
      source: draft.source.trim(),
    })
    if (idPrefix === "biblio-new") {
      setDraft(EMPTY_FORM)
      setErrors({})
    }
  }

  const field = (
    key: keyof BibEntryFormData,
    label: string,
    placeholder: string,
    error?: string,
    inputMode?: "numeric",
    hint?: string
  ) => (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-${key}`}>{label}</Label>
      <Input
        id={`${idPrefix}-${key}`}
        value={draft[key]}
        inputMode={inputMode}
        onChange={(event) => set({ [key]: event.target.value })}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-${key}-error` : undefined}
      />
      {error ? (
        <p id={`${idPrefix}-${key}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {field("author", "Autor", "Apellido, N.", errors.author)}
        {field(
          "year",
          "Año (opcional)",
          "2024",
          errors.year,
          "numeric",
          'Déjalo vacío si la fuente no tiene fecha; se mostrará como "s.f.".'
        )}
      </div>
      {field("title", "Título", "Título de la obra", errors.title)}
      {field("source", "Fuente", "Editorial, revista o URL")}
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

function hasContent(entry: BibEntry): boolean {
  return (
    entry.author.trim().length > 0 ||
    entry.year.trim().length > 0 ||
    entry.title.trim().length > 0 ||
    entry.source.trim().length > 0
  )
}

export function BibliographyField({
  entries,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: BibliographyFieldProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BibEntry | null>(null)
  const [showAddForm, setShowAddForm] = useState(entries.length === 0)

  const ordered = [...entries].sort((a, b) => a.order - b.order)

  const move = (id: string, direction: -1 | 1) => {
    const index = ordered.findIndex((entry) => entry.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= ordered.length) return
    const ids = ordered.map((entry) => entry.id)
    const [moved] = ids.splice(index, 1)
    ids.splice(target, 0, moved)
    onReorder(ids)
  }

  const requestRemove = (entry: BibEntry) => {
    if (hasContent(entry)) {
      setDeleteTarget(entry)
    } else {
      onRemove(entry.id)
    }
  }

  return (
    <section aria-labelledby="biblio-heading" className="flex flex-col gap-4">
      <h2 id="biblio-heading" className="text-base font-semibold">
        7. Bibliografía
      </h2>

      {ordered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay referencias. Agrega la primera con el formulario de
          abajo.
        </p>
      ) : (
        <ul className="flex list-none flex-col gap-3 p-0">
          {ordered.map((entry, index) => (
            <li key={entry.id} className="rounded-md border p-3">
              {editingId === entry.id ? (
                <EntryForm
                  idPrefix={`biblio-edit-${entry.id}`}
                  initial={{
                    author: entry.author,
                    year: entry.year,
                    title: entry.title,
                    source: entry.source,
                  }}
                  submitLabel="Guardar cambios"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(data) => {
                    onUpdate(entry.id, data)
                    setEditingId(null)
                  }}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm">
                    {isBibEntryComplete(entry) ? (
                      formatBibEntry(entry)
                    ) : (
                      <span className="text-muted-foreground">
                        Referencia pendiente de completar.
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(entry.id)}
                    >
                      <PencilIcon aria-hidden />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => move(entry.id, -1)}
                      aria-label={`Subir referencia ${index + 1}`}
                    >
                      <ArrowUpIcon aria-hidden />
                      <span className="sr-only">Subir</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === ordered.length - 1}
                      onClick={() => move(entry.id, 1)}
                      aria-label={`Bajar referencia ${index + 1}`}
                    >
                      <ArrowDownIcon aria-hidden />
                      <span className="sr-only">Bajar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => requestRemove(entry)}
                    >
                      <TrashIcon aria-hidden />
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showAddForm || ordered.length === 0 ? (
        <div className="rounded-md border border-dashed p-3">
          <EntryForm
            idPrefix="biblio-new"
            initial={EMPTY_FORM}
            submitLabel="Agregar referencia"
            onSubmit={(data) => onAdd(data)}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setShowAddForm(true)}
        >
          <PlusIcon aria-hidden />
          Agregar referencia
        </Button>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar referencia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta referencia tiene contenido y se eliminará de la lista y de
              las referencias del documento. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) onRemove(deleteTarget.id)
                setDeleteTarget(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
