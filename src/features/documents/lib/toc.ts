import type { JSONContent } from "@tiptap/react"
import type {
  ApaDocumentContent,
  ApaFormSections,
  ApaTocDepth,
  ListEntry,
  TocEntry,
} from "../types"

/**
 * Extracts table-of-contents entries: the fixed sections (level 1, using the
 * same visibility rules as `ApaPdfPreview`) plus level 2/3 headings from
 * Desarrollo, up to the requested depth. Pure and derived — never persisted,
 * so it can never drift from the actual document content.
 */
export function extractTocEntries(
  sections: ApaFormSections,
  depth: ApaTocDepth
): TocEntry[] {
  const entries: TocEntry[] = [
    { id: "toc-introduction", level: 1, text: "Introducción" },
  ]

  if (sections.justification.trim().length > 0) {
    entries.push({ id: "toc-justification", level: 1, text: "Justificación" })
  }

  const hasObjectives =
    sections.generalObjective.trim().length > 0 ||
    sections.specificObjectives.some((item) => item.text.trim().length > 0)
  if (hasObjectives) {
    entries.push({ id: "toc-objectives", level: 1, text: "Objetivos" })
  }

  entries.push({ id: "toc-development", level: 1, text: "Desarrollo" })

  if (depth >= 2) {
    entries.push(...extractDevelopmentHeadings(sections.development, depth))
  }

  entries.push({ id: "toc-conclusions", level: 1, text: "Conclusiones" })
  entries.push({ id: "toc-references", level: 1, text: "Referencias" })

  return entries
}

function extractDevelopmentHeadings(
  development: ApaDocumentContent,
  depth: ApaTocDepth
): TocEntry[] {
  const entries: TocEntry[] = []
  let index = 0
  walk(development, (node) => {
    if (node.type !== "heading") return
    const level = node.attrs?.level
    if (level !== 2 && level !== 3) return
    if (level === 3 && depth < 3) return
    const text = extractNodeText(node).trim()
    if (!text) return
    entries.push({ id: `toc-dev-${index}`, level, text })
    index += 1
  })
  return entries
}

/**
 * Extracts figure listing entries: `image` nodes in Desarrollo with a
 * non-empty title, numbered correlatively in document order.
 */
export function extractFigureEntries(development: ApaDocumentContent): ListEntry[] {
  return extractTitledNodeEntries(development, "image")
}

/**
 * Extracts table listing entries: `table` nodes in Desarrollo with a
 * non-empty title, numbered correlatively in document order.
 */
export function extractTableEntries(development: ApaDocumentContent): ListEntry[] {
  return extractTitledNodeEntries(development, "table")
}

function extractTitledNodeEntries(
  development: ApaDocumentContent,
  type: "image" | "table"
): ListEntry[] {
  const entries: ListEntry[] = []
  walk(development, (node) => {
    if (node.type !== type) return
    const title = node.attrs?.title
    if (typeof title !== "string" || title.trim().length === 0) return
    entries.push({
      id: `${type}-${entries.length}`,
      number: entries.length + 1,
      caption: title.trim(),
    })
  })
  return entries
}

/** Depth-first traversal over a TipTap JSON fragment, visiting every node once. */
function walk(node: JSONContent, visit: (node: JSONContent) => void): void {
  visit(node)
  for (const child of node.content ?? []) {
    walk(child, visit)
  }
}

function extractNodeText(node: JSONContent): string {
  const parts: string[] = []
  if (typeof node.text === "string") parts.push(node.text)
  for (const child of node.content ?? []) {
    parts.push(extractNodeText(child))
  }
  return parts.join("")
}
