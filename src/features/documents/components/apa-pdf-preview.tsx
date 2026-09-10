import { Fragment } from "react"
import "../lib/apa-styles.css"
import { formatBibEntry, isBibEntryComplete } from "../lib/apa-format"
import type { JSONContent } from "@tiptap/react"
import type { ApaFormDocument, ApaPageSize } from "../types"

export type ApaZoomLevel = 75 | 100 | 125 | 150

const PAGE_SIZE_DIMENSIONS: Record<ApaPageSize, string> = {
  letter: "Letter",
  a4: "A4",
}

/**
 * Injects the per-document `@page` rule (paper size + 2.54 cm APA margins)
 * so preview and printed PDF share the same page geometry. Rendered once per
 * editor page; the stylesheet fallback covers printing from any other view.
 */
export function ApaPageStyle({ pageSize }: { pageSize: ApaPageSize }) {
  return (
    <style>{`@page { size: ${PAGE_SIZE_DIMENSIONS[pageSize]}; margin: 2.54cm; }`}</style>
  )
}

export interface ApaPdfPreviewProps {
  document: ApaFormDocument
  /** Screen-only scaling; print always renders at 100%. */
  zoom?: ApaZoomLevel
}

function renderInline(node: JSONContent, key: string): React.ReactNode {
  if (node.type === "text") {
    let content: React.ReactNode = node.text ?? ""
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") content = <strong key={key}>{content}</strong>
      else if (mark.type === "italic") content = <em key={key}>{content}</em>
      else if (mark.type === "underline") content = <u key={key}>{content}</u>
      else if (mark.type === "strike") content = <s key={key}>{content}</s>
      else if (
        mark.type === "link" &&
        typeof mark.attrs?.href === "string"
      ) {
        content = (
          <a key={key} href={mark.attrs.href}>
            {content}
          </a>
        )
      }
    }
    return <Fragment key={key}>{content}</Fragment>
  }
  return null
}

function renderBlock(node: JSONContent, key: string): React.ReactNode {
  const children = (node.content ?? []).map((child, index) =>
    renderInline(child, `${key}-${index}`)
  )
  const align = node.attrs?.textAlign as string | undefined
  const style = align ? { textAlign: align as React.CSSProperties["textAlign"] } : undefined
  switch (node.type) {
    case "heading": {
      const level = node.attrs?.level
      const safeLevel = level === 2 || level === 3 ? level : 1
      if (safeLevel === 2) return <h2 key={key} style={style}>{children}</h2>
      if (safeLevel === 3) return <h3 key={key} style={style}>{children}</h3>
      return <h1 key={key} style={style}>{children}</h1>
    }
    case "bulletList":
      return (
        <ul key={key}>
          {(node.content ?? []).map((item, index) =>
            renderBlock(item, `${key}-${index}`)
          )}
        </ul>
      )
    case "orderedList":
      return (
        <ol key={key}>
          {(node.content ?? []).map((item, index) =>
            renderBlock(item, `${key}-${index}`)
          )}
        </ol>
      )
    case "listItem":
      return (
        <li key={key}>
          {(node.content ?? []).map((child, index) =>
            child.type === "paragraph" ? (
              <Fragment key={`${key}-${index}`}>
                {(child.content ?? []).map((grandchild, grandIndex) =>
                  renderInline(grandchild, `${key}-${index}-${grandIndex}`)
                )}
              </Fragment>
            ) : (
              renderBlock(child, `${key}-${index}`)
            )
          )}
        </li>
      )
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>
    case "paragraph":
    default:
      return (
        <p key={key} style={style}>
          {children}
        </p>
      )
  }
}

function renderPlainText(text: string, keyPrefix: string): React.ReactNode {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  if (paragraphs.length === 0) {
    return (
      <p key={`${keyPrefix}-guide`} className="apa-guide">
        [Sección pendiente de completar]
      </p>
    )
  }
  return paragraphs.map((paragraph, index) => (
    <p key={`${keyPrefix}-${index}`}>{paragraph.trim()}</p>
  ))
}

function CoverLine({ value, guide }: { value: string; guide: string }) {
  if (value.trim().length > 0) {
    return <p className="apa-cover">{value}</p>
  }
  return <p className="apa-cover apa-guide">[{guide}]</p>
}

function formatCoverDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Read-only APA rendering of a form document. This is the same DOM that gets
 * printed on export, so preview and PDF match by construction.
 */
export function ApaPdfPreview({ document, zoom = 100 }: ApaPdfPreviewProps) {
  const { cover, introduction, development, conclusions, bibliography } =
    document.sections
  const orderedRefs = [...bibliography].sort((a, b) => a.order - b.order)
  const zoomClass = zoom === 100 ? "" : `apa-zoom-${zoom}`

  return (
    <div className={`apa-document ${zoomClass}`} data-testid="apa-preview">
      <section id="apa-cover" aria-label="Portada" className="apa-page-break">
        {cover.workTitle.trim().length > 0 ? (
          <h1 className="apa-cover-title">{cover.workTitle}</h1>
        ) : (
          <h1 className="apa-cover-title apa-guide">[Título del trabajo]</h1>
        )}
        {cover.authors.length > 0 ? (
          cover.authors.map((author) => (
            <p key={author} className="apa-cover">
              {author}
            </p>
          ))
        ) : (
          <p className="apa-cover apa-guide">[Integrantes]</p>
        )}
        <CoverLine value={cover.institution} guide="Institución" />
        <CoverLine value={cover.courseName} guide="Curso" />
        <CoverLine value={cover.teacherName} guide="Docente" />
        <p className="apa-cover">{formatCoverDate(cover.date)}</p>
      </section>

      <section id="apa-introduction" aria-label="Introducción" className="apa-section-break">
        <h2>Introducción</h2>
        {renderPlainText(introduction, "intro")}
      </section>

      <section id="apa-development" aria-label="Desarrollo" className="apa-section-break">
        <h2>Desarrollo</h2>
        {(development.content ?? []).map((node, index) =>
          renderBlock(node, `dev-${index}`)
        )}
      </section>

      <section id="apa-conclusions" aria-label="Conclusiones" className="apa-section-break">
        <h2>Conclusiones</h2>
        {renderPlainText(conclusions, "concl")}
      </section>

      <section id="apa-references" aria-label="Referencias" className="apa-section-break">
        <h2>Referencias</h2>
        <div className="apa-references">
          {orderedRefs.length === 0 && (
            <p className="apa-guide">[Sin referencias todavía]</p>
          )}
          {orderedRefs.map((entry) =>
            isBibEntryComplete(entry) ? (
              <p key={entry.id}>{formatBibEntry(entry)}</p>
            ) : (
              <p key={entry.id} className="apa-guide">
                [Referencia pendiente de completar]
              </p>
            )
          )}
        </div>
      </section>
    </div>
  )
}
