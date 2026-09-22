import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react"
import { ApaPdfPreview } from "./apa-pdf-preview"
import type { ApaZoomLevel } from "./apa-pdf-preview"
import { APA_PAGE_SIZE_LABELS_ES, APA_PAGE_SIZES } from "../types"
import type { ApaFontFamily, ApaPageSize, ListSettings, TocSettings } from "../types"
import { BibliographyField } from "./bibliography-field"
import { CoverFields } from "./cover-fields"
import { DevelopmentField } from "./development-field"
import { DocumentFormatControls } from "./document-format-controls"
import { ObjectivesFields } from "./objectives-fields"
import { ConclusionsFields, IntroductionFields } from "./section-fields"
import { SAVE_STATE_LABELS } from "../types"
import type { Partner } from "@/features/partners/types"
import type { ApaFormDocument, ApaFormSections, SaveState } from "../types"
import { cn } from "@/lib/utils"

interface ApaFormEditorProps {
  document: ApaFormDocument
  saveState: SaveState
  teamMembers: Partner[]
  onSectionChange: (patch: Partial<ApaFormSections>) => void
  onPageSizeChange: (pageSize: ApaPageSize) => void
  onFormatChange: (
    patch: Partial<Pick<ApaFormDocument, "fontFamily" | "toc" | "lists">>
  ) => void
  onRetrySave: () => void
  onExportPdf: () => void
  onExportDocx: () => void
  isExportingDocx: boolean
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
  onExportDocx,
  isExportingDocx,
  onPageSizeChange,
  onFormatChange,
}: {
  document: ApaFormDocument
  onExportPdf: () => void
  onExportDocx: () => void
  isExportingDocx: boolean
  onPageSizeChange: (pageSize: ApaPageSize) => void
  onFormatChange: (
    patch: Partial<Pick<ApaFormDocument, "fontFamily" | "toc" | "lists">>
  ) => void
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
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Páginas"
        >
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
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Tamaño de papel"
        >
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
        <DocumentFormatControls
          fontFamily={document.fontFamily}
          toc={document.toc}
          lists={document.lists}
          onFontFamilyChange={(fontFamily: ApaFontFamily) =>
            onFormatChange({ fontFamily })
          }
          onTocChange={(toc: TocSettings) => onFormatChange({ toc })}
          onListsChange={(lists: ListSettings) => onFormatChange({ lists })}
        />
        <Button variant="outline" size="sm" onClick={onExportPdf}>
          <DownloadIcon aria-hidden />
          Exportar PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportDocx}
          disabled={isExportingDocx}
        >
          <DownloadIcon aria-hidden />
          {isExportingDocx ? "Exportando…" : "Exportar Word"}
        </Button>
      </div>
      <div
        ref={scrollRef}
        onScroll={updatePage}
        style={{ maxWidth: PAPER_MAX_WIDTH_CM[document.pageSize] }}
        className="mx-auto w-full rounded-lg border bg-white p-6 shadow-sm sm:p-10 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto print:max-h-none print:max-w-none print:overflow-visible print:border-0 print:p-0 print:shadow-none"
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
  onFormatChange,
  onRetrySave,
  onExportPdf,
  onExportDocx,
  isExportingDocx,
}: ApaFormEditorProps) {
  const { sections } = document
  const [showPreview, setShowPreview] = useState(false)

  const cover = (
    <CoverFields
      value={sections.cover}
      teamMembers={teamMembers}
      onChange={(patch) =>
        onSectionChange({ cover: { ...sections.cover, ...patch } })
      }
    />
  )

  const objectives = (
    <ObjectivesFields
      generalObjective={sections.generalObjective}
      specificObjectives={sections.specificObjectives}
      onChange={(patch) => onSectionChange(patch)}
    />
  )

  const introduction = (
    <IntroductionFields
      introduction={sections.introduction}
      justification={sections.justification}
      onChange={(patch) => onSectionChange(patch)}
    />
  )

  const development = (
    <DevelopmentField
      key={document.id}
      value={sections.development}
      onChange={(content) => onSectionChange({ development: content })}
    />
  )

  const conclusions = (
    <ConclusionsFields
      conclusions={sections.conclusions}
      onChange={(patch) => onSectionChange(patch)}
    />
  )

  const bibliography = (
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
  )

  const preview = (
    <PreviewPane
      document={document}
      onExportPdf={onExportPdf}
      onExportDocx={onExportDocx}
      isExportingDocx={isExportingDocx}
      onPageSizeChange={onPageSizeChange}
      onFormatChange={onFormatChange}
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

      <Tabs defaultValue="development" className="print:hidden">
        <div className="no-print flex min-w-0 items-center gap-2 border-b">
          <TabsList
            variant="line"
            className="min-w-0 flex-1 justify-start gap-0 overflow-x-auto"
          >
            <TabsTrigger value="cover" className="shrink-0 px-3">
              Portada
            </TabsTrigger>
            <TabsTrigger value="objectives" className="shrink-0 px-3">
              Objetivos
            </TabsTrigger>
            <TabsTrigger value="introduction" className="shrink-0 px-3">
              Introducción y justificación
            </TabsTrigger>
            <TabsTrigger value="development" className="shrink-0 px-3">
              Desarrollo
            </TabsTrigger>
            <TabsTrigger value="conclusions" className="shrink-0 px-3">
              Conclusiones
            </TabsTrigger>
            <TabsTrigger value="bibliography" className="shrink-0 px-3">
              Bibliografía
            </TabsTrigger>
          </TabsList>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            aria-pressed={showPreview}
            aria-label={
              showPreview ? "Ocultar vista previa" : "Mostrar vista previa"
            }
            onClick={() => setShowPreview((visible) => !visible)}
          >
            {showPreview ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
            <span className="hidden sm:inline">
              {showPreview ? "Ocultar vista previa" : "Mostrar vista previa"}
            </span>
          </Button>
        </div>

        <div
          className={cn(
            "grid gap-6",
            showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"
          )}
        >
          <div className="no-print min-w-0">
            <TabsContent value="cover" className="mt-4">
              {cover}
            </TabsContent>
            <TabsContent value="objectives" className="mt-4">
              {objectives}
            </TabsContent>
            <TabsContent value="introduction" className="mt-4">
              {introduction}
            </TabsContent>
            <TabsContent value="development" className="mt-4">
              {development}
            </TabsContent>
            <TabsContent value="conclusions" className="mt-4">
              {conclusions}
            </TabsContent>
            <TabsContent value="bibliography" className="mt-4">
              {bibliography}
            </TabsContent>
          </div>
          {showPreview && (
            <div className="min-w-0 lg:sticky lg:top-4 lg:self-start print:static">
              {preview}
            </div>
          )}
        </div>
      </Tabs>

      <div className="hidden print:block">{preview}</div>
    </div>
  )
}
