export interface Resource {
  id: string
  courseId: string
  type: "note" | "link"
  title: string
  content?: string
  url?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface NoteFormData {
  type: "note"
  title: string
  content?: string
}

export interface LinkFormData {
  type: "link"
  title: string
  url: string
  description?: string
}
