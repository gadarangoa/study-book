"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Check, Clipboard, User, UserPlus } from "lucide-react"
import { useTeamMembers } from "../hooks/use-team-members"
import { useAuth } from "@/features/auth"

interface AddMemberDialogProps {
  courseId: string
  courseName: string
  onMemberAdded?: () => void
}

function errorMessage(error: string | undefined): string {
  if (error === "invalid-name") return "Ingresa un nombre"
  if (error === "invalid-email") return "Formato de correo inválido"
  if (error?.startsWith("duplicate-active:")) {
    const status = error.split(":")[1]
    if (status === "pending")
      return "Ya existe una invitación pendiente para este correo"
    if (status === "accepted")
      return "Este usuario ya tiene acceso a la asignatura"
    return "Ya existe una relación activa para este correo"
  }
  return "No se pudo agregar al miembro. Inténtalo de nuevo."
}

export function AddMemberDialog({
  courseId,
  courseName,
  onMemberAdded,
}: AddMemberDialogProps) {
  const { user } = useAuth()
  const { addMember } = useTeamMembers(courseId)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<
    { shareUrl?: string; name: string } | null
  >(null)
  const [copied, setCopied] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setName("")
      setEmail("")
      setLocalError(null)
      setResult(null)
      setCopied(false)
    }
  }

  const copyShareUrl = async () => {
    if (!result?.shareUrl) return
    try {
      await navigator.clipboard.writeText(result.shareUrl)
      setCopied(true)
    } catch {
      setLocalError("No se pudo copiar el enlace. Cópialo manualmente.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSubmitting(true)
    try {
      const res = await addMember(name, email, courseName)
      if (!res.success) {
        setLocalError(errorMessage(res.error))
      } else {
        setResult({ shareUrl: res.shareUrl, name: name.trim() })
        setName("")
        setEmail("")
        setCopied(false)
        onMemberAdded?.()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar miembro
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar miembro del equipo</DialogTitle>
          <DialogDescription>
            Ingresa el nombre del integrante. Si agregas su correo, se
            generará un enlace de invitación para darle acceso a la
            asignatura.
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{result.name}</p>
            </div>
            {result.shareUrl ? (
              <>
                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="mb-2 text-sm font-medium">Enlace generado</p>
                  <p className="text-sm break-all text-muted-foreground">
                    {result.shareUrl}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comparte este enlace con el colaborador. El acceso seguirá
                  vinculado al correo invitado y será válido durante 7 días.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Se agregó a la lista del equipo sin correo. Podrás generarle
                un enlace de invitación cuando quieras darle acceso a la
                asignatura.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cerrar
              </Button>
              {result.shareUrl && (
                <Button type="button" onClick={copyShareUrl}>
                  {copied ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Clipboard className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "Enlace copiado" : "Copiar enlace"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Nombre</Label>
              <Input
                id="member-name"
                type="text"
                placeholder="Nombre del integrante"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">
                Correo electrónico{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="member-email"
                type="email"
                placeholder="miembro@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                Sin correo, el integrante queda solo en la lista (por ejemplo
                para portadas APA). Con correo, se genera un enlace de
                invitación para darle acceso.
              </p>
            </div>
            {localError && (
              <div
                className="flex items-center gap-2 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || !name.trim()}>
                {submitting ? "Agregando..." : "Agregar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
