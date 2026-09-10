import { Button } from "@/components/ui/button"
import { CareerCard } from "./career-card"
import type { CareerWithStats } from "../types"
import type { CareerFormData } from "../types"

interface CareerListProps {
  careers: CareerWithStats[]
  onUpdate: (id: string, data: CareerFormData) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function CareerList({ careers, onUpdate, onDelete, onAdd }: CareerListProps) {
  if (careers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          No careers yet. Create your first career to start organizing your courses.
        </p>
        <Button onClick={onAdd}>Add Career</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {careers.map((career) => (
        <CareerCard
          key={career.id}
          career={career}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
