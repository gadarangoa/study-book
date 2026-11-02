import { cn } from "@/lib/utils"
import { DUE_VARIANT_CLASSES, dueLabel, dueVariant } from "../lib/days"

export function DueBadge({ days, className }: { days: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center px-2 text-xs font-medium whitespace-nowrap",
        DUE_VARIANT_CLASSES[dueVariant(days)],
        className
      )}
    >
      {dueLabel(days)}
    </span>
  )
}
