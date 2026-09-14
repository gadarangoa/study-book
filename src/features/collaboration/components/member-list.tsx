"use client"

import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { User, UserX, Shield } from "lucide-react"
import type { CourseMember } from "../types"
import { es } from "date-fns/locale"

interface MemberListProps {
  members: CourseMember[]
  currentUserUid: string
  onRemove: (memberUid: string) => void
  loading?: boolean
}

export function MemberList({ members, currentUserUid, onRemove, loading }: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<CourseMember | null>(null)

  const handleRemoveClick = (member: CourseMember) => {
    if (member.uid === currentUserUid && member.role === "owner") return
    setMemberToRemove(member)
  }

  const confirmRemove = () => {
    if (memberToRemove) {
      onRemove(memberToRemove.uid)
      setMemberToRemove(null)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Miembros ({members.length})
      </h3>
      <div className="rounded-lg border divide-y">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                  {member.role === "owner" ? (
                    <>
                      <Shield className="mr-1.5 h-3 w-3" aria-hidden="true" />
                      Propietario
                    </>
                  ) : (
                    "Colaborador"
                  )}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Desde: {format(new Date(member.addedAt), "dd MMM yyyy", { locale: es })}</span>
              {member.uid !== currentUserUid && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveClick(member)}
                  disabled={loading}
                  aria-label={`Revocar acceso de ${member.email}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <UserX className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Revocar acceso</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar acceso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres revocar el acceso de <strong>{memberToRemove?.email}</strong> a esta asignatura? Perderá acceso a todos los documentos y no podrá volver a entrar a menos que se le invite nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive hover:bg-destructive/90">
              Revocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}