# UI Contracts: Course Modules

**Feature**: 001-course-modules
**Date**: 2026-09-02

## Contract Type

This is an SPA with no external API. The "contracts" are the UI component
interfaces — the props and data shapes that flow between components.

## Career Components

### CareerCard

```typescript
interface CareerCardProps {
  career: Career
  courseCount: number
  totalPendingTasks: number
  onEdit: (career: Career) => void
  onDelete: (career: Career) => void
  onSelect: (careerId: string) => void
}
```

**Renders**: Career name, description preview, course count badge,
pending task count badge, action menu (edit/delete).

### CareerForm

```typescript
interface CareerFormProps {
  career?: Career  // undefined for create, populated for edit
  onSubmit: (data: CareerFormData) => void
  onCancel: () => void
}

interface CareerFormData {
  name: string
  description?: string
}
```

**Renders**: Dialog with name input (required) and description textarea
(optional). Submit button labeled "Create" or "Save".

## Course Components

### CourseCard

```typescript
interface CourseCardProps {
  course: Course
  pendingTaskCount: number
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
  onSelect: (courseId: string) => void
}
```

**Renders**: Course name, teacher name (if set), pending task count badge,
action menu (edit/delete).

### CourseForm

```typescript
interface CourseFormProps {
  careerId: string
  course?: Course  // undefined for create, populated for edit
  onSubmit: (data: CourseFormData) => void
  onCancel: () => void
}

interface CourseFormData {
  name: string
  teacher?: string
  description?: string
}
```

**Renders**: Dialog with name input (required), teacher input (optional),
description textarea (optional).

### CourseDetail

```typescript
interface CourseDetailProps {
  course: Course
  resources: Resource[]
  tasks: Task[]
  partners: Partner[]
  scheduleEntries: ScheduleEntry[]
}
```

**Renders**: Tabs layout (Resources | Tasks | Partners | Schedule).
Each tab shows the relevant list with add/edit/delete actions.

## Resource Components

### ResourceList

```typescript
interface ResourceListProps {
  resources: Resource[]
  filter?: "note" | "link"  // undefined = show all
  onFilterChange: (filter: "note" | "link" | undefined) => void
  onAdd: () => void
  onEdit: (resource: Resource) => void
  onDelete: (resource: Resource) => void
}
```

**Renders**: Filter toggle (All | Notes | Links), resource cards with
title, type badge, and action menu.

### NoteForm

```typescript
interface NoteFormProps {
  resource?: Resource  // undefined for create, populated for edit
  onSubmit: (data: NoteFormData) => void
  onCancel: () => void
}

interface NoteFormData {
  type: "note"
  title: string
  content?: string
}
```

### LinkForm

```typescript
interface LinkFormProps {
  resource?: Resource  // undefined for create, populated for edit
  onSubmit: (data: LinkFormData) => void
  onCancel: () => void
}

interface LinkFormData {
  type: "link"
  title: string
  url: string
  description?: string
}
```

## Task Components

### TaskList

```typescript
interface TaskListProps {
  tasks: Task[]
  onAdd: () => void
  onToggleStatus: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}
```

**Renders**: Two sections — "Pending" and "Completed". Each task shows
title, due date (if set), and a checkbox to toggle status.

### TaskForm

```typescript
interface TaskFormProps {
  task?: Task  // undefined for create, populated for edit
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

interface TaskFormData {
  title: string
  dueDate?: string  // YYYY-MM-DD
}
```

## Partner Components

### PartnerList

```typescript
interface PartnerListProps {
  partners: Partner[]
  onAdd: (name: string) => void
  onDelete: (partnerId: string) => void
}
```

**Renders**: List of partner names with delete button next to each.
Inline input + add button at the bottom.

## ScheduleEntry Components

### ScheduleEntryList

```typescript
interface ScheduleEntryListProps {
  entries: ScheduleEntry[]
  onAdd: (entry: ScheduleEntryFormData) => void
  onDelete: (entryId: string) => void
}

interface ScheduleEntryFormData {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  startTime: string  // HH:MM
  endTime: string    // HH:MM
  location?: string
}
```

## Hook Contracts

### useCareers

```typescript
function useCareers(): {
  careers: CareerWithStats[]
  isLoading: boolean
  createCareer: (data: CareerFormData) => Promise<Career>
  updateCareer: (id: string, data: CareerFormData) => Promise<Career>
  deleteCareer: (id: string) => Promise<void>
}

interface CareerWithStats extends Career {
  courseCount: number
  totalPendingTasks: number
}
```

### useCourses

```typescript
function useCourses(careerId: string): {
  courses: CourseWithStats[]
  isLoading: boolean
  createCourse: (data: CourseFormData) => Promise<Course>
  updateCourse: (id: string, data: CourseFormData) => Promise<Course>
  deleteCourse: (id: string) => Promise<void>
}

interface CourseWithStats extends Course {
  pendingTaskCount: number
}
```

### useResources

```typescript
function useResources(courseId: string): {
  resources: Resource[]
  isLoading: boolean
  createResource: (data: NoteFormData | LinkFormData) => Promise<Resource>
  updateResource: (id: string, data: NoteFormData | LinkFormData) => Promise<Resource>
  deleteResource: (id: string) => Promise<void>
}
```

### useTasks

```typescript
function useTasks(courseId: string): {
  tasks: Task[]
  pendingTasks: Task[]
  completedTasks: Task[]
  isLoading: boolean
  createTask: (data: TaskFormData) => Promise<Task>
  updateTask: (id: string, data: TaskFormData) => Promise<Task>
  toggleTaskStatus: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}
```

### usePartners

```typescript
function usePartners(courseId: string): {
  partners: Partner[]
  isLoading: boolean
  addPartner: (name: string) => Promise<Partner>
  removePartner: (id: string) => Promise<void>
}
```

## Route Contracts

| Route                   | Component      | Params            | Layout    |
|-------------------------|----------------|-------------------|-----------|
| `/dashboard`            | DashboardPage  | —                 | AppLayout |
| `/careers/:careerId`    | CareerDetail   | careerId (UUID)   | AppLayout |
| `/courses/:courseId`    | CourseDetail   | courseId (UUID)    | AppLayout |
