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
    parts.length > 1
      ? firstChars(parts[0], 1) + firstChars(parts[1], 1)
      : firstChars(parts[0] ?? "", 2)
  return initials ? initials.toUpperCase() : "?"
}

/** First `n` code points, so letters outside the BMP aren't split in half. */
function firstChars(value: string, n: number) {
  return Array.from(value).slice(0, n).join("")
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const email = user?.email ?? "Usuario"
  const [open, setOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState(false)

  // The item keeps the menu open while signing out so a failure is shown in
  // place; on success the auth guard redirects to /login.
  const handleSignOut = () => {
    setSignOutError(false)
    setIsSigningOut(true)
    signOut()
      .then(() => setOpen(false))
      .catch((error: unknown) => {
        console.error("Sign out failed", error)
        setSignOutError(true)
      })
      .finally(() => setIsSigningOut(false))
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSignOutError(false)
      }}
    >
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
        <DropdownMenuItem
          variant="destructive"
          closeOnClick={false}
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          <LogOutIcon />
          {isSigningOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
