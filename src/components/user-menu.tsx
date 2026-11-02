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
  const name = email.split("@")[0]
  const parts = name.split(/[._-]+/).filter(Boolean)
  const initials =
    parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return initials.toUpperCase()
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const email = user?.email ?? "Usuario"

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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
