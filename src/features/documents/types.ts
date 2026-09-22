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

export type ApaFontFamily = "times-new-roman" | "arial"

export const APA_FONT_FAMILIES: ApaFontFamily[] = ["times-new-roman", "arial"]

export const APA_FONT_FAMILY_LABELS_ES: Record<ApaFontFamily, string> = {
  "times-new-roman": "Times New Roman",
  arial: "Arial",
}

/** APA body font: 12 pt, Times New Roman by default (fixed size for both fonts). */
export const APA_DEFAULT_FONT_FAMILY: ApaFontFamily = "times-new-roman"

export function normalizeFontFamily(value: unknown): ApaFontFamily {
  return value === "arial" ? "arial" : APA_DEFAULT_FONT_FAMILY
}

export type ApaTocDepth = 1 | 2 | 3

export interface TocSettings {
  enabled: boolean
  depth: ApaTocDepth
}

/** Table of contents off by default so existing documents keep their appearance. */
export const APA_DEFAULT_TOC_SETTINGS: TocSettings = { enabled: false, depth: 2 }

function isTocDepth(value: unknown): value is ApaTocDepth {
  return value === 1 || value === 2 || value === 3
}

export function normalizeTocSettings(value: unknown): TocSettings {
  if (typeof value !== "object" || value === null) return APA_DEFAULT_TOC_SETTINGS
  const record = value as Record<string, unknown>
  return {
    enabled: record.enabled === true,
    depth: isTocDepth(record.depth) ? record.depth : APA_DEFAULT_TOC_SETTINGS.depth,
  }
}

export interface ListSettings {
  figuresEnabled: boolean
  tablesEnabled: boolean
}

/** Figure/table listings off by default so existing documents keep their appearance. */
export const APA_DEFAULT_LIST_SETTINGS: ListSettings = {
  figuresEnabled: false,
  tablesEnabled: false,
}

export function normalizeListSettings(value: unknown): ListSettings {
  if (typeof value !== "object" || value === null) return APA_DEFAULT_LIST_SETTINGS
  const record = value as Record<string, unknown>
  return {
    figuresEnabled: record.figuresEnabled === true,
    tablesEnabled: record.tablesEnabled === true,
  }
}

/** A table-of-contents entry derived from fixed sections and Desarrollo headings. */
export interface TocEntry {
  id: string
  level: 1 | 2 | 3
  text: string
}

/** A numbered entry in the figures or tables listing, derived from titled nodes. */
export interface ListEntry {
  id: string
  number: number
  caption: string
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

export const DEVELOPMENT_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

export const DEVELOPMENT_IMAGE_MAX_BYTES = 5_000_000
export const DEVELOPMENT_IMAGE_MAX_DIMENSION_PX = 2_400

export type DevelopmentImageMimeType =
  (typeof DEVELOPMENT_IMAGE_MIME_TYPES)[number]

export interface DevelopmentImageAttrs {
  src: string
  alt: string
  title?: string
  mimeType: DevelopmentImageMimeType
  fileSize: number
  width: number
  height: number
}

export interface DevelopmentImageNode extends JSONContent {
  type: "image"
  attrs: DevelopmentImageAttrs
}

export interface DevelopmentTableNode extends JSONContent {
  type: "table"
}

export interface DevelopmentTableAttrs {
  /** Caption/title used as "Tabla N: …" and listed in the tables listing. */
  title?: string | null
}

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

/** A specific objective item (dynamic list). */
export interface SpecificObjective {
  id: string
  text: string
}

/** Structured form model — the single source of truth for the form editor,
 *  the live preview and the printed PDF. */
export interface ApaFormSections {
  cover: CoverData
  /** Plain text */
  introduction: string
  /** Plain text, optional: omitted from preview/PDF when empty */
  justification: string
  /** Plain text */
  generalObjective: string
  /** Ordered dynamic list */
  specificObjectives: SpecificObjective[]
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
  /** Body font used by preview and PDF export; always rendered at 12 pt. */
  fontFamily: ApaFontFamily
  /** Automatic table of contents settings. */
  toc: TocSettings
  /** Automatic figures/tables listing settings. */
  lists: ListSettings
  templateVersion: string
  /** Set when migrated from the 002 free-form model */
  migratedFrom?: string
  /** UID of the user who last updated the document */
  updatedByUid?: string
  /** Email of the user who last updated the document */
  updatedByEmail?: string
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

export function isDevelopmentImageMimeType(
  value: unknown
): value is DevelopmentImageMimeType {
  return (
    typeof value === "string" &&
    (DEVELOPMENT_IMAGE_MIME_TYPES as readonly string[]).includes(value)
  )
}

export function isDevelopmentImageNode(
  value: JSONContent
): value is DevelopmentImageNode {
  const attrs = value.attrs
  if (value.type !== "image" || typeof attrs !== "object" || attrs === null) {
    return false
  }
  const record = attrs as Record<string, unknown>
  return (
    typeof record.src === "string" &&
    typeof record.alt === "string" &&
    isDevelopmentImageMimeType(record.mimeType) &&
    typeof record.fileSize === "number" &&
    typeof record.width === "number" &&
    typeof record.height === "number"
  )
}

export function isDevelopmentTableNode(
  value: JSONContent
): value is DevelopmentTableNode {
  return value.type === "table"
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
