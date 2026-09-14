"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Send, Clock, AlertCircle } from "lucide-react"
import type { Invitation } from "../types"
import { es } from "date-fns/locale"

interface InvitationListProps {
  invitations: Invitation[]
  onResend: (invitationId: string) => void
  loading?: boolean
}

export function InvitationList({ invitations, onResend, loading }: InvitationListProps) {
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

  const getStatusVariant = (status: Invitation["status"]): "default" | "secondary" | "destructive" | "outline" => {
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
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>No hay invitaciones pendientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Invitaciones pendientes ({invitations.length})
      </h3>
      <div className="rounded-lg border divide-y">
        {invitations.map((inv) => (
          <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{inv.email}</span>
                <Badge variant={getStatusVariant(inv.status)}>{getStatusLabel(inv.status)}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Vence: {format(new Date(inv.expiresAt), "dd MMM yyyy", { locale: es })}
                </span>
                {inv.resendCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    Reenviada {inv.resendCount} vez{inv.resendCount !== 1 ? "es" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {inv.status === "pending" || inv.status === "expired" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResend(inv.id)}
                  disabled={loading}
                  aria-label={`Reenviar invitación a ${inv.email}`}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Reenviar
                </Button>
              ) : (
                <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {inv.status === "accepted" ? "Aceptada" : inv.status === "revoked" ? "Revocada" : "Expirada"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}