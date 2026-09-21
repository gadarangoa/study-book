import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = "", value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-full bg-muted h-2 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
)

Progress.displayName = "Progress"

export { Progress }
