/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type BreadcrumbDocument = { id: string; title: string; courseId: string }

type Actions = {
  publish: (document: BreadcrumbDocument) => void
  retract: (id: string) => void
}

// Value and actions live in separate contexts so the publishing page (which
// only needs the stable actions) doesn't re-render when the value changes.
const DocumentContext = React.createContext<BreadcrumbDocument | null>(null)
const ActionsContext = React.createContext<Actions | null>(null)

/**
 * The document editor publishes the open document so the header breadcrumb
 * shows its live title (it changes while editing) without re-reading it.
 */
export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [document, setDocument] = React.useState<BreadcrumbDocument | null>(
    null
  )

  const actions = React.useMemo<Actions>(
    () => ({
      publish: (next) => {
        setDocument((prev) =>
          prev?.id === next.id &&
          prev.title === next.title &&
          prev.courseId === next.courseId
            ? prev
            : next
        )
      },
      // Only clears if it still holds this document, so a late unmount can't
      // wipe what the next page published.
      retract: (id) => {
        setDocument((prev) => (prev?.id === id ? null : prev))
      },
    }),
    []
  )

  return (
    <ActionsContext.Provider value={actions}>
      <DocumentContext.Provider value={document}>
        {children}
      </DocumentContext.Provider>
    </ActionsContext.Provider>
  )
}

export function usePublishedDocument() {
  return React.useContext(DocumentContext)
}

export function usePublishDocument(
  document: BreadcrumbDocument | null | undefined
) {
  const actions = React.useContext(ActionsContext)
  if (actions === null) {
    throw new Error(
      "usePublishDocument must be used within a BreadcrumbProvider"
    )
  }
  const { publish, retract } = actions
  const id = document?.id
  const title = document?.title
  const courseId = document?.courseId

  // Retract only when the document changes or the page unmounts…
  React.useEffect(() => {
    if (id === undefined) return undefined
    return () => retract(id)
  }, [id, retract])

  // …and update in place while the title is edited (one state update).
  React.useEffect(() => {
    if (id === undefined || title === undefined || courseId === undefined) {
      return
    }
    publish({ id, title, courseId })
  }, [id, title, courseId, publish])
}
