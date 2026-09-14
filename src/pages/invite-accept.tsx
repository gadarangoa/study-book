"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router"
import { useAuth } from "@/features/auth"
import { useAcceptInvite } from "@/features/collaboration/hooks/use-accept-invite"
import { getInvitationById } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, CheckCircle, XCircle, AlertCircle, Clock, Mail, User, Lock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type InviteState = "loading" | "valid" | "accepted" | "expired" | "revoked" | "wrong-email" | "not-found"

interface InvitationData {
  courseName: string
  invitedByEmail: string
  status: string
  expiresAt: string
  emailLower: string
}

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { acceptInvitation, loading: accepting } = useAcceptInvite()

  const [state, setState] = useState<InviteState>("loading")
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setState("not-found")
      return
    }

    const loadInvitation = async () => {
      try {
        const inv = await getInvitationById(token)
        if (!inv) {
          setState("not-found")
          return
        }
        setInvitation({
          courseName: inv.courseName,
          invitedByEmail: inv.invitedByEmail,
          status: inv.status,
          expiresAt: inv.expiresAt,
          emailLower: inv.emailLower,
        })

        const now = new Date()
        const expiresAt = new Date(inv.expiresAt)

        if (inv.status !== "pending") {
          setState(inv.status as InviteState)
          return
        }

        if (now > expiresAt) {
          setState("expired")
          return
        }

        setState("valid")
      } catch {
        setState("not-found")
      }
    }

    loadInvitation()
  }, [token])

  useEffect(() => {
    if (state === "valid" && !authLoading && !user) {
      navigate(`/login?redirect=/invite/${token}`, { replace: true })
    }
  }, [state, user, authLoading, navigate, token])

  const handleAccept = async () => {
    if (!token) return
    setError(null)
    const result = await acceptInvitation(token)
    if (result.success && result.courseId) {
      navigate(`/courses/${result.courseId}`, { replace: true })
    } else {
      if (result.error === "wrong-email") {
        setState("wrong-email")
      } else if (result.error === "expired") {
        setState("expired")
      } else if (result.error === "accepted") {
        setState("accepted")
      } else if (result.error === "revoked") {
        setState("revoked")
      } else {
        setError("Error al aceptar la invitación. Inténtalo de nuevo.")
      }
    }
  }

  const renderState = () => {
    switch (state) {
      case "loading":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
            <p>Verificando invitación…</p>
          </div>
        )
      case "valid":
        return (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Mail className="h-8 w-8" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Invitación válida</h2>
            </div>
            <div className="space-y-3 text-left border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asignatura</p>
                  <p className="font-medium">{invitation?.courseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invitado por</p>
                  <p className="font-medium">{invitation?.invitedByEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vence</p>
                  <p className="font-medium">{format(new Date(invitation?.expiresAt ?? ""), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Deberás iniciar sesión o crear tu cuenta con el correo: <strong>{invitation?.emailLower}</strong>
            </p>
            <Button onClick={handleAccept} disabled={accepting} className="w-full" size="lg">
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Aceptando...
                </>
              ) : (
                <>
                  Aceptar y continuar
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        )
      case "accepted":
        return (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-10 w-10" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">¡Ya formas parte del equipo!</h2>
            </div>
            <p className="text-muted-foreground">Tu acceso a <strong>{invitation?.courseName}</strong> ya está activo.</p>
            <Button asChild>
              <Link to={`/courses/${token}`}>
                Ir a la asignatura
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )
      case "expired":
        return (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-10 w-10" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Invitación expirada</h2>
            </div>
            <p className="text-muted-foreground">
              Esta invitación venció el <strong>{format(new Date(invitation?.expiresAt ?? ""), "dd 'de' MMMM 'de' yyyy", { locale: es })}</strong>.
            </p>
            <p className="text-muted-foreground">Pide al propietario que la reenvíe para poder unirte.</p>
          </div>
        )
      case "revoked":
        return (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <XCircle className="h-10 w-10" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Invitación revocada</h2>
            </div>
            <p className="text-muted-foreground">Esta invitación fue retirada por el propietario de la asignatura.</p>
          </div>
        )
      case "wrong-email":
        return (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <Lock className="h-10 w-10" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Correo no coincide</h2>
            </div>
            <p className="text-muted-foreground">
              Esta invitación es para <strong>{invitation?.emailLower}</strong>.
            </p>
            <p className="text-muted-foreground">Inicia sesión con esa cuenta para aceptar la invitación.</p>
            <Button variant="outline" onClick={() => navigate("/login", { replace: true })}>
              Cambiar de cuenta
            </Button>
          </div>
        )
      case "not-found":
      default:
        return (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-10 w-10" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Enlace no válido</h2>
            </div>
            <p className="text-muted-foreground">Esta invitación no existe o ya no es válida.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">StudyBook</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderState()}
          {error && (
            <div className="mt-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg" role="alert" aria-live="polite">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}