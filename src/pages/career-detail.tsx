import { useMemo, useState } from "react"
import { useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useCourses } from "@/features/courses"
import { CourseList } from "@/features/courses/components/course-list"
import { CourseForm } from "@/features/courses/components/course-form"
import { CourseTagFilter } from "@/features/courses/components/course-tag-filter"
import { collectAllTags, matchesTags } from "@/features/courses/lib/tags"
import { useNavData } from "@/components/nav-data-context"

export function CareerDetailPage() {
  const { careerId } = useParams<{ careerId: string }>()
  const { courses, isLoading, createCourse, updateCourse, deleteCourse } =
    useCourses(careerId ?? "")
  const [addOpen, setAddOpen] = useState(false)
  const { careers } = useNavData()
  const career = careers.find((c) => c.id === careerId) ?? null
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => collectAllTags(courses), [courses])

  const filteredCourses = useMemo(
    () => courses.filter((c) => matchesTags(c.tags, selectedTags)),
    [courses, selectedTags]
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
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{career?.name ?? "Career"}</h1>
          {career?.description && (
            <p className="text-muted-foreground">{career.description}</p>
          )}
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add Course
        </Button>
      </div>

      <CourseTagFilter
        allTags={allTags}
        selectedTags={selectedTags}
        onToggle={toggleTag}
        onClear={() => setSelectedTags([])}
      />

      {selectedTags.length > 0 && filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">
            No courses match the selected tags.
          </p>
          <Button variant="outline" onClick={() => setSelectedTags([])}>
            Clear filters
          </Button>
        </div>
      ) : (
        <CourseList
          courses={filteredCourses}
          onUpdate={updateCourse}
          onDelete={deleteCourse}
          onAdd={() => setAddOpen(true)}
        />
      )}

      {careerId && (
        <CourseForm
          careerId={careerId}
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={createCourse}
        />
      )}
    </div>
  )
}
