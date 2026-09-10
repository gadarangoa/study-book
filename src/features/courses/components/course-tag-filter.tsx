import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CourseTagFilterProps {
  allTags: string[]
  selectedTags: string[]
  onToggle: (tag: string) => void
  onClear: () => void
}

export function CourseTagFilter({
  allTags,
  selectedTags,
  onToggle,
  onClear,
}: CourseTagFilterProps) {
  if (allTags.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag)
          return (
            <button key={tag} type="button" onClick={() => onToggle(tag)}>
              <Badge
                variant={active ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
              >
                {tag}
              </Badge>
            </button>
          )
        })}
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear ({selectedTags.length})
          </Button>
        )}
      </div>
    </div>
  )
}
