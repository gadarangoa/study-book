import type { JSONContent } from "@tiptap/react"

export type ApaDocumentStatus = "draft" | "in_review" | "finalized"

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

export type SaveState = "saved" | "saving" | "error"

export const SAVE_STATE_LABELS: Record<SaveState, string> = {
  saved: "Saved",
  saving: "Saving…",
  error: "Save failed — retry",
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
