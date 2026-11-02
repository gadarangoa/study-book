export interface Task {
  id: string
  courseId: string
  title: string
  dueDate?: string
  status: "pending" | "complete"
  createdAt: string
  updatedAt: string
}

export interface TaskFormData {
  title: string
  dueDate: string
}
