import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  stats?: string
  href: string
  color?: "default" | "blue" | "green" | "purple" | "orange"
}

const colorStyles = {
  default: "bg-muted/50",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  stats,
  href,
  color = "default",
}: FeatureCardProps) {
  return (
    <Link to={href} className="block group">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorStyles[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {stats && (
            <Badge variant="secondary" className="text-xs">
              {stats}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
