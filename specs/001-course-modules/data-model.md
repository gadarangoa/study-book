# Data Model: Course Modules

**Feature**: 001-course-modules
**Date**: 2026-09-02

## Entity Relationship Diagram

```text
User (auth context)
 └── has many Careers
      └── has many Courses
           ├── has many Resources (notes, links)
           ├── has many Tasks
           ├── has many Partners
           └── has many ScheduleEntries
```

## Entities

### Career

| Field       | Type     | Required | Notes                              |
|-------------|----------|----------|------------------------------------|
| id          | string   | yes      | UUID, auto-generated               |
| name        | string   | yes      | Non-empty, user-provided           |
| description | string   | no       | Plain text, optional               |
| createdAt   | string   | yes      | ISO 8601 timestamp                 |
| updatedAt   | string   | yes      | ISO 8601 timestamp                 |

**Relationships**: A Career has many Courses (one-to-many via `course.careerId`).

### Course

| Field       | Type     | Required | Notes                              |
|-------------|----------|----------|------------------------------------|
| id          | string   | yes      | UUID, auto-generated               |
| careerId    | string   | yes      | FK → Career.id                     |
| name        | string   | yes      | Non-empty, user-provided           |
| teacher     | string   | no       | Teacher/instructor name            |
| description | string   | no       | Plain text, optional               |
| createdAt   | string   | yes      | ISO 8601 timestamp                 |
| updatedAt   | string   | yes      | ISO 8601 timestamp                 |

**Relationships**: A Course belongs to one Career. A Course has many Resources,
Tasks, Partners, and ScheduleEntries.

### Resource

| Field     | Type     | Required | Notes                              |
|-----------|----------|----------|------------------------------------|
| id        | string   | yes      | UUID, auto-generated               |
| courseId   | string   | yes      | FK → Course.id                     |
| type      | enum     | yes      | "note" or "link"                   |
| title     | string   | yes      | Non-empty, user-provided           |
| content   | string   | no       | Note body text (for type="note")   |
| url       | string   | no       | URL string (for type="link")       |
| description | string | no       | Link description (for type="link") |
| createdAt | string   | yes      | ISO 8601 timestamp                 |
| updatedAt | string   | yes      | ISO 8601 timestamp                 |

**Validation**:
- If `type` is "note", `content` SHOULD be present (not enforced at data level).
- If `type` is "link", `url` MUST be present and valid URL format.
- `title` is always required regardless of type.

### Task

| Field     | Type     | Required | Notes                              |
|-----------|----------|----------|------------------------------------|
| id        | string   | yes      | UUID, auto-generated               |
| courseId   | string   | yes      | FK → Course.id                     |
| title     | string   | yes      | Non-empty, user-provided           |
| dueDate   | string   | no       | ISO 8601 date (YYYY-MM-DD)         |
| status    | enum     | yes      | "pending" or "complete"            |
| createdAt | string   | yes      | ISO 8601 timestamp                 |
| updatedAt | string   | yes      | ISO 8601 timestamp                 |

**State Transitions**:
- `pending` → `complete` (user marks as done)
- `complete` → `pending` (user marks as incomplete)

### Partner

| Field     | Type     | Required | Notes                              |
|-----------|----------|----------|------------------------------------|
| id        | string   | yes      | UUID, auto-generated               |
| courseId   | string   | yes      | FK → Course.id                     |
| name      | string   | yes      | Non-empty, user-provided           |
| createdAt | string   | yes      | ISO 8601 timestamp                 |

### ScheduleEntry

| Field     | Type     | Required | Notes                              |
|-----------|----------|----------|------------------------------------|
| id        | string   | yes      | UUID, auto-generated               |
| courseId   | string   | yes      | FK → Course.id                     |
| day       | enum     | yes      | "monday"-"sunday"                  |
| startTime | string   | yes      | 24h format (HH:MM)                 |
| endTime   | string   | yes      | 24h format (HH:MM)                 |
| location  | string   | no       | Room/building name                 |

**Validation**:
- `endTime` MUST be after `startTime`.
- Overlapping times within same course: warn but allow.

## IndexedDB Schema

Database name: `studybook`
Version: 1

| Store Name     | Key Path | Indexes                     |
|----------------|----------|-----------------------------|
| careers        | id       | name                        |
| courses        | id       | careerId, name              |
| resources      | id       | courseId, type               |
| tasks          | id       | courseId, status             |
| partners       | id       | courseId                     |
| scheduleEntries| id       | courseId, day                |

## Cascade Delete Rules

When a Career is deleted:
1. Query all Courses where `careerId = deletedCareer.id`
2. For each Course, delete all Resources, Tasks, Partners, ScheduleEntries
   where `courseId = deletedCourse.id`
3. Delete the Courses
4. Delete the Career

When a Course is deleted:
1. Delete all Resources where `courseId = deletedCourse.id`
2. Delete all Tasks where `courseId = deletedCourse.id`
3. Delete all Partners where `courseId = deletedCourse.id`
4. Delete all ScheduleEntries where `courseId = deletedCourse.id`
5. Delete the Course
