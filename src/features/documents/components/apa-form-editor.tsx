import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon } from "lucide-react"
import { ApaPdfPreview } from "./apa-pdf-preview"
import type { ApaZoomLevel } from "./apa-pdf-preview"
import { BibliographyField } from "./bibliography-field"
import { CoverFields } from "./cover-fields"
import { DevelopmentField } from "./development-field"
import { SectionFields } from "./section-fields"
import { SAVE_STATE_LABELS } from "../types"
import type { Partner } from "@/features/partners/types"
import type { ApaFormDocument, ApaFormSections, SaveState } from "../types"

interface ApaFormEditorProps {
  document: ApaFormDocument
  saveState: SaveState
  teamMembers: Partner[]
  onSectionChange: (patch: Partial<ApaFormSections>) => void
  onRetrySave: () => void
  onExportPdf: () => void
}

const ZOOM_LEVELS: ApaZoomLevel[] = [75, 100, 125, 150]

function PreviewPane({
  document,
  onExportPdf,
}: {
  document: ApaFormDocument
  onExportPdf: () => void
}) {
  const [zoom, setZoom] = useState<ApaZoomLevel>(100)
  const [page, setPage] = useState({ current: 1, total: 1 })
  const scrollRef = useRef<HTMLDivElement>(null)

  const updatePage = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const total = Math.max(1, Math.ceil(el.scrollHeight / el.clientHeight))
    const current = Math.min(
      total,
      Math.floor(el.scrollTop / el.clientHeight) + 1
    )
    setPage({ current, total })
  }, [])

  const goToPage = (direction: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ top: direction * el.clientHeight * 0.9, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="no-print flex flex-wrap items-center gap-2"
        role="toolbar"
        aria-label="Controles de vista previa"
      >
        <div className="flex items-center gap-1" role="group" aria-label="Zoom">
          {ZOOM_LEVELS.map((level) => (
            <Button
              key={level}
              type="button"
              variant={zoom === level ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={zoom === level}
              onClick={() => setZoom(level)}
            >
              {level}%
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Páginas">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => goToPage(-1)}
            disabled={page.current <= 1}
          >
            <ChevronUpIcon aria-hidden />
            Anterior
          </Button>
          <span
            className="text-xs text-muted-foreground"
            role="status"
            aria-label={`Página ${page.current} de ${page.total}`}
          >
            {page.current} / {page.total}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={page.current >= page.total}
          >
            <ChevronDownIcon aria-hidden />
            Siguiente
          </Button>
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onExportPdf}>
          <DownloadIcon aria-hidden />
          Exportar PDF
        </Button>
      </div>
      <div
        ref={scrollRef}
        onScroll={updatePage}
        className="rounded-lg border bg-white p-6 shadow-sm print:max-h-none print:overflow-visible print:border-0 print:p-0 print:shadow-none sm:p-10 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto"
      >
        <ApaPdfPreview document={document} zoom={zoom} />
      </div>
    </div>
  )
}

export function ApaFormEditor({
  document,
  saveState,
  teamMembers,
  onSectionChange,
  onRetrySave,
  onExportPdf,
}: ApaFormEditorProps) {
  const { sections } = document

  const form = (
    <div className="flex flex-col gap-8">
      <CoverFields
        value={sections.cover}
        teamMembers={teamMembers}
        onChange={(patch) =>
          onSectionChange({ cover: { ...sections.cover, ...patch } })
        }
      />
      <SectionFields
        introduction={sections.introduction}
        conclusions={sections.conclusions}
        onChange={(patch) => onSectionChange(patch)}
      />
      <DevelopmentField
        key={document.id}
        value={sections.development}
        onChange={(development) => onSectionChange({ development })}
      />
      <BibliographyField
        entries={sections.bibliography}
        onAdd={(data) =>
          onSectionChange({
            bibliography: [
              ...sections.bibliography,
              {
                ...data,
                id: crypto.randomUUID(),
                order: sections.bibliography.length,
              },
            ],
          })
        }
        onUpdate={(id, patch) =>
          onSectionChange({
            bibliography: sections.bibliography.map((entry) =>
              entry.id === id ? { ...entry, ...patch } : entry
            ),
          })
        }
        onRemove={(id) =>
          onSectionChange({
            bibliography: sections.bibliography
              .filter((entry) => entry.id !== id)
              .map((entry, index) => ({ ...entry, order: index })),
          })
        }
        onReorder={(idsInOrder) =>
          onSectionChange({
            bibliography: idsInOrder.map((id, index) => {
              const entry = sections.bibliography.find((e) => e.id === id)
              if (!entry) throw new Error("Reference not found")
              return { ...entry, order: index }
            }),
          })
        }
      />
    </div>
  )

  const preview = <PreviewPane document={document} onExportPdf={onExportPdf} />

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground" role="status">
          {SAVE_STATE_LABELS[saveState]}
        </p>
        {saveState === "error" && (
          <Button variant="outline" size="sm" onClick={onRetrySave}>
            Reintentar guardado
          </Button>
        )}
      </div>

      {/* Wide screens: side-by-side (print always uses this path) */}
      <div className="hidden gap-6 print:grid print:grid-cols-1 lg:grid lg:grid-cols-2">
        <div className="no-print min-w-0">{form}</div>
        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start print:static">
          {preview}
        </div>
      </div>

      {/* Narrow screens: tabs (screen only, never printed) */}
      <Tabs defaultValue="form" className="print:hidden lg:hidden">
        <TabsList className="no-print">
          <TabsTrigger value="form">Formulario</TabsTrigger>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="no-print mt-4">
          {form}
        </TabsContent>
        <TabsContent value="preview" className="mt-4 print:hidden">
          {preview}
        </TabsContent>
      </Tabs>
    </div>
  )
}
