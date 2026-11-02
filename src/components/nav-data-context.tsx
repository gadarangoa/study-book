/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { useLocation } from "react-router"

import { getAll } from "@/lib/db"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"

type NavData = { careers: Career[]; courses: Course[]; isLoaded: boolean }

const NavDataContext = React.createContext<NavData | null>(null)

/**
 * Loads the user's careers and courses once per navigation and shares them
 * between the sidebar and the header breadcrumb.
 */
export function NavDataProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const [data, setData] = React.useState<NavData>({
    careers: [],
    courses: [],
    isLoaded: false,
  })

  React.useEffect(() => {
    let cancelled = false
    Promise.all([getAll("careers"), getAll("courses")])
      .then(([careers, courses]) => {
        if (!cancelled) setData({ careers, courses, isLoaded: true })
      })
      .catch((error: unknown) => {
        console.error("Failed to load navigation data", error)
        if (!cancelled) setData((prev) => ({ ...prev, isLoaded: true }))
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <NavDataContext.Provider value={data}>{children}</NavDataContext.Provider>
  )
}

export function useNavData() {
  const value = React.useContext(NavDataContext)
  if (value === null) {
    throw new Error("useNavData must be used within a NavDataProvider")
  }
  return value
}
