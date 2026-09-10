import { useEffect, useMemo, useState } from "react"
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
import { getAll } from "@/lib/db"
import type { Course } from "@/features/courses/types"

export function DashboardPage() {
  const { careers, isLoading, createCareer, updateCareer, deleteCareer } =
    useCareers()
  const [addOpen, setAddOpen] = useState(false)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    getAll("courses").then(setAllCourses)
  }, [])

  const careerNameById = useMemo(() => {
    return new Map(careers.map((c) => [c.id, c.name]))
  }, [careers])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Organize your courses by career.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add Career
        </Button>
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
            <h2 className="text-lg font-semibold">Browse by tag</h2>
            <p className="text-sm text-muted-foreground">
              Filter all your courses across careers.
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
              No courses match the selected tags.
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
