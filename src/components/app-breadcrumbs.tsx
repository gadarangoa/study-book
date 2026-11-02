import { Fragment, useEffect, useState } from "react"
import { Link, matchPath, useLocation } from "react-router"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { getById } from "@/lib/db"
import { cn } from "@/lib/utils"
import { usePublishedDocument } from "@/components/breadcrumb-context"
import { useNavData } from "@/components/nav-data-context"
import type { Course } from "@/features/courses/types"

/**
 * Route shapes the breadcrumb understands; keep in sync with App.tsx.
 * (react-router's `useMatches` + route `handle` would avoid this copy, but it
 * requires migrating from <BrowserRouter> to a data router.)
 */
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

/**
 * Resolves a course that isn't in the user's own list (e.g. a course shared
 * with a collaborator). Stale responses are ignored by checking the id.
 */
function useSharedCourse(courseId: string | undefined, enabled: boolean) {
  const [fetched, setFetched] = useState<Course | null>(null)

  useEffect(() => {
    if (!courseId || !enabled) return undefined
    let cancelled = false
    getById("courses", courseId)
      .then((course) => {
        if (!cancelled && course) setFetched(course)
      })
      .catch(() => {
        // Keep the generic label; the page itself reports the error.
      })
    return () => {
      cancelled = true
    }
  }, [courseId, enabled])

  return fetched && fetched.id === courseId ? fetched : undefined
}

/** Empty strings (e.g. a cleared title) count as missing. */
function nonEmpty(value: string | undefined) {
  return value && value.trim() ? value : undefined
}

export function AppBreadcrumbs() {
  const { careerId, courseId, section, documentId } = useRouteParams()
  const { careers, courses, coursesLoaded } = useNavData()
  const publishedDocument = usePublishedDocument()

  const ownCourse = courseId
    ? courses.find((c) => c.id === courseId)
    : undefined
  const sharedCourse = useSharedCourse(
    courseId,
    coursesLoaded && ownCourse === undefined
  )
  const course = ownCourse ?? sharedCourse

  // Only show the career when it's one the user can open; a shared course's
  // career belongs to its owner, so it's left out instead of linking to a
  // page the collaborator can't read.
  const routeCareerId = careerId ?? course?.careerId
  const career = routeCareerId
    ? careers.find((c) => c.id === routeCareerId)
    : undefined

  const document =
    documentId &&
    publishedDocument?.id === documentId &&
    publishedDocument.courseId === courseId
      ? publishedDocument
      : undefined

  // Missing names (loading, not found or no access) fall back to a generic,
  // dimmed label so the crumb stays readable and navigable.
  const crumbs: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }]
  if (careerId) {
    const name = nonEmpty(career?.name)
    crumbs.push({
      label: name ?? "Carrera",
      pending: !name,
      to: `/careers/${careerId}`,
    })
  } else if (career) {
    crumbs.push({
      label: nonEmpty(career.name) ?? "Carrera",
      to: `/careers/${career.id}`,
    })
  }
  if (courseId) {
    const name = nonEmpty(course?.name)
    crumbs.push({
      label: name ?? "Curso",
      pending: !name,
      to: `/courses/${courseId}`,
    })
    if (section) {
      crumbs.push({
        label: SECTION_LABELS[section],
        to: `/courses/${courseId}/${section}`,
      })
    }
    if (documentId) {
      const title = nonEmpty(document?.title)
      crumbs.push({ label: title ?? "Documento", pending: !title })
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
