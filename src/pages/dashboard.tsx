import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "lucide-react"
import { useCareers } from "@/features/careers"
import { CareerList } from "@/features/careers/components/career-list"
import { CareerForm } from "@/features/careers/components/career-form"
import { CourseTagFilter } from "@/features/courses/components/course-tag-filter"
import { collectAllTags, matchesTags } from "@/features/courses/lib/tags"
import {
  CourseProgressChart,
  StatTiles,
  UpcomingDeadlines,
  daysUntil,
  useDashboardData,
  type CourseOverview,
  type DeadlineItem,
} from "@/features/dashboard"

export function DashboardPage() {
  const { careers, isLoading, createCareer, updateCareer, deleteCareer } =
    useCareers()
  const [addOpen, setAddOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [careerFilter, setCareerFilter] = useState<string | null>(null)
  const {
    courses: allCourses,
    tasks,
    documents,
    isLoading: isDataLoading,
  } = useDashboardData(careers)

  const careerNameById = useMemo(() => {
    return new Map(careers.map((c) => [c.id, c.name]))
  }, [careers])

  const overview = useMemo(() => {
    const today = new Date()
    const visibleCourses = careerFilter
      ? allCourses.filter((c) => c.careerId === careerFilter)
      : allCourses
    const courseById = new Map(visibleCourses.map((c) => [c.id, c]))
    const visibleTasks = tasks.filter((t) => courseById.has(t.courseId))

    const deadlines: DeadlineItem[] = visibleTasks
      .filter((t) => t.status === "pending" && t.dueDate)
      .map((t) => {
        const course = courseById.get(t.courseId)!
        return {
          id: t.id,
          title: t.title,
          dueDate: t.dueDate!,
          days: daysUntil(t.dueDate!, today),
          courseId: course.id,
          courseName: course.name,
          careerName: careerNameById.get(course.careerId),
        }
      })
      .sort((a, b) => a.days - b.days)

    const docCount = new Map<string, number>()
    for (const d of documents) {
      docCount.set(d.courseId, (docCount.get(d.courseId) ?? 0) + 1)
    }

    const courseCards: CourseOverview[] = visibleCourses
      .map((course) => {
        const courseTasks = visibleTasks.filter((t) => t.courseId === course.id)
        const courseDeadlines = deadlines.filter((d) => d.courseId === course.id)
        const next =
          courseDeadlines.find((d) => d.days >= 0) ?? courseDeadlines[0]
        return {
          id: course.id,
          name: course.name,
          careerName: careerNameById.get(course.careerId),
          pending: courseTasks.filter((t) => t.status === "pending").length,
          completed: courseTasks.filter((t) => t.status === "complete").length,
          overdue: courseDeadlines.filter((d) => d.days < 0).length,
          nextTask: next ? { title: next.title, days: next.days } : undefined,
          daysToEnd: course.endDate ? daysUntil(course.endDate, today) : undefined,
          documentCount: docCount.get(course.id) ?? 0,
        }
      })
      // Courses with the most urgent deadline first; those without go last.
      .sort(
        (a, b) =>
          (a.nextTask?.days ?? Infinity) - (b.nextTask?.days ?? Infinity) ||
          a.name.localeCompare(b.name)
      )

    return {
      deadlines,
      courseCards,
      stats: {
        overdue: deadlines.filter((d) => d.days < 0).length,
        dueThisWeek: deadlines.filter((d) => d.days >= 0 && d.days <= 7).length,
        pending: visibleTasks.filter((t) => t.status === "pending").length,
        completed: visibleTasks.filter((t) => t.status === "complete").length,
      },
    }
  }, [allCourses, tasks, documents, careerFilter, careerNameById])

  const allTags = useMemo(() => collectAllTags(allCourses), [allCourses])

  const filteredCourses = useMemo(
    () => allCourses.filter((c) => matchesTags(c.tags, selectedTags)),
    [allCourses, selectedTags]
  )

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Panel general</h1>
          <p className="text-muted-foreground">
            Lo que viene en cada uno de tus cursos.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Agregar carrera
        </Button>
      </div>

      {careers.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={careerFilter === null ? "default" : "outline"}
            onClick={() => setCareerFilter(null)}
          >
            Todas
          </Button>
          {careers.map((career) => (
            <Button
              key={career.id}
              size="sm"
              variant={careerFilter === career.id ? "default" : "outline"}
              onClick={() => setCareerFilter(career.id)}
            >
              {career.name}
            </Button>
          ))}
        </div>
      )}

      <StatTiles {...overview.stats} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="lg:max-h-[640px] lg:overflow-y-auto">
          <UpcomingDeadlines items={overview.deadlines} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avance por curso</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseProgressChart courses={overview.courseCards} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Carreras</h2>
        <p className="text-sm text-muted-foreground">
          Organiza tus cursos por carrera.
        </p>
      </div>
      <CareerList
        careers={careers}
        onUpdate={updateCareer}
        onDelete={deleteCareer}
        onAdd={() => setAddOpen(true)}
      />

      <CareerForm
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={createCareer}
      />

      {allTags.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold">Explorar por etiqueta</h2>
            <p className="text-sm text-muted-foreground">
              Filtra todos tus cursos entre carreras.
            </p>
          </div>
          <CourseTagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onToggle={toggleTag}
            onClear={() => setSelectedTags([])}
          />
          {filteredCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ningún curso coincide con las etiquetas seleccionadas.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardHeader className="space-y-0 pb-2">
                      <CardTitle className="text-sm truncate">
                        {course.name}
                      </CardTitle>
                      {careerNameById.get(course.careerId) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {careerNameById.get(course.careerId)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {(course.tags ?? []).map((tag) => (
                          <Badge
                            key={tag}
                            variant={
                              selectedTags.includes(tag)
                                ? "default"
                                : "secondary"
                            }
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
