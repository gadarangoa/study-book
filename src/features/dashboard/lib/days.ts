import { differenceInCalendarDays, parseISO } from "date-fns"

export type DueVariant = "overdue" | "urgent" | "soon" | "later"

/** Calendar days from today until `date` (negative when it has passed). */
export function daysUntil(date: string, today: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(date), today)
}

export function dueVariant(days: number): DueVariant {
  if (days < 0) return "overdue"
  if (days <= 1) return "urgent"
  if (days <= 7) return "soon"
  return "later"
}

export function dueLabel(days: number): string {
  if (days < 0) {
    const n = Math.abs(days)
    return `Vencida hace ${n} día${n !== 1 ? "s" : ""}`
  }
  if (days === 0) return "Vence hoy"
  if (days === 1) return "Vence mañana"
  return `Faltan ${days} días`
}

export const DUE_VARIANT_CLASSES: Record<DueVariant, string> = {
  overdue: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  urgent: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  soon: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  later: "bg-secondary text-secondary-foreground",
}
