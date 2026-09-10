import type { JSONContent } from "@tiptap/react"

export type ApaDocumentStatus = "draft" | "in_review" | "finalized"

export type ApaPageSize = "letter" | "a4"

export const APA_PAGE_SIZES: ApaPageSize[] = ["letter", "a4"]

export const APA_PAGE_SIZE_LABELS_ES: Record<ApaPageSize, string> = {
  letter: "Carta",
  a4: "A4",
}

/** APA default paper size (Letter = Carta, 8.5 × 11 in). */
export const APA_DEFAULT_PAGE_SIZE: ApaPageSize = "letter"

export function normalizePageSize(value: unknown): ApaPageSize {
  return value === "a4" ? "a4" : APA_DEFAULT_PAGE_SIZE
}

export const APA_DOCUMENT_STATUSES: ApaDocumentStatus[] = [
  "draft",
  "in_review",
  "finalized",
]

export const APA_STATUS_LABELS: Record<ApaDocumentStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  finalized: "Finalized",
}

export const APA_STATUS_LABELS_ES: Record<ApaDocumentStatus, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  finalized: "Finalizado",
}

/** TipTap document JSON — the single source of truth for editor, preview and print. */
export type ApaDocumentContent = JSONContent

export interface ApaDocument {
  id: string
  courseId: string
  title: string
  content: ApaDocumentContent
  status: ApaDocumentStatus
  createdAt: string
  updatedAt: string
}

export interface ApaDocumentFormData {
  title: string
}

export interface ApaDocumentWithMeta extends ApaDocument {
  wordCount: number
}

/** APA 7th ed. (Spanish) template version. Bump when the template changes. */
export const APA_TEMPLATE_VERSION = "7e-es-v1"

/** APA 7th ed. (Spanish) form-based template version (003 variant). */
export const APA_FORM_TEMPLATE_VERSION = "7e-es-form-v1"

export interface CoverData {
  workTitle: string
  /** Snapshot of participating team member names (managed via checkboxes) */
  authors: string[]
  institution: string
  courseName: string
  teacherName: string
  /** ISO date (yyyy-mm-dd) */
  date: string
}

export interface BibEntry {
  id: string
  author: string
  year: string
  title: string
  source: string
  /** Position in the list (0-based, contiguous) */
  order: number
}

/** Structured form model — the single source of truth for the form editor,
 *  the live preview and the printed PDF. */
export interface ApaFormSections {
  cover: CoverData
  /** Plain text */
  introduction: string
  /** TipTap fragment (bounded academic formatting) */
  development: ApaDocumentContent
  /** Plain text */
  conclusions: string
  /** Ordered by `order` */
  bibliography: BibEntry[]
}

export interface ApaFormDocument {
  id: string
  courseId: string
  title: string
  sections: ApaFormSections
  status: ApaDocumentStatus
  /** Paper size used by preview and PDF export. */
  pageSize: ApaPageSize
  templateVersion: string
  /** Set when migrated from the 002 free-form model */
  migratedFrom?: string
  createdAt: string
  updatedAt: string
}

export interface BibEntryFormData {
  author: string
  year: string
  title: string
  source: string
}

export type SaveState = "saved" | "saving" | "error"

export const SAVE_STATE_LABELS: Record<SaveState, string> = {
  saved: "Guardado",
  saving: "Guardando…",
  error: "Error al guardar — reintentar",
}

export function countWords(content: ApaDocumentContent): number {
  const text = extractText(content).trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

function extractText(node: JSONContent): string {
  const parts: string[] = []
  if (typeof node.text === "string") parts.push(node.text)
  if (Array.isArray(node.content)) {
    for (const child of node.content) parts.push(extractText(child))
  }
  return parts.join(" ")
}

export function isApaDocumentStatus(value: unknown): value is ApaDocumentStatus {
  return (
    typeof value === "string" &&
    (APA_DOCUMENT_STATUSES as string[]).includes(value)
  )
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

/**
 * Normalizes stored cover data. Migrates the legacy single `authorName`
 * field into the `authors` list; unknown shapes fall back to empty values.
 */
export function normalizeCoverData(cover: unknown): CoverData {
  const fallback: CoverData = {
    workTitle: "",
    authors: [],
    institution: "",
    courseName: "",
    teacherName: "",
    date: "",
  }
  if (typeof cover !== "object" || cover === null) return fallback
  const record = cover as Record<string, unknown> & Partial<CoverData> & {
    authorName?: unknown
  }
  const authors = asStringArray(record.authors)
  const legacyAuthor =
    authors.length === 0 && typeof record.authorName === "string"
      ? record.authorName.trim()
      : ""
  return {
    workTitle: typeof record.workTitle === "string" ? record.workTitle : "",
    authors: legacyAuthor ? [legacyAuthor] : authors,
    institution: typeof record.institution === "string" ? record.institution : "",
    courseName: typeof record.courseName === "string" ? record.courseName : "",
    teacherName: typeof record.teacherName === "string" ? record.teacherName : "",
    date: typeof record.date === "string" ? record.date : "",
  }
}
