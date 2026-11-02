/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/features/auth"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"

type NavData = {
  careers: Career[]
  courses: Course[]
  /** True once each list has its first result (or failed). */
  careersLoaded: boolean
  coursesLoaded: boolean
}

const NavDataContext = React.createContext<NavData | null>(null)

type Collection = { items: unknown[]; loaded: boolean; uid?: string }

const EMPTY: never[] = []
const MAX_RETRIES = 5

/**
 * Subscribes to one of the user's collections. A failure only affects that
 * collection, and realtime updates keep it fresh after creates, renames and
 * deletes without re-reading on every navigation.
 */
function useUserCollection<T>(name: "careers" | "courses", uid?: string) {
  const [state, setState] = React.useState<Collection>({
    items: EMPTY,
    loaded: false,
  })
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    if (!uid) return undefined
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = onSnapshot(
      query(collection(db, name), where("uid", "==", uid)),
      (snapshot) => {
        setState({
          items: snapshot.docs.map((d) => d.data()),
          loaded: true,
          uid,
        })
      },
      (error) => {
        // Listeners are rejected when the user signs out; that's expected.
        if (auth.currentUser?.uid !== uid) return
        console.error(`Failed to load ${name}`, error)
        setState((prev) =>
          prev.uid === uid
            ? { ...prev, loaded: true }
            : { items: EMPTY, loaded: true, uid }
        )
        // A failed listener stops for good, so resubscribe with backoff.
        if (attempt < MAX_RETRIES) {
          retryTimer = setTimeout(
            () => setAttempt((n) => n + 1),
            1000 * 2 ** attempt
          )
        }
      }
    )
    return () => {
      clearTimeout(retryTimer)
      unsubscribe()
    }
  }, [name, uid, attempt])

  // Ignore data that belongs to a previous user.
  const current = state.uid === uid
  return {
    items: (current ? state.items : EMPTY) as T[],
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
      careersLoaded: careers.loaded,
      coursesLoaded: courses.loaded,
    }),
    [careers.items, courses.items, careers.loaded, courses.loaded]
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
