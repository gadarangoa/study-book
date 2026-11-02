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

type Crumb = { label: string | null; to?: string }

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

/**
 * Course pages don't load the career, so look it up here. A failure (e.g. a
 * collaborator without read access to the owner's career) just hides that
 * crumb instead of breaking the rest.
 */
function useCareerLookup(careerId: string | undefined, known: boolean) {
  const [fetched, setFetched] = useState<BreadcrumbCareer | null>(null)

  useEffect(() => {
    if (!careerId || known) return undefined
    let cancelled = false
    getById("careers", careerId)
      .then((career) => {
        if (!cancelled && career)
          setFetched({ id: careerId, name: career.name })
      })
      .catch(() => {
        // Career is optional context; ignore read errors.
      })
    return () => {
      cancelled = true
    }
  }, [careerId, known])

  return fetched && fetched.id === careerId ? fetched : null
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

  const careerIdForRoute = careerId ?? course?.careerId
  const publishedCareer =
    careerIdForRoute && entities.career?.id === careerIdForRoute
      ? entities.career
      : undefined
  const fetchedCareer = useCareerLookup(
    courseId ? course?.careerId : undefined,
    publishedCareer !== undefined
  )
  const career = publishedCareer ?? fetchedCareer

  const crumbs: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }]
  if (careerId) {
    crumbs.push({ label: career?.name ?? null, to: `/careers/${careerId}` })
  } else if (career) {
    crumbs.push({ label: career.name, to: `/careers/${career.id}` })
  }
  if (courseId) {
    crumbs.push({ label: course?.name ?? null, to: `/courses/${courseId}` })
    if (section) {
      crumbs.push({
        label: SECTION_LABELS[section],
        to: `/courses/${courseId}/${section}`,
      })
    }
    if (documentId) {
      crumbs.push({ label: document?.title ?? null })
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
          aria-label={`Volver a ${parent.label ?? "nivel anterior"}`}
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
                {crumb.label === null ? (
                  <span
                    aria-hidden
                    className="h-3.5 w-20 animate-pulse rounded bg-muted"
                  />
                ) : isLast || !crumb.to ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="truncate font-medium text-foreground"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="truncate transition-colors hover:text-foreground"
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
