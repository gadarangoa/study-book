import { useContext } from "react"
import { AuthContext } from "./auth-state"
import type { AuthContextValue } from "./auth-state"

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
