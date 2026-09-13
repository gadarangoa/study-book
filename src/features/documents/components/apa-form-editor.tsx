import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon } from "lucide-react"
import { ApaPdfPreview } from "./apa-pdf-preview"
import type { ApaZoomLevel } from "./apa-pdf-preview"
import { APA_PAGE_SIZE_LABELS_ES, APA_PAGE_SIZES } from "../types"
import type { ApaPageSize } from "../types"
import { BibliographyField } from "./bibliography-field"
import { CoverFields } from "./cover-fields"
import { DevelopmentField } from "./development-field"
import { ObjectivesFields } from "./objectives-fields"
import { ConclusionsFields, IntroductionFields } from "./section-fields"
import { SAVE_STATE_LABELS } from "../types"
import type { Partner } from "@/features/partners/types"
import type { ApaFormDocument, ApaFormSections, SaveState } from "../types"

interface ApaFormEditorProps {
  document: ApaFormDocument
  saveState: SaveState
  teamMembers: Partner[]
  onSectionChange: (patch: Partial<ApaFormSections>) => void
  onPageSizeChange: (pageSize: ApaPageSize) => void
  onRetrySave: () => void
  onExportPdf: () => void
}

const ZOOM_LEVELS: ApaZoomLevel[] = [75, 100, 125, 150]

/** Paper width in cm, so the on-screen sheet matches the real page size. */
const PAPER_MAX_WIDTH_CM: Record<ApaPageSize, string> = {
  letter: "21.59cm",
  a4: "21cm",
}

function PreviewPane({
  document,
  onExportPdf,
  onPageSizeChange,
}: {
  document: ApaFormDocument
  onExportPdf: () => void
  onPageSizeChange: (pageSize: ApaPageSize) => void
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
        <div className="flex items-center gap-1" role="group" aria-label="Tamaño de papel">
          {APA_PAGE_SIZES.map((size) => (
            <Button
              key={size}
              type="button"
              variant={document.pageSize === size ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={document.pageSize === size}
              onClick={() => onPageSizeChange(size)}
            >
              {APA_PAGE_SIZE_LABELS_ES[size]}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={onExportPdf}>
          <DownloadIcon aria-hidden />
          Exportar PDF
        </Button>
      </div>
      <div
        ref={scrollRef}
        onScroll={updatePage}
        style={{ maxWidth: PAPER_MAX_WIDTH_CM[document.pageSize] }}
        className="mx-auto w-full rounded-lg border bg-white p-6 shadow-sm print:max-h-none print:max-w-none print:overflow-visible print:border-0 print:p-0 print:shadow-none sm:p-10 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto"
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
  onPageSizeChange,
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
      <IntroductionFields
        introduction={sections.introduction}
        justification={sections.justification}
        onChange={(patch) => onSectionChange(patch)}
      />
      <ObjectivesFields
        generalObjective={sections.generalObjective}
        specificObjectives={sections.specificObjectives}
        onChange={(patch) => onSectionChange(patch)}
      />
      <DevelopmentField
        key={document.id}
        value={sections.development}
        onChange={(development) => onSectionChange({ development })}
      />
      <ConclusionsFields
        conclusions={sections.conclusions}
        onChange={(patch) => onSectionChange(patch)}
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

  const preview = (
    <PreviewPane
      document={document}
      onExportPdf={onExportPdf}
      onPageSizeChange={onPageSizeChange}
    />
  )

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
