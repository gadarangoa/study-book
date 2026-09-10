import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  create as dbCreate,
  remove as dbRemove,
} from "@/lib/db"
import type { Partner } from "../types"

export function usePartners(courseId: string) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const all = await getByIndex("partners", "courseId", courseId)
    setPartners(all)
    setIsLoading(false)
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const addPartner = useCallback(
    async (name: string): Promise<Partner> => {
      const partner: Partner = {
        id: crypto.randomUUID(),
        courseId,
        name,
        createdAt: new Date().toISOString(),
      }
      await dbCreate("partners", partner)
      await load()
      return partner
    },
    [courseId, load]
  )

  const removePartner = useCallback(
    async (id: string): Promise<void> => {
      await dbRemove("partners", id)
      await load()
    },
    [load]
  )

  return { partners, isLoading, addPartner, removePartner }
}
