import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Course, ScheduleEntry } from "../types"
import { ScheduleEntryList } from "./schedule-entry-list"
import type { ScheduleEntryFormData } from "../types"

interface CourseDetailProps {
  course: Course
  scheduleEntries: ScheduleEntry[]
  onAddSchedule: (data: ScheduleEntryFormData) => void
  onDeleteSchedule: (id: string) => void
  resourcesTab?: React.ReactNode
  tasksTab?: React.ReactNode
  partnersTab?: React.ReactNode
}

export function CourseDetail({
  course,
  scheduleEntries,
  onAddSchedule,
  onDeleteSchedule,
  resourcesTab,
  tasksTab,
  partnersTab,
}: CourseDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{course.name}</h1>
        {course.teacher && (
          <p className="text-muted-foreground">{course.teacher}</p>
        )}
        {(course.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(course.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {course.description && (
          <p className="text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="mt-4">
          <ScheduleEntryList
            entries={scheduleEntries}
            onAdd={onAddSchedule}
            onDelete={onDeleteSchedule}
          />
        </TabsContent>
        <TabsContent value="resources" className="mt-4">
          {resourcesTab ?? (
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          )}
        </TabsContent>
        <TabsContent value="tasks" className="mt-4">
          {tasksTab ?? (
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          )}
        </TabsContent>
        <TabsContent value="partners" className="mt-4">
          {partnersTab ?? (
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
