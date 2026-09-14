export interface Course {
  id: string
  uid: string
  careerId: string
  name: string
  teacher?: string
  description?: string
  schedule?: string
  startDate?: string
  endDate?: string
  teamName?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CourseFormData {
  name: string
  teacher?: string
  description?: string
  schedule?: string
  startDate?: string
  endDate?: string
  teamName?: string
  tags?: string[]
}

export interface CourseWithStats extends Course {
  pendingTaskCount: number
}

export interface ScheduleEntry {
  id: string
  courseId: string
  day: string
  startTime: string
  endTime: string
  location?: string
}

export interface ScheduleEntryFormData {
  day: string
  startTime: string
  endTime: string
  location?: string
}
