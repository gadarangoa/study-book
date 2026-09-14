import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Columns3Icon,
  MinusIcon,
  PlusIcon,
  Rows3Icon,
  Table2Icon,
  Trash2Icon,
} from "lucide-react"

interface DevelopmentTableControlsProps {
  isTableActive: boolean
  onInsertTable: (rows: number, columns: number) => void
  onAddRow: () => void
  onDeleteRow: () => void
  onAddColumn: () => void
  onDeleteColumn: () => void
  onToggleHeaderRow: () => void
  onDeleteTable: () => void
}

export function DevelopmentTableControls({
  isTableActive,
  onInsertTable,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  onToggleHeaderRow,
  onDeleteTable,
}: DevelopmentTableControlsProps) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState("3")
  const [columns, setColumns] = useState("3")
  const [error, setError] = useState<string | null>(null)

  const createTable = () => {
    const parsedRows = Number(rows)
    const parsedColumns = Number(columns)
    if (
      !Number.isInteger(parsedRows) ||
      !Number.isInteger(parsedColumns) ||
      parsedRows < 1 ||
      parsedRows > 10 ||
      parsedColumns < 1 ||
      parsedColumns > 10
    ) {
      setError("Indica entre 1 y 10 filas y entre 1 y 10 columnas.")
      return
    }
    onInsertTable(parsedRows, parsedColumns)
    setOpen(false)
    setError(null)
  }

  const tableTool = (
    label: string,
    onClick: () => void,
    Icon: typeof Table2Icon
  ) => (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      disabled={!isTableActive}
      onClick={onClick}
    >
      <Icon aria-hidden />
    </Button>
  )

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Insertar tabla"
        aria-label="Insertar tabla"
        onClick={() => setOpen(true)}
      >
        <Table2Icon aria-hidden />
      </Button>
      {tableTool("Agregar fila", onAddRow, PlusIcon)}
      {tableTool("Eliminar fila", onDeleteRow, MinusIcon)}
      {tableTool("Agregar columna", onAddColumn, Columns3Icon)}
      {tableTool("Eliminar columna", onDeleteColumn, Rows3Icon)}
      {tableTool("Alternar fila de encabezado", onToggleHeaderRow, Rows3Icon)}
      {tableTool("Eliminar tabla", onDeleteTable, Trash2Icon)}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insertar tabla</DialogTitle>
            <DialogDescription>
              Define el tamaño inicial de la tabla. Puedes modificar filas y columnas después.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="development-table-rows">Filas</Label>
              <Input
                id="development-table-rows"
                type="number"
                min={1}
                max={10}
                value={rows}
                onChange={(event) => setRows(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="development-table-columns">Columnas</Label>
              <Input
                id="development-table-columns"
                type="number"
                min={1}
                max={10}
                value={columns}
                onChange={(event) => setColumns(event.target.value)}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={createTable}>
              Insertar tabla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
