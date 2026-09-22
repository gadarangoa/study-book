import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlignSection,
  WidthType,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from "docx"
import type { ParagraphChild } from "docx"
import type { JSONContent } from "@tiptap/react"
import { formatBibEntry, isBibEntryComplete } from "./apa-format"
import { extractFigureEntries, extractTableEntries, extractTocEntries } from "./toc"
import type {
  ApaDocumentContent,
  ApaFontFamily,
  ApaFormDocument,
  ApaPageSize,
} from "../types"

/**
 * Builds a .docx export from the same `ApaFormDocument` model that drives the
 * live preview and the printed PDF (`ApaPdfPreview`). Mirrors that renderer's
 * structure and `apa-styles.css` print rules 1:1 so all three surfaces match:
 * pending/incomplete content that print hides via `.apa-guide` is likewise
 * skipped here rather than rendered as bracketed placeholder text.
 */

const MARGIN_TWIPS = convertInchesToTwip(1) // APA 2.54 cm margins
const FIRST_LINE_INDENT_TWIPS = convertInchesToTwip(0.5) // 1.27 cm

const PAGE_SIZE_TWIPS: Record<ApaPageSize, { width: number; height: number }> = {
  letter: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) },
  a4: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
}

/** Printable content width in px (96 px/in), used to scale embedded images. */
const CONTENT_WIDTH_PX: Record<ApaPageSize, number> = {
  letter: Math.round((8.5 - 2) * 96),
  a4: Math.round((210 / 25.4 - 2) * 96),
}

const FONT_NAME: Record<ApaFontFamily, string> = {
  "times-new-roman": "Times New Roman",
  arial: "Arial",
}

const FONT_SIZE_HALF_POINTS = 24 // 12pt, fixed regardless of font choice

const ORDERED_LIST_REFERENCE = "apa-ordered-list"

function baseRunProps(font: string) {
  return { font, size: FONT_SIZE_HALF_POINTS }
}

function textParagraph(
  children: ParagraphChild[],
  options: {
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
    firstLineIndent?: boolean
    indentLeft?: number
    hangingIndent?: number
    bold?: boolean
    pageBreakBefore?: boolean
    spacingBefore?: number
    spacingAfter?: number
    bullet?: { level: number }
    numbering?: { reference: string; level: number }
  } = {}
): Paragraph {
  return new Paragraph({
    children,
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    indent: {
      firstLine: options.firstLineIndent ? FIRST_LINE_INDENT_TWIPS : undefined,
      left: options.indentLeft,
      hanging: options.hangingIndent,
    },
    spacing: {
      line: 480,
      before: options.spacingBefore,
      after: options.spacingAfter,
    },
    pageBreakBefore: options.pageBreakBefore,
    bullet: options.bullet,
    numbering: options.numbering,
  })
}

function heading(font: string, text: string, pageBreakBefore = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ ...baseRunProps(font), text, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { line: 480, before: 340, after: 170 }, // ~0.6cm / 0.3cm
    pageBreakBefore,
  })
}

function plainTextParagraphs(font: string, text: string): Paragraph[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return paragraphs.map((p) =>
    textParagraph([new TextRun({ ...baseRunProps(font), text: p })], {
      firstLineIndent: true,
    })
  )
}

function buildInlineRuns(node: JSONContent, font: string): ParagraphChild[] {
  if (node.type !== "text") return []
  const text = node.text ?? ""
  if (!text) return []
  const marks = node.marks ?? []
  const bold = marks.some((m) => m.type === "bold")
  const italics = marks.some((m) => m.type === "italic")
  const strike = marks.some((m) => m.type === "strike")
  const underline = marks.some((m) => m.type === "underline") ? {} : undefined
  const linkMark = marks.find(
    (m) => m.type === "link" && typeof m.attrs?.href === "string"
  )
  const run = new TextRun({ ...baseRunProps(font), text, bold, italics, strike, underline })
  if (linkMark) {
    return [new ExternalHyperlink({ link: linkMark.attrs?.href as string, children: [run] })]
  }
  return [run]
}

function inlineChildren(node: JSONContent, font: string): ParagraphChild[] {
  return (node.content ?? []).flatMap((child) => buildInlineRuns(child, font))
}

interface DevCounters {
  figure: number
  table: number
}

/** Decodes a base64 data URL image for embedding; converts webp to png (unsupported by docx). */
async function decodeImageForDocx(
  src: string,
  mimeType: string
): Promise<{ data: Uint8Array; type: "png" | "jpg" | "gif" | "bmp" } | null> {
  if (mimeType === "image/webp") {
    const png = await convertDataUrlToPngBytes(src)
    return png ? { data: png, type: "png" } : null
  }
  const match = /^data:[^;]+;base64,(.*)$/.exec(src)
  if (!match) return null
  const binary = atob(match[1])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const type = mimeType === "image/png" ? "png" : "jpg"
  return { data: bytes, type }
}

function convertDataUrlToPngBytes(dataUrl: string): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(null)
        return
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null)
          return
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
      }, "image/png")
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

async function renderImageNode(
  node: JSONContent,
  counters: DevCounters,
  font: string,
  maxWidthPx: number
): Promise<Paragraph[]> {
  const attrs = (node.attrs ?? {}) as Record<string, unknown>
  const src = typeof attrs.src === "string" ? attrs.src : ""
  if (!src) return []
  const mimeType = typeof attrs.mimeType === "string" ? attrs.mimeType : "image/png"
  const decoded = await decodeImageForDocx(src, mimeType)
  if (!decoded) return []

  const naturalWidth = typeof attrs.width === "number" ? attrs.width : maxWidthPx
  const naturalHeight = typeof attrs.height === "number" ? attrs.height : maxWidthPx
  const scale = Math.min(1, maxWidthPx / Math.max(naturalWidth, 1))
  const width = Math.max(1, Math.round(naturalWidth * scale))
  const height = Math.max(1, Math.round(naturalHeight * scale))

  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 480 },
      children: [
        new ImageRun({
          type: decoded.type,
          data: decoded.data,
          transformation: { width, height },
        }),
      ],
    }),
  ]

  const title = typeof attrs.title === "string" ? attrs.title.trim() : ""
  if (title) {
    counters.figure += 1
    paragraphs.push(
      textParagraph(
        [new TextRun({ ...baseRunProps(font), text: `Figura ${counters.figure}: ${title}` })],
        { alignment: AlignmentType.CENTER }
      )
    )
  }

  return paragraphs
}

async function renderTableNode(
  node: JSONContent,
  counters: DevCounters,
  font: string,
  maxImageWidthPx: number
): Promise<(Paragraph | Table)[]> {
  const attrs = (node.attrs ?? {}) as Record<string, unknown>
  const title = typeof attrs.title === "string" ? attrs.title.trim() : ""
  const rows = node.content ?? []
  if (rows.length === 0) return []

  const columnCount = Math.max(1, rows[0]?.content?.length ?? 1)
  const border = { style: BorderStyle.SINGLE, size: 4, color: "737373" }
  const cellBorders = { top: border, bottom: border, left: border, right: border }

  const tableRows: TableRow[] = []
  for (const row of rows) {
    const isHeader = row.type === "tableHeader"
    const cells: TableCell[] = []
    for (const cell of row.content ?? []) {
      const cellChildren: (Paragraph | Table)[] = []
      for (const paragraph of cell.content ?? []) {
        cellChildren.push(...(await renderNode(paragraph, counters, font, maxImageWidthPx)))
      }
      cells.push(
        new TableCell({
          borders: cellBorders,
          width: { size: Math.round(100 / columnCount), type: WidthType.PERCENTAGE },
          children: cellChildren.length > 0 ? cellChildren : [new Paragraph({ children: [] })],
        })
      )
    }
    tableRows.push(new TableRow({ children: cells, tableHeader: isHeader }))
  }

  const result: (Paragraph | Table)[] = []
  if (title) {
    counters.table += 1
    result.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 480 },
        children: [
          new TextRun({
            ...baseRunProps(font),
            text: `Tabla ${counters.table}: ${title}`,
            italics: true,
          }),
        ],
      })
    )
  }
  result.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }))
  result.push(new Paragraph({ children: [] }))
  return result
}

async function renderListNode(
  node: JSONContent,
  counters: DevCounters,
  font: string,
  ordered: boolean,
  level: number,
  maxImageWidthPx: number
): Promise<(Paragraph | Table)[]> {
  const items = node.content ?? []
  const result: (Paragraph | Table)[] = []
  for (const item of items) {
    if (item.type !== "listItem") continue
    const children = item.content ?? []
    const inlineParas = children.filter((c) => c.type === "paragraph")
    const rest = children.filter((c) => c.type !== "paragraph")

    const runs = inlineParas.flatMap((p) => inlineChildren(p, font))
    result.push(
      textParagraph(runs, {
        alignment: AlignmentType.JUSTIFIED,
        bullet: ordered ? undefined : { level },
        numbering: ordered ? { reference: ORDERED_LIST_REFERENCE, level } : undefined,
      })
    )
    for (const child of rest) {
      if (child.type === "bulletList") {
        result.push(
          ...(await renderListNode(child, counters, font, false, level + 1, maxImageWidthPx))
        )
      } else if (child.type === "orderedList") {
        result.push(
          ...(await renderListNode(child, counters, font, true, level + 1, maxImageWidthPx))
        )
      } else {
        result.push(...(await renderNode(child, counters, font, maxImageWidthPx)))
      }
    }
  }
  return result
}

/**
 * Renders one TipTap node (and its subtree) into docx paragraphs/tables.
 * Mirrors `renderBlock` in `apa-pdf-preview.tsx`: same node types, same
 * recursion into lists/tables/images, unsupported types render nothing
 * (print hides `[Contenido no compatible]` too).
 */
async function renderNode(
  node: JSONContent,
  counters: DevCounters,
  font: string,
  maxImageWidthPx: number
): Promise<(Paragraph | Table)[]> {
  switch (node.type) {
    case "heading":
      return [heading(font, extractText(node))]
    case "paragraph": {
      const runs = inlineChildren(node, font)
      if (runs.length === 0) return [new Paragraph({ children: [] })]
      return [textParagraph(runs, { firstLineIndent: true })]
    }
    case "bulletList":
      return renderListNode(node, counters, font, false, 0, maxImageWidthPx)
    case "orderedList":
      return renderListNode(node, counters, font, true, 0, maxImageWidthPx)
    case "blockquote":
      return [
        textParagraph(inlineChildren(node, font), {
          indentLeft: FIRST_LINE_INDENT_TWIPS,
        }),
      ]
    case "image":
      return renderImageNode(node, counters, font, maxImageWidthPx)
    case "table":
      return renderTableNode(node, counters, font, maxImageWidthPx)
    default:
      return []
  }
}

async function renderDevelopmentContent(
  content: ApaDocumentContent,
  counters: DevCounters,
  font: string,
  maxImageWidthPx: number
): Promise<(Paragraph | Table)[]> {
  const nodes = content.content ?? []
  const result: (Paragraph | Table)[] = []
  for (const node of nodes) {
    result.push(...(await renderNode(node, counters, font, maxImageWidthPx)))
  }
  return result
}

function extractText(node: JSONContent): string {
  if (typeof node.text === "string") return node.text
  return (node.content ?? []).map(extractText).join("")
}

function formatCoverDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
}

function centeredText(font: string, text: string, bold = false, spacingBefore = 0): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 480, before: spacingBefore },
    children: [new TextRun({ ...baseRunProps(font), text, bold })],
  })
}

function buildCoverParagraphs(document: ApaFormDocument, font: string): Paragraph[] {
  const { cover } = document.sections
  const paragraphs: Paragraph[] = []

  if (cover.workTitle.trim().length > 0) {
    paragraphs.push(centeredText(font, cover.workTitle.trim(), true, 480))
  }

  const authorParas = cover.authors
    .filter((a) => a.trim().length > 0)
    .map((a) => centeredText(font, a.trim()))
  paragraphs.push(...authorParas)

  const infoLines = [cover.institution, cover.courseName, cover.teacherName]
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
  paragraphs.push(...infoLines.map((line) => centeredText(font, line)))

  if (cover.date.trim().length > 0) {
    paragraphs.push(centeredText(font, formatCoverDate(cover.date)))
  }

  if (paragraphs.length === 0) {
    // Keep the cover page from collapsing to zero content.
    paragraphs.push(new Paragraph({ children: [] }))
  }

  return paragraphs
}

function buildTocSection(
  document: ApaFormDocument,
  font: string,
  pageBreakBefore: boolean
): Paragraph[] {
  if (!document.toc.enabled) return []
  const entries = extractTocEntries(document.sections, document.toc.depth)
  if (entries.length === 0) return []
  const paragraphs = [heading(font, "Tabla de contenido", pageBreakBefore)]
  paragraphs.push(
    ...entries.map((entry) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 360 },
        indent: { left: (entry.level - 1) * FIRST_LINE_INDENT_TWIPS },
        children: [new TextRun({ ...baseRunProps(font), text: entry.text })],
      })
    )
  )
  return paragraphs
}

function buildListingSection(
  font: string,
  title: string,
  entries: { number: number; caption: string }[],
  prefix: string,
  pageBreakBefore: boolean
): Paragraph[] {
  if (entries.length === 0) return []
  const paragraphs = [heading(font, title, pageBreakBefore)]
  paragraphs.push(
    ...entries.map(
      (entry) =>
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 360 },
          children: [
            new TextRun({
              ...baseRunProps(font),
              text: `${prefix} ${entry.number}: ${entry.caption}`,
            }),
          ],
        })
    )
  )
  return paragraphs
}

function buildObjectivesSection(
  document: ApaFormDocument,
  font: string,
  pageBreakBefore: boolean
): Paragraph[] {
  const { generalObjective, specificObjectives } = document.sections
  const specifics = specificObjectives.filter((s) => s.text.trim().length > 0)
  if (generalObjective.trim().length === 0 && specifics.length === 0) return []

  const paragraphs = [heading(font, "Objetivos", pageBreakBefore)]
  if (generalObjective.trim().length > 0) {
    paragraphs.push(heading(font, "Objetivo general"))
    paragraphs.push(...plainTextParagraphs(font, generalObjective))
  }
  if (specifics.length > 0) {
    paragraphs.push(heading(font, "Objetivos específicos"))
    paragraphs.push(
      ...specifics.map((item) =>
        textParagraph(
          [new TextRun({ ...baseRunProps(font), text: item.text.trim() })],
          { bullet: { level: 0 } }
        )
      )
    )
  }
  return paragraphs
}

function buildReferencesSection(document: ApaFormDocument, font: string): Paragraph[] {
  const orderedRefs = [...document.sections.bibliography].sort((a, b) => a.order - b.order)
  const complete = orderedRefs.filter(isBibEntryComplete)
  const paragraphs = [heading(font, "Referencias", true)]
  paragraphs.push(
    ...complete.map((entry) =>
      textParagraph(
        [new TextRun({ ...baseRunProps(font), text: formatBibEntry(entry) })],
        {
          alignment: AlignmentType.JUSTIFIED,
          indentLeft: FIRST_LINE_INDENT_TWIPS,
          hangingIndent: FIRST_LINE_INDENT_TWIPS,
          spacingAfter: 170,
        }
      )
    )
  )
  return paragraphs
}

/** Builds the full .docx export as a Blob, ready to download. */
export async function buildApaDocxBlob(document: ApaFormDocument): Promise<Blob> {
  const font = FONT_NAME[document.fontFamily]
  const { sections, pageSize } = document
  const counters: DevCounters = { figure: 0, table: 0 }
  const maxImageWidthPx = CONTENT_WIDTH_PX[pageSize]

  const coverParagraphs = buildCoverParagraphs(document, font)

  const bodyChildren: (Paragraph | Table)[] = []

  // The body starts a fresh docx `section` (own page already); a section's
  // own `heading()` only needs `pageBreakBefore` once something has already
  // been rendered before it, or an extra blank page would precede it.
  let hasRenderedFirstSection = false

  const tocParagraphs = buildTocSection(document, font, hasRenderedFirstSection)
  if (tocParagraphs.length > 0) hasRenderedFirstSection = true
  bodyChildren.push(...tocParagraphs)

  if (document.lists.figuresEnabled) {
    const figureListing = buildListingSection(
      font,
      "Listado de figuras",
      extractFigureEntries(sections.development),
      "Figura",
      hasRenderedFirstSection
    )
    if (figureListing.length > 0) hasRenderedFirstSection = true
    bodyChildren.push(...figureListing)
  }
  if (document.lists.tablesEnabled) {
    const tableListing = buildListingSection(
      font,
      "Listado de tablas",
      extractTableEntries(sections.development),
      "Tabla",
      hasRenderedFirstSection
    )
    if (tableListing.length > 0) hasRenderedFirstSection = true
    bodyChildren.push(...tableListing)
  }

  bodyChildren.push(heading(font, "Introducción", hasRenderedFirstSection))
  bodyChildren.push(...plainTextParagraphs(font, sections.introduction))

  if (sections.justification.trim().length > 0) {
    bodyChildren.push(heading(font, "Justificación", true))
    bodyChildren.push(...plainTextParagraphs(font, sections.justification))
  }

  bodyChildren.push(...buildObjectivesSection(document, font, true))

  bodyChildren.push(heading(font, "Desarrollo", true))
  bodyChildren.push(
    ...(await renderDevelopmentContent(sections.development, counters, font, maxImageWidthPx))
  )

  bodyChildren.push(heading(font, "Conclusiones", true))
  bodyChildren.push(...plainTextParagraphs(font, sections.conclusions))

  bodyChildren.push(...buildReferencesSection(document, font))

  const pageProps = {
    size: PAGE_SIZE_TWIPS[pageSize],
    margin: {
      top: MARGIN_TWIPS,
      right: MARGIN_TWIPS,
      bottom: MARGIN_TWIPS,
      left: MARGIN_TWIPS,
    },
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font, size: FONT_SIZE_HALF_POINTS } },
      },
    },
    numbering: {
      config: [
        {
          reference: ORDERED_LIST_REFERENCE,
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.LOWER_LETTER,
              text: "%2.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(1),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: pageProps,
          verticalAlign: VerticalAlignSection.BOTH,
        },
        children: coverParagraphs,
      },
      {
        properties: { page: pageProps },
        children: bodyChildren,
      },
    ],
  })

  return Packer.toBlob(doc)
}

/** Sanitizes the document title into a safe filename (no extension). */
export function docxFileName(title: string): string {
  const cleaned = title.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ")
  return cleaned.length > 0 ? cleaned : "documento-apa"
}
