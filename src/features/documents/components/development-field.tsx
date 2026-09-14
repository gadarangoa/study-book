import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableRow } from "@tiptap/extension-table-row"
import { Button } from "@/components/ui/button"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  TextQuoteIcon,
  Trash2Icon,
  UnderlineIcon,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { DevelopmentImageDialog } from "./development-image-dialog"
import { DevelopmentTableControls } from "./development-table-controls"
import { embedDevelopmentImage } from "../lib/development-content"

interface DevelopmentFieldProps {
  value: JSONContent
  onChange: (value: JSONContent) => void
}

const DevelopmentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mimeType: { default: null },
      fileSize: { default: null },
      width: { default: null },
      height: { default: null },
    }
  },
})

export function DevelopmentField({ value, onChange }: DevelopmentFieldProps) {
  const lastEmitted = useRef<JSONContent>(value)
  const onChangeRef = useRef(onChange)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageDialogMode, setImageDialogMode] = useState<"insert" | "edit">("insert")

  useEffect(() => {
    onChangeRef.current = onChange
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      DevelopmentImage.configure({ allowBase64: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      // Classes land directly on the ProseMirror element so the text matches
      // the shadcn Input/Textarea scale (text-xs) exactly.
      attributes: { class: "min-h-[10rem] p-3 text-xs leading-5 focus:outline-none" },
    },
    onUpdate: ({ editor: updated }) => {
      const json = updated.getJSON()
      lastEmitted.current = json
      onChangeRef.current(json)
    },
  })

  // Sync only when the value changed from outside (e.g. document switch or
  // reload); keystrokes flow through onUpdate instead.
  useEffect(() => {
    if (!editor) return
    if (!isSameContent(editor.getJSON(), value)) {
      lastEmitted.current = value
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) {
    return (
      <section aria-labelledby="dev-heading" className="flex flex-col gap-4">
        <h2 id="dev-heading" className="text-base font-semibold">
          5. Desarrollo de la actividad
        </h2>
        <p className="text-sm text-muted-foreground">Cargando editor…</p>
      </section>
    )
  }

  const tool = (
    label: string,
    isActive: boolean,
    onClick: () => void,
    Icon: typeof BoldIcon
  ) => (
    <Button
      key={label}
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(isActive && "border")}
    >
      <Icon aria-hidden />
    </Button>
  )

  const updateContent = () => {
    const json = editor.getJSON()
    lastEmitted.current = json
    onChangeRef.current(json)
  }

  const insertImage = async (input: Parameters<typeof embedDevelopmentImage>[0]) => {
    const attrs = await embedDevelopmentImage(input)
    if (!editor.chain().focus().setImage(attrs).run()) {
      throw new Error("No se pudo insertar la imagen en el desarrollo.")
    }
  }

  return (
    <section aria-labelledby="dev-heading" className="flex flex-col gap-4">
      <h2 id="dev-heading" className="text-base font-semibold">
        3. Desarrollo de la actividad
      </h2>
      <div className="flex flex-col gap-1.5">
        <Label>Contenido del desarrollo</Label>
        <div
          role="toolbar"
          aria-label="Herramientas de formato del desarrollo"
          className="flex flex-wrap gap-1 border p-1"
        >
          {tool("Negrita", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), BoldIcon)}
          {tool("Cursiva", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), ItalicIcon)}
          {tool("Subrayado", editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), UnderlineIcon)}
          {tool("Encabezado 2", editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2Icon)}
          {tool("Encabezado 3", editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3Icon)}
          {tool("Lista con viñetas", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), ListIcon)}
          {tool("Lista numerada", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), ListOrderedIcon)}
          {tool("Cita", editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), TextQuoteIcon)}
          {tool("Alinear a la izquierda", editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), AlignLeftIcon)}
          {tool("Centrar", editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), AlignCenterIcon)}
          {tool("Justificar", editor.isActive({ textAlign: "justify" }), () => editor.chain().focus().setTextAlign("justify").run(), AlignJustifyIcon)}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Insertar imagen"
            aria-label="Insertar imagen"
            onClick={() => {
              setImageDialogMode("insert")
              setImageDialogOpen(true)
            }}
          >
            <ImageIcon aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Editar imagen seleccionada"
            aria-label="Editar imagen seleccionada"
            disabled={!editor.isActive("image")}
            onClick={() => {
              setImageDialogMode("edit")
              setImageDialogOpen(true)
            }}
          >
            <ImageIcon aria-hidden />
            <span className="sr-only">Editar imagen seleccionada</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Eliminar imagen seleccionada"
            aria-label="Eliminar imagen seleccionada"
            disabled={!editor.isActive("image")}
            onClick={() => {
              editor.chain().focus().deleteSelection().run()
              updateContent()
            }}
          >
            <Trash2Icon aria-hidden />
          </Button>
          <DevelopmentTableControls
            isTableActive={editor.isActive("table")}
            onInsertTable={(rows, cols) => {
              editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
              updateContent()
            }}
            onAddRow={() => {
              editor.chain().focus().addRowAfter().run()
              updateContent()
            }}
            onDeleteRow={() => {
              editor.chain().focus().deleteRow().run()
              updateContent()
            }}
            onAddColumn={() => {
              editor.chain().focus().addColumnAfter().run()
              updateContent()
            }}
            onDeleteColumn={() => {
              editor.chain().focus().deleteColumn().run()
              updateContent()
            }}
            onToggleHeaderRow={() => {
              editor.chain().focus().toggleHeaderRow().run()
              updateContent()
            }}
            onDeleteTable={() => {
              editor.chain().focus().deleteTable().run()
              updateContent()
            }}
          />
        </div>
        <EditorContent
          editor={editor}
          aria-label="Contenido del desarrollo"
          className="border focus-within:ring-2 focus-within:ring-ring"
        />
      </div>
      <DevelopmentImageDialog
        key={`${imageDialogMode}-${imageDialogOpen}-${editor.getAttributes("image").src ?? "new"}`}
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={insertImage}
        mode={imageDialogMode}
        initialAlt={String(editor.getAttributes("image").alt ?? "")}
        initialTitle={String(editor.getAttributes("image").title ?? "")}
        onUpdate={async ({ alt, title }) => {
          if (!editor.chain().focus().updateAttributes("image", { alt, title }).run()) {
            throw new Error("No se pudo actualizar la imagen seleccionada.")
          }
        }}
      />
    </section>
  )
}

function isSameContent(left: JSONContent, right: JSONContent): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}
