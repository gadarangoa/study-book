/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type BreadcrumbCareer = { id: string; name: string }
export type BreadcrumbCourse = { id: string; name: string; careerId: string }
export type BreadcrumbDocument = { id: string; title: string; courseId: string }

type Entities = {
  career?: BreadcrumbCareer
  course?: BreadcrumbCourse
  document?: BreadcrumbDocument
}

type Kind = keyof Entities

type BreadcrumbContextValue = {
  entities: Entities
  publish: <K extends Kind>(kind: K, entity: Entities[K]) => void
  retract: (kind: Kind, id: string) => void
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(
  null
)

/**
 * Pages publish the entities they already loaded (course, career, document)
 * so the header breadcrumb can show live names without re-reading Firestore.
 */
export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = React.useState<Entities>({})

  const publish = React.useCallback(
    <K extends Kind>(kind: K, entity: Entities[K]) => {
      setEntities((prev) => ({ ...prev, [kind]: entity }))
    },
    []
  )

  // Only clears the slot if it still holds the entity being retracted, so a
  // page unmounting late can't wipe what the next page already published.
  const retract = React.useCallback((kind: Kind, id: string) => {
    setEntities((prev) =>
      prev[kind]?.id === id ? { ...prev, [kind]: undefined } : prev
    )
  }, [])

  const value = React.useMemo(
    () => ({ entities, publish, retract }),
    [entities, publish, retract]
  )

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

function useBreadcrumbContext() {
  const ctx = React.useContext(BreadcrumbContext)
  if (!ctx) {
    throw new Error("Breadcrumb hooks must be used within a BreadcrumbProvider")
  }
  return ctx
}

export function useBreadcrumbEntities() {
  return useBreadcrumbContext().entities
}

export function usePublishCourse(course: BreadcrumbCourse | null | undefined) {
  const { publish, retract } = useBreadcrumbContext()
  const id = course?.id
  const name = course?.name
  const careerId = course?.careerId

  React.useEffect(() => {
    if (id === undefined || name === undefined || careerId === undefined) {
      return undefined
    }
    publish("course", { id, name, careerId })
    return () => retract("course", id)
  }, [id, name, careerId, publish, retract])
}

export function usePublishCareer(career: BreadcrumbCareer | null | undefined) {
  const { publish, retract } = useBreadcrumbContext()
  const id = career?.id
  const name = career?.name

  React.useEffect(() => {
    if (id === undefined || name === undefined) return undefined
    publish("career", { id, name })
    return () => retract("career", id)
  }, [id, name, publish, retract])
}

export function usePublishDocument(
  document: BreadcrumbDocument | null | undefined
) {
  const { publish, retract } = useBreadcrumbContext()
  const id = document?.id
  const title = document?.title
  const courseId = document?.courseId

  React.useEffect(() => {
    if (id === undefined || title === undefined || courseId === undefined) {
      return undefined
    }
    publish("document", { id, title, courseId })
    return () => retract("document", id)
  }, [id, title, courseId, publish, retract])
}
