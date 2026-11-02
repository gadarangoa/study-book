import { useState } from "react"
import { LogOutIcon } from "lucide-react"

import { useAuth } from "@/features/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(email?: string | null) {
  if (!email) return "?"
  const parts = email
    .split("@")[0]
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
  const initials =
    parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "").slice(0, 2)
  return initials ? initials.toUpperCase() : "?"
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const email = user?.email ?? "Usuario"
  const [signOutError, setSignOutError] = useState(false)

  const handleSignOut = () => {
    setSignOutError(false)
    signOut().catch((error: unknown) => {
      console.error("Sign out failed", error)
      setSignOutError(true)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label="Menú de usuario"
          />
        }
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {getInitials(user?.email)}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
          {signOutError && (
            <DropdownMenuLabel role="alert" className="text-destructive">
              No se pudo cerrar sesión. Inténtalo de nuevo.
            </DropdownMenuLabel>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
