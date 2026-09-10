export interface Career {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CareerFormData {
  name: string
  description?: string
}

export interface CareerWithStats extends Career {
  courseCount: number
  totalPendingTasks: number
}
