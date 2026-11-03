import { differenceInCalendarDays, parseISO } from "date-fns"
import type { Task } from "../types"

/** Display status: "overdue" is derived (pending + due date in the past), never stored. */
export type TaskDisplayStatus = "pending" | "overdue" | "complete"

export function getTaskStatus(
  task: Pick<Task, "status" | "dueDate">,
  today: Date = new Date()
): TaskDisplayStatus {
  if (task.status === "complete") return "complete"
  if (
    task.dueDate &&
    differenceInCalendarDays(parseISO(task.dueDate), today) < 0
  ) {
    return "overdue"
  }
  return "pending"
}

export const TASK_STATUS_LABELS: Record<TaskDisplayStatus, string> = {
  pending: "Pendiente",
  overdue: "Vencida",
  complete: "Completada",
}

export const TASK_STATUS_CLASSES: Record<TaskDisplayStatus, string> = {
  pending: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  overdue: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  complete: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
}
