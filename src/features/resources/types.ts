export interface Resource {
  id: string
  courseId: string
  type: "note" | "link" | "pdf"
  title: string
  content?: string
  url?: string
  description?: string
  storagePath?: string
  fileName?: string
  isCompleted?: boolean
  readingProgress?: number
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

export interface PDFFormData {
  type: "pdf"
  title: string
  description?: string
  file: File
}
