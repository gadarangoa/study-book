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

type Actions = {
  publish: <K extends Kind>(kind: K, entity: NonNullable<Entities[K]>) => void
  retract: (kind: Kind, id: string) => void
}

// Entities and actions live in separate contexts so publishing pages (which
// only need the stable actions) don't re-render when any entity changes.
const EntitiesContext = React.createContext<Entities | null>(null)
const ActionsContext = React.createContext<Actions | null>(null)

/**
 * Pages publish the entities they already loaded (course, career, document)
 * so the header breadcrumb can show live names without re-reading Firestore.
 */
export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [entities, setEntities] = React.useState<Entities>({})

  const actions = React.useMemo<Actions>(
    () => ({
      publish: (kind, entity) => {
        setEntities((prev) => ({ ...prev, [kind]: entity }))
      },
      // Only clears the slot if it still holds the entity being retracted, so
      // a page unmounting late can't wipe what the next page published.
      retract: (kind, id) => {
        setEntities((prev) =>
          prev[kind]?.id === id ? { ...prev, [kind]: undefined } : prev
        )
      },
    }),
    []
  )

  return (
    <ActionsContext.Provider value={actions}>
      <EntitiesContext.Provider value={entities}>
        {children}
      </EntitiesContext.Provider>
    </ActionsContext.Provider>
  )
}

function useRequired<T>(ctx: React.Context<T | null>): T {
  const value = React.useContext(ctx)
  if (value === null) {
    throw new Error("Breadcrumb hooks must be used within a BreadcrumbProvider")
  }
  return value
}

export function useBreadcrumbEntities() {
  return useRequired(EntitiesContext)
}

/**
 * Publishes `entity` under `kind` while the caller is mounted. Pass `null`
 * (e.g. while loading) to publish nothing. Only the fields of the entity type
 * are published, keyed by value so object identity changes don't re-publish.
 */
export function usePublishBreadcrumb<K extends Kind>(
  kind: K,
  entity: NonNullable<Entities[K]> | null | undefined
) {
  const { publish, retract } = useRequired(ActionsContext)
  const key = entity ? JSON.stringify(pick(kind, entity)) : null

  React.useEffect(() => {
    if (key === null) return undefined
    const value = JSON.parse(key) as NonNullable<Entities[K]>
    publish(kind, value)
    return () => retract(kind, value.id)
  }, [kind, key, publish, retract])
}

function pick(kind: Kind, entity: { id: string } & Record<string, unknown>) {
  switch (kind) {
    case "career":
      return { id: entity.id, name: entity.name }
    case "course":
      return { id: entity.id, name: entity.name, careerId: entity.careerId }
    case "document":
      return { id: entity.id, title: entity.title, courseId: entity.courseId }
  }
}
