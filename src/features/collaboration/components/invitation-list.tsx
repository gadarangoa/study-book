"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Send, Clock, AlertCircle, Check, Clipboard, Ban } from "lucide-react"
import type { Invitation } from "../types"
import { es } from "date-fns/locale"

interface InvitationListProps {
  invitations: Invitation[]
  onRenew: (invitationId: string) => void
  onRevoke: (invitationId: string) => void
  loading?: boolean
}

export function InvitationList({
  invitations,
  onRenew,
  onRevoke,
  loading,
}: InvitationListProps) {
  const [invitationToRevoke, setInvitationToRevoke] =
    useState<Invitation | null>(null)

  const confirmRevoke = () => {
    if (invitationToRevoke) {
      onRevoke(invitationToRevoke.id)
      setInvitationToRevoke(null)
    }
  }
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyInvitationLink = async (invitationId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/invite/${invitationId}`
      )
      setCopiedId(invitationId)
    } catch {
      setCopiedId(null)
    }
  }
  const getStatusLabel = (status: Invitation["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "accepted":
        return "Aceptada"
      case "expired":
        return "Expirada"
      case "revoked":
        return "Revocada"
      default:
        return status
    }
  }

  const getStatusVariant = (
    status: Invitation["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "pending":
        return "default"
      case "accepted":
        return "secondary"
      case "expired":
      case "revoked":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (invitations.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No hay invitaciones pendientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
        Invitaciones pendientes ({invitations.length})
      </h3>
      <div className="divide-y rounded-lg border">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{inv.email}</span>
                <Badge variant={getStatusVariant(inv.status)}>
                  {getStatusLabel(inv.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Vence:{" "}
                  {format(new Date(inv.expiresAt), "dd MMM yyyy", {
                    locale: es,
                  })}
                </span>
                {inv.resendCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    Enlace renovado {inv.resendCount} vez
                    {inv.resendCount !== 1 ? "es" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {inv.status === "pending" || inv.status === "expired" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInvitationLink(inv.id)}
                    aria-label={`Copiar enlace de invitación para ${inv.email}`}
                  >
                    {copiedId === inv.id ? (
                      <Check
                        className="mr-1.5 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Clipboard
                        className="mr-1.5 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    {copiedId === inv.id ? "Copiado" : "Copiar enlace"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRenew(inv.id)}
                    disabled={loading}
                    aria-label={`Renovar enlace de invitación para ${inv.email}`}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Renovar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInvitationToRevoke(inv)}
                    disabled={loading}
                    aria-label={`Revocar invitación para ${inv.email}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Revocar
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="text-muted-foreground"
                >
                  <AlertCircle
                    className="mr-1.5 h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {inv.status === "accepted"
                    ? "Aceptada"
                    : inv.status === "revoked"
                      ? "Revocada"
                      : "Expirada"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={!!invitationToRevoke}
        onOpenChange={(open) => !open && setInvitationToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar invitación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres revocar la invitación enviada a{" "}
              <strong>{invitationToRevoke?.email}</strong>? El enlace dejará
              de funcionar y no podrá usarse para unirse a la asignatura.
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
    </div>
  )
}
