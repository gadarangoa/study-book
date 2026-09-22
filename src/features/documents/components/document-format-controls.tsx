import { SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  APA_FONT_FAMILIES,
  APA_FONT_FAMILY_LABELS_ES,
} from "../types"
import type { ApaFontFamily, ApaTocDepth, ListSettings, TocSettings } from "../types"

const TOC_DEPTH_LABELS_ES: Record<ApaTocDepth, string> = {
  1: "Solo secciones principales (nivel 1)",
  2: "Secciones y subtítulos (nivel 1-2)",
  3: "Secciones y todos los subtítulos (nivel 1-3)",
}

interface DocumentFormatControlsProps {
  fontFamily: ApaFontFamily
  toc: TocSettings
  lists: ListSettings
  onFontFamilyChange: (fontFamily: ApaFontFamily) => void
  onTocChange: (toc: TocSettings) => void
  onListsChange: (lists: ListSettings) => void
}

export function DocumentFormatControls({
  fontFamily,
  toc,
  lists,
  onFontFamilyChange,
  onTocChange,
  onListsChange,
}: DocumentFormatControlsProps) {
  return (
    <Popover>
      <PopoverTrigger render={<Button type="button" variant="ghost" size="sm" />}>
        <SettingsIcon aria-hidden />
        Formato
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <PopoverHeader>
          <PopoverTitle>Formato del documento</PopoverTitle>
        </PopoverHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apa-format-font">Fuente (12 pt)</Label>
          <Select
            value={fontFamily}
            onValueChange={(value) => {
              if (value !== null) onFontFamilyChange(value as ApaFontFamily)
            }}
          >
            <SelectTrigger id="apa-format-font" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APA_FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font}>
                  {APA_FONT_FAMILY_LABELS_ES[font]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 border-t pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="apa-format-toc">Incluir tabla de contenido</Label>
            <Switch
              id="apa-format-toc"
              checked={toc.enabled}
              onCheckedChange={(enabled) => onTocChange({ ...toc, enabled })}
            />
          </div>
          {toc.enabled && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="apa-format-toc-depth">Profundidad</Label>
              <Select
                value={String(toc.depth)}
                onValueChange={(value) => {
                  if (value === null) return
                  onTocChange({ ...toc, depth: Number(value) as ApaTocDepth })
                }}
              >
                <SelectTrigger id="apa-format-toc-depth" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {([1, 2, 3] as const).map((depth) => (
                    <SelectItem key={depth} value={String(depth)}>
                      {TOC_DEPTH_LABELS_ES[depth]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Lista los títulos en orden; no incluye número de página.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="apa-format-figures">Incluir listado de figuras</Label>
            <Switch
              id="apa-format-figures"
              checked={lists.figuresEnabled}
              onCheckedChange={(figuresEnabled) =>
                onListsChange({ ...lists, figuresEnabled })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="apa-format-tables">Incluir listado de tablas</Label>
            <Switch
              id="apa-format-tables"
              checked={lists.tablesEnabled}
              onCheckedChange={(tablesEnabled) =>
                onListsChange({ ...lists, tablesEnabled })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Solo se listan las imágenes y tablas con título asignado.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
