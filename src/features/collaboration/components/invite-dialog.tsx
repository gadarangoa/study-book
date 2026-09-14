"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Mail } from "lucide-react"
import { useInvitations } from "../hooks/use-invitations"
import { useAuth } from "@/features/auth"

interface InviteDialogProps {
  courseId: string
  courseName: string
  onInviteSent?: () => void
}

export function InviteDialog({ courseId, courseName, onInviteSent }: InviteDialogProps) {
  const { user } = useAuth()
  const { sendInvitation, loading: sending } = useInvitations(courseId)
  const [email, setEmail] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    const result = await sendInvitation(email)
    if (!result.success) {
      if (result.error === "invalid-email") {
        setLocalError("Formato de correo inválido")
      } else if (result.error?.startsWith("duplicate-active:")) {
        const status = result.error.split(":")[1]
        if (status === "pending") {
          setLocalError("Ya existe una invitación pendiente para este correo")
        } else if (status === "accepted") {
          setLocalError("Este usuario ya tiene acceso a la asignatura")
        } else {
          setLocalError("Ya existe una invitación activa para este correo")
        }
      } else {
        setLocalError("Error al enviar la invitación. Inténtalo de nuevo.")
      }
    } else {
      setEmail("")
      setIsOpen(false)
      onInviteSent?.()
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Invitar colaborador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar colaborador</DialogTitle>
          <DialogDescription>
            Ingresa el correo del miembro del equipo. Recibirá una invitación para colaborar en "{courseName}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="invite-email"
                type="email"
                placeholder="miembro@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={sending}
                required
                autoComplete="email"
              />
            </div>
            {localError && (
              <div className="flex items-center gap-2 text-sm text-destructive" role="alert" aria-live="polite">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={sending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={sending || !email.trim()}>
              {sending ? "Enviando..." : "Enviar invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}