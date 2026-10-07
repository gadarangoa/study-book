"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertCircle,
  Ban,
  Check,
  Clipboard,
  Link2,
  Send,
  Trash2,
  User,
} from "lucide-react"
import type { TeamMember, TeamMemberStatus } from "../types"

interface TeamMemberListProps {
  members: TeamMember[]
  canManage: boolean
  loading?: boolean
  onInviteExisting: (
    memberId: string,
    email: string
  ) => Promise<{ success: boolean; error?: string }>
  onRenew: (memberId: string) => void
  onRevoke: (memberId: string) => void
  onDeleteLocal: (memberId: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STATUS_LABEL: Record<TeamMemberStatus, string> = {
  local: "Sin invitar",
  pending: "Pendiente",
  accepted: "Aceptado",
  expired: "Vencida",
  revoked: "Revocado",
}

const STATUS_VARIANT: Record<
  TeamMemberStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  local: "outline",
  pending: "default",
  accepted: "secondary",
  expired: "destructive",
  revoked: "destructive",
}

export function TeamMemberList({
  members,
  canManage,
  loading,
  onInviteExisting,
  onRenew,
  onRevoke,
  onDeleteLocal,
}: TeamMemberListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [memberToRevoke, setMemberToRevoke] = useState<TeamMember | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)

  const copyLink = async (memberId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/invite/${memberId}`
      )
      setCopiedId(memberId)
    } catch {
      setCopiedId(null)
    }
  }

  const startInvite = (memberId: string) => {
    setInvitingId(memberId)
    setInviteEmail("")
    setInviteError(null)
  }

  const cancelInvite = () => {
    setInvitingId(null)
    setInviteEmail("")
    setInviteError(null)
  }

  const submitInvite = async (memberId: string) => {
    const trimmed = inviteEmail.trim()
    if (!EMAIL_REGEX.test(trimmed)) {
      setInviteError("Formato de correo inválido")
      return
    }
    setInviteSubmitting(true)
    setInviteError(null)
    try {
      const result = await onInviteExisting(memberId, trimmed)
      if (!result.success) {
        if (result.error?.startsWith("duplicate-active:")) {
          setInviteError("Ya existe una invitación activa para este correo")
        } else {
          setInviteError("No se pudo generar el enlace. Inténtalo de nuevo.")
        }
        return
      }
      cancelInvite()
    } finally {
      setInviteSubmitting(false)
    }
  }

  const confirmRevoke = () => {
    if (memberToRevoke) {
      onRevoke(memberToRevoke.id)
      setMemberToRevoke(null)
    }
  }

  const confirmDelete = () => {
    if (memberToDelete) {
      onDeleteLocal(memberToDelete.id)
      setMemberToDelete(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>Todavía no hay miembros en el equipo</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
        Miembros del equipo ({members.length})
      </h3>
      <div className="divide-y rounded-lg border">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col gap-3 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{member.name}</span>
                  <Badge variant={STATUS_VARIANT[member.status]}>
                    {STATUS_LABEL[member.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {member.email && <span>{member.email}</span>}
                  {member.expiresAt &&
                    (member.status === "pending" ||
                      member.status === "expired") && (
                      <span>
                        Vence:{" "}
                        {format(new Date(member.expiresAt), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    )}
                  {member.resendCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      Renovado {member.resendCount} vez
                      {member.resendCount !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-2">
                  {member.status === "local" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startInvite(member.id)}
                        aria-label={`Generar enlace de invitación para ${member.name}`}
                      >
                        <Link2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Generar enlace
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToDelete(member)}
                        disabled={loading}
                        aria-label={`Eliminar a ${member.name} del equipo`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Eliminar
                      </Button>
                    </>
                  )}

                  {(member.status === "pending" ||
                    member.status === "expired") && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(member.id)}
                        aria-label={`Copiar enlace de invitación para ${member.name}`}
                      >
                        {copiedId === member.id ? (
                          <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Clipboard className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {copiedId === member.id ? "Copiado" : "Copiar enlace"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRenew(member.id)}
                        disabled={loading}
                        aria-label={`Renovar enlace de invitación para ${member.name}`}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Renovar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToRevoke(member)}
                        disabled={loading}
                        aria-label={`Revocar invitación de ${member.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Ban className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Revocar
                      </Button>
                    </>
                  )}

                  {member.status === "accepted" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMemberToRevoke(member)}
                      disabled={loading}
                      aria-label={`Revocar acceso de ${member.name}`}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Ban className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Revocar acceso
                    </Button>
                  )}

                  {member.status === "revoked" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="text-muted-foreground"
                    >
                      <AlertCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Revocado
                    </Button>
                  )}
                </div>
              )}
            </div>

            {canManage && invitingId === member.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void submitInvite(member.id)
                }}
                className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center"
              >
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteSubmitting}
                  autoFocus
                  className="flex-1"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelInvite}
                    disabled={inviteSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={inviteSubmitting}>
                    {inviteSubmitting ? "Generando..." : "Generar"}
                  </Button>
                </div>
                {inviteError && (
                  <p className="text-sm text-destructive sm:basis-full">
                    {inviteError}
                  </p>
                )}
              </form>
            )}
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!memberToRevoke}
        onOpenChange={(open) => !open && setMemberToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar acceso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres revocar a{" "}
              <strong>{memberToRevoke?.name}</strong>? Si su invitación
              todavía no fue aceptada, el enlace dejará de funcionar. Si ya
              tenía acceso, lo perderá de inmediato y no podrá volver a
              entrar a menos que se le invite nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevoke}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar miembro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar a <strong>{memberToDelete?.name}</strong> del equipo?
              Nunca tuvo acceso a la asignatura, esto solo quita su nombre de
              la lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
