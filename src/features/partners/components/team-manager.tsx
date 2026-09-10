import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { Partner } from "../types"

interface TeamManagerProps {
  teamName?: string
  partners: Partner[]
  onTeamNameChange: (name: string | undefined) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function TeamManager({
  teamName,
  partners,
  onTeamNameChange,
  onAdd,
  onDelete,
}: TeamManagerProps) {
  const [draftName, setDraftName] = useState(teamName ?? "")
  const [member, setMember] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraftName(teamName ?? "")
  }, [teamName])

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    const value = member.trim()
    if (!value) return
    onAdd(value)
    setMember("")
    inputRef.current?.focus()
  }

  const isDirty = (draftName.trim() || undefined) !== (teamName ?? undefined)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Group name</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              onTeamNameChange(draftName.trim() || undefined)
            }}
          >
            <div className="flex-1 flex flex-col gap-2">
              <Label htmlFor="team-name" className="sr-only">
                Group name
              </Label>
              <Input
                id="team-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. Los Algoritmos"
              />
            </div>
            <Button type="submit" disabled={!isDirty}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="flex-1">
            <CardTitle className="text-base">Members</CardTitle>
          </div>
          <Badge variant="secondary">{partners.length}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {partners.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members yet. Add the first one below.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {initials(partner.name)}
                  </span>
                  <span className="flex-1 truncate">{partner.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(partner.id)}
                  >
                    <TrashIcon />
                    <span className="sr-only">Remove {partner.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddMember} className="flex gap-2">
            <Input
              ref={inputRef}
              value={member}
              onChange={(e) => setMember(e.target.value)}
              placeholder="Member name — press Enter to add"
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <PlusIcon data-icon="inline-start" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
