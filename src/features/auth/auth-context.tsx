import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AuthContext } from "./auth-state"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
