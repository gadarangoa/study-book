import { Fragment, useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import { ChevronRightIcon } from "lucide-react"

import { getById } from "@/lib/db"
import { cn } from "@/lib/utils"

type Crumb = { label: string; to?: string }

const SECTION_LABELS: Record<string, string> = {
  resources: "Recursos",
  documents: "Documentos",
  team: "Equipo",
}

type Names = {
  career?: { id: string; name: string }
  course?: { id: string; name: string }
  document?: string
}

function useEntityNames(): Names {
  const { careerId, courseId, documentId } = useParams()
  const [names, setNames] = useState<Names>({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      const next: Names = {}
      if (courseId) {
        const course = await getById("courses", courseId)
        if (course) {
          next.course = { id: courseId, name: course.name }
          const career = await getById("careers", course.careerId)
          if (career) next.career = { id: course.careerId, name: career.name }
        }
      } else if (careerId) {
        const career = await getById("careers", careerId)
        if (career) next.career = { id: careerId, name: career.name }
      }
      if (documentId) {
        const doc = await getById("apaDocuments", documentId)
        if (doc) next.document = doc.title
      }
      if (!cancelled) setNames(next)
    }

    load().catch(() => {
      if (!cancelled) setNames({})
    })

    return () => {
      cancelled = true
    }
  }, [careerId, courseId, documentId])

  return names
}

export function AppBreadcrumbs() {
  const { pathname } = useLocation()
  const { courseId, documentId } = useParams()
  const names = useEntityNames()

  const crumbs: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }]
  if (names.career) {
    crumbs.push({ label: names.career.name, to: `/careers/${names.career.id}` })
  }
  if (courseId) {
    crumbs.push({ label: names.course?.name ?? "…", to: `/courses/${courseId}` })
    const section = pathname.split("/")[3]
    if (section && SECTION_LABELS[section]) {
      crumbs.push({
        label: SECTION_LABELS[section],
        to: `/courses/${courseId}/${section}`,
      })
    }
    if (documentId) {
      crumbs.push({ label: names.document ?? "…" })
    }
  }

  const last = crumbs.length - 1

  return (
    <nav aria-label="breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, i) => {
          const isLast = i === last
          return (
            <Fragment key={`${i}-${crumb.label}`}>
              {i > 0 && (
                <li
                  aria-hidden
                  className={cn("shrink-0", i < last && "hidden md:block")}
                >
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
