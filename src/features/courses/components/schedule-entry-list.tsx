import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { ScheduleEntry, ScheduleEntryFormData } from "../types"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

interface ScheduleEntryListProps {
  entries: ScheduleEntry[]
  onAdd: (data: ScheduleEntryFormData) => void
  onDelete: (id: string) => void
}

export function ScheduleEntryList({
  entries,
  onAdd,
  onDelete,
}: ScheduleEntryListProps) {
  const [day, setDay] = useState<string>("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!day || !startTime || !endTime) return
    onAdd({ day, startTime, endTime, location: location.trim() || undefined })
    setDay("")
    setStartTime("")
    setEndTime("")
    setLocation("")
    setShowForm(false)
  }

  const grouped = DAYS.reduce(
    (acc, d) => {
      const dayEntries = entries.filter((e) => e.day === d)
      if (dayEntries.length > 0) acc[d] = dayEntries
      return acc
    },
    {} as Record<string, ScheduleEntry[]>
  )

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(grouped).map(([d, dayEntries]) => (
        <div key={d} className="flex flex-col gap-1">
          <h4 className="text-xs font-medium capitalize text-muted-foreground">
            {d}
          </h4>
          {dayEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>
                {entry.startTime}–{entry.endTime}
                {entry.location && (
                  <span className="ml-2 text-muted-foreground">
                    @ {entry.location}
                  </span>
                )}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(entry.id)}
              >
                <TrashIcon />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      ))}

      {entries.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">No schedule entries yet.</p>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-md border p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="sched-day" className="text-xs">
                Day
              </Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger id="sched-day" className="h-8 text-xs">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sched-start" className="text-xs">
                Start
              </Label>
              <Input
                id="sched-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sched-end" className="text-xs">
                End
              </Label>
              <Input
                id="sched-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sched-location" className="text-xs">
                Location
              </Label>
              <Input
                id="sched-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-fit"
        >
          <PlusIcon data-icon="inline-start" />
          Add Schedule
        </Button>
      )}
    </div>
  )
}
