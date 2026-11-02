/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { useAuth } from "@/features/auth"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"

type NavData = {
  careers: Career[]
  courses: Course[]
  /** True once the courses list has its first result (or failed). */
  coursesLoaded: boolean
}

const NavDataContext = React.createContext<NavData | null>(null)

type Collection = { items: unknown[]; loaded: boolean; uid?: string }

/**
 * Subscribes to one of the user's collections. A failure only affects that
 * collection, and realtime updates keep it fresh after creates, renames and
 * deletes without re-reading on every navigation.
 */
function useUserCollection<T>(name: "careers" | "courses", uid?: string) {
  const [state, setState] = React.useState<Collection>({
    items: [],
    loaded: false,
  })

  React.useEffect(() => {
    if (!uid) return undefined
    return onSnapshot(
      query(collection(db, name), where("uid", "==", uid)),
      (snapshot) => {
        setState({
          items: snapshot.docs.map((d) => d.data()),
          loaded: true,
          uid,
        })
      },
      (error) => {
        console.error(`Failed to load ${name}`, error)
        setState({ items: [], loaded: true, uid })
      }
    )
  }, [name, uid])

  // Ignore data that belongs to a previous user.
  const current = state.uid === uid
  return {
    items: (current ? state.items : []) as T[],
    loaded: current && state.loaded,
  }
}

/** Careers and courses shared by the sidebar and the header breadcrumb. */
export function NavDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const careers = useUserCollection<Career>("careers", user?.uid)
  const courses = useUserCollection<Course>("courses", user?.uid)

  const value = React.useMemo(
    () => ({
      careers: careers.items,
      courses: courses.items,
      coursesLoaded: courses.loaded,
    }),
    [careers.items, courses.items, courses.loaded]
  )

  return (
    <NavDataContext.Provider value={value}>{children}</NavDataContext.Provider>
  )
}

export function useNavData() {
  const value = React.useContext(NavDataContext)
  if (value === null) {
    throw new Error("useNavData must be used within a NavDataProvider")
  }
  return value
}
