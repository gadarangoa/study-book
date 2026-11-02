import { Fragment, useEffect, useState } from "react"
import { Link, matchPath, useLocation } from "react-router"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { getById } from "@/lib/db"
import { cn } from "@/lib/utils"
import {
  useBreadcrumbEntities,
  type BreadcrumbCareer,
} from "@/components/breadcrumb-context"

/** Route shapes the breadcrumb understands; keep in sync with App.tsx. */
const ROUTES = {
  career: "/careers/:careerId",
  course: "/courses/:courseId",
  section: "/courses/:courseId/:section",
  document: "/courses/:courseId/documents/:documentId",
} as const

const SECTION_LABELS: Record<string, string> = {
  resources: "Recursos",
  documents: "Documentos",
  team: "Equipo",
}

type Crumb = { label: string; to?: string; pending?: boolean }

function useRouteParams() {
  const { pathname } = useLocation()
  const doc = matchPath(ROUTES.document, pathname)
  if (doc) {
    return {
      courseId: doc.params.courseId,
      section: "documents",
      documentId: doc.params.documentId,
    }
  }
  const section = matchPath(ROUTES.section, pathname)
  if (
    section &&
    section.params.section &&
    SECTION_LABELS[section.params.section]
  ) {
    return {
      courseId: section.params.courseId,
      section: section.params.section,
    }
  }
  const course = matchPath(ROUTES.course, pathname)
  if (course) return { courseId: course.params.courseId }
  const career = matchPath(ROUTES.career, pathname)
  if (career) return { careerId: career.params.careerId }
  return {}
}

// Career names rarely change; cache them for the session so moving between
// a career and its courses doesn't re-read Firestore each time.
const careerNameCache = new Map<string, string>()

/**
 * Course pages don't load the career, so look it up here. A failure (e.g. a
 * collaborator without read access to the owner's career) only leaves the
 * career crumb with its generic label instead of breaking the rest.
 */
function useCareerName(careerId: string | undefined, published?: string) {
  const [fetched, setFetched] = useState<BreadcrumbCareer | null>(null)

  if (careerId && published !== undefined) {
    careerNameCache.set(careerId, published)
  }
  const cached = careerId ? careerNameCache.get(careerId) : undefined

  useEffect(() => {
    if (!careerId || published !== undefined || careerNameCache.has(careerId)) {
      return undefined
    }
    let cancelled = false
    getById("careers", careerId)
      .then((career) => {
        if (!career) return
        careerNameCache.set(careerId, career.name)
        if (!cancelled) setFetched({ id: careerId, name: career.name })
      })
      .catch(() => {
        // Career is optional context; keep the generic label.
      })
    return () => {
      cancelled = true
    }
  }, [careerId, published])

  return (
    published ??
    cached ??
    (fetched && fetched.id === careerId ? fetched.name : undefined)
  )
}

export function AppBreadcrumbs() {
  const { careerId, courseId, section, documentId } = useRouteParams()
  const entities = useBreadcrumbEntities()

  // Only trust published entities that belong to the current route.
  const course =
    courseId && entities.course?.id === courseId ? entities.course : undefined
  const document =
    documentId &&
    entities.document?.id === documentId &&
    entities.document.courseId === courseId
      ? entities.document
      : undefined

  const routeCareerId = careerId ?? course?.careerId
  const careerName = useCareerName(
    routeCareerId,
    routeCareerId && entities.career?.id === routeCareerId
      ? entities.career.name
      : undefined
  )

  // Missing names (loading, not found or no access) fall back to a generic,
  // dimmed label so the crumb stays readable and navigable.
  const crumbs: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }]
  if (routeCareerId) {
    crumbs.push({
      label: careerName ?? "Carrera",
      pending: careerName === undefined,
      to: `/careers/${routeCareerId}`,
    })
  }
  if (courseId) {
    crumbs.push({
      label: course?.name ?? "Curso",
      pending: !course,
      to: `/courses/${courseId}`,
    })
    if (section) {
      crumbs.push({
        label: SECTION_LABELS[section],
        to: `/courses/${courseId}/${section}`,
      })
    }
    if (documentId) {
      crumbs.push({ label: document?.title ?? "Documento", pending: !document })
    }
  }

  const last = crumbs.length - 1
  const parent = last > 0 ? crumbs[last - 1] : undefined

  return (
    <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1">
      {parent?.to && (
        <Link
          to={parent.to}
          className="flex shrink-0 items-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label={`Volver a ${parent.label}`}
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
      )}
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => {
          const isLast = i === last
          return (
            <Fragment key={`${i}-${crumb.to ?? "current"}`}>
              {i > 0 && (
                <li aria-hidden className="hidden shrink-0 md:block">
                  <ChevronRightIcon className="size-3.5" />
                </li>
              )}
              <li
                className={cn(
                  "min-w-0",
                  isLast ? "flex" : "hidden md:flex",
                  !isLast && i > 0 && "max-w-40"
                )}
              >
                {isLast || !crumb.to ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      "truncate font-medium",
                      crumb.pending
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className={cn(
                      "truncate transition-colors hover:text-foreground",
                      crumb.pending && "opacity-70"
                    )}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
