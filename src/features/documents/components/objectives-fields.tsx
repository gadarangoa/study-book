import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "lucide-react"
import type { SpecificObjective } from "../types"

interface ObjectivesFieldsProps {
  generalObjective: string
  specificObjectives: SpecificObjective[]
  onChange: (patch: {
    generalObjective?: string
    specificObjectives?: SpecificObjective[]
  }) => void
}

export function ObjectivesFields({
  generalObjective,
  specificObjectives,
  onChange,
}: ObjectivesFieldsProps) {
  const move = (id: string, direction: -1 | 1) => {
    const index = specificObjectives.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= specificObjectives.length) return
    const next = [...specificObjectives]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange({ specificObjectives: next })
  }

  return (
    <section aria-labelledby="objectives-heading" className="flex flex-col gap-4">
      <h2 id="objectives-heading" className="text-base font-semibold">
        4. Objetivos
      </h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="section-general-objective">Objetivo general</Label>
        <Textarea
          id="section-general-objective"
          value={generalObjective}
          onChange={(event) =>
            onChange({ generalObjective: event.target.value })
          }
          placeholder="Describe el propósito principal del trabajo."
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id="specific-objectives-label" className="text-sm font-medium">
          Objetivos específicos
        </span>
        {specificObjectives.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay objetivos específicos. Agrega el primero con el
            botón de abajo.
          </p>
        ) : (
          <ul
            aria-labelledby="specific-objectives-label"
            className="flex list-none flex-col gap-2 p-0"
          >
            {specificObjectives.map((item, index) => (
              <li key={item.id} className="flex items-center gap-1.5">
                <Label htmlFor={`specific-objective-${item.id}`} className="sr-only">
                  Objetivo específico {index + 1}
                </Label>
                <Input
                  id={`specific-objective-${item.id}`}
                  value={item.text}
                  onChange={(event) =>
                    onChange({
                      specificObjectives: specificObjectives.map((other) =>
                        other.id === item.id
                          ? { ...other, text: event.target.value }
                          : other
                      ),
                    })
                  }
                  placeholder={`Objetivo específico ${index + 1}`}
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => move(item.id, -1)}
                  aria-label={`Subir objetivo ${index + 1}`}
                >
                  <ArrowUpIcon aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === specificObjectives.length - 1}
                  onClick={() => move(item.id, 1)}
                  aria-label={`Bajar objetivo ${index + 1}`}
                >
                  <ArrowDownIcon aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  onClick={() =>
                    onChange({
                      specificObjectives: specificObjectives.filter(
                        (other) => other.id !== item.id
                      ),
                    })
                  }
                  aria-label={`Eliminar objetivo ${index + 1}`}
                >
                  <TrashIcon aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            onChange({
              specificObjectives: [
                ...specificObjectives,
                { id: crypto.randomUUID(), text: "" },
              ],
            })
          }
        >
          <PlusIcon aria-hidden />
          Agregar objetivo específico
        </Button>
      </div>
    </section>
  )
}
