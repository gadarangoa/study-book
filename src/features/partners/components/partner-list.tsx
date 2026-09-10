import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrashIcon } from "lucide-react"
import type { Partner } from "../types"

interface PartnerListProps {
  partners: Partner[]
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}

export function PartnerList({ partners, onAdd, onDelete }: PartnerListProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim())
    setName("")
  }

  return (
    <div className="flex flex-col gap-3">
      {partners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No partners yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{partner.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(partner.id)}
              >
                <TrashIcon />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Partner name"
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="sm">
          Add
        </Button>
      </form>
    </div>
  )
}
