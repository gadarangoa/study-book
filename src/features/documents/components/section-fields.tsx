import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const SUGGESTED_MIN_LENGTH = 50

function LengthHint({ value, id }: { value: string; id: string }) {
  const length = value.trim().length
  if (length === 0 || length >= SUGGESTED_MIN_LENGTH) return null
  return (
    <p id={id} className="text-xs text-muted-foreground">
      Sugerencia: desarrolla esta sección con al menos {SUGGESTED_MIN_LENGTH}{" "}
      caracteres (llevas {length}). Puedes guardar el borrador igualmente.
    </p>
  )
}

interface IntroductionFieldsProps {
  introduction: string
  justification: string
  onChange: (patch: { introduction?: string; justification?: string }) => void
}

export function IntroductionFields({
  introduction,
  justification,
  onChange,
}: IntroductionFieldsProps) {
  return (
    <>
      <section aria-labelledby="intro-heading" className="flex flex-col gap-4">
        <h2 id="intro-heading" className="text-base font-semibold">
          2. Introducción
        </h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="section-introduction">Introducción</Label>
          <Textarea
            id="section-introduction"
            value={introduction}
            onChange={(event) => onChange({ introduction: event.target.value })}
            placeholder="Presenta el tema, el problema y los objetivos del trabajo."
            rows={6}
            aria-describedby="section-introduction-hint"
          />
          <LengthHint value={introduction} id="section-introduction-hint" />
        </div>
      </section>

      <section aria-labelledby="justif-heading" className="flex flex-col gap-4">
        <h2 id="justif-heading" className="text-base font-semibold">
          3. Justificación <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
        </h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="section-justification">Justificación</Label>
          <Textarea
            id="section-justification"
            value={justification}
            onChange={(event) => onChange({ justification: event.target.value })}
            placeholder="Explica por qué es importante o necesario este trabajo. Si la dejas vacía, no aparecerá en el documento final."
            rows={6}
            aria-describedby="section-justification-hint"
          />
          <LengthHint value={justification} id="section-justification-hint" />
        </div>
      </section>
    </>
  )
}

interface ConclusionsFieldsProps {
  conclusions: string
  onChange: (patch: { conclusions?: string }) => void
}

export function ConclusionsFields({ conclusions, onChange }: ConclusionsFieldsProps) {
  return (
    <section aria-labelledby="concl-heading" className="flex flex-col gap-4">
      <h2 id="concl-heading" className="text-base font-semibold">
        6. Conclusiones
      </h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="section-conclusions">Conclusiones</Label>
        <Textarea
          id="section-conclusions"
          value={conclusions}
          onChange={(event) => onChange({ conclusions: event.target.value })}
          placeholder="Resume los hallazgos principales y las líneas futuras."
          rows={6}
          aria-describedby="section-conclusions-hint"
        />
        <LengthHint value={conclusions} id="section-conclusions-hint" />
      </div>
    </section>
  )
}
