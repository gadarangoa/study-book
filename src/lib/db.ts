import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"
import type { Resource } from "@/features/resources/types"
import type { Task } from "@/features/tasks/types"
import type { Partner } from "@/features/partners/types"
import type { ScheduleEntry } from "@/features/courses/types"

export interface StoreMap {
  careers: Career
  courses: Course
  resources: Resource
  tasks: Task
  partners: Partner
  scheduleEntries: ScheduleEntry
}

export type StoreName = keyof StoreMap

function getUid(): string {
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error("Not authenticated")
  }
  return uid
}

function stripUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as T
}

export async function getAll<K extends StoreName>(
  storeName: K
): Promise<StoreMap[K][]> {
  const uid = getUid()
  const snapshot = await getDocs(
    query(collection(db, storeName), where("uid", "==", uid))
  )
  return snapshot.docs.map((d) => d.data() as StoreMap[K])
}

export async function getById<K extends StoreName>(
  storeName: K,
  id: string
): Promise<StoreMap[K] | undefined> {
  const uid = getUid()
  const snapshot = await getDoc(doc(db, storeName, id))
  if (!snapshot.exists()) return undefined
  const data = snapshot.data() as StoreMap[K] & { uid?: string }
  if (data.uid !== uid) return undefined
  return data as StoreMap[K]
}

export async function getByIndex<K extends StoreName>(
  storeName: K,
  indexName: string,
  value: string
): Promise<StoreMap[K][]> {
  const uid = getUid()
  const snapshot = await getDocs(
    query(
      collection(db, storeName),
      where("uid", "==", uid),
      where(indexName, "==", value)
    )
  )
  return snapshot.docs.map((d) => d.data() as StoreMap[K])
}

export async function create<K extends StoreName>(
  storeName: K,
  data: StoreMap[K]
): Promise<StoreMap[K]> {
  const uid = getUid()
  const payload = stripUndefined({ ...data, uid })
  await setDoc(doc(db, storeName, (data as { id: string }).id), payload)
  return data
}

export async function update<K extends StoreName>(
  storeName: K,
  data: StoreMap[K]
): Promise<StoreMap[K]> {
  const uid = getUid()
  const payload = stripUndefined({ ...data, uid })
  await setDoc(doc(db, storeName, (data as { id: string }).id), payload)
  return data
}

export async function remove<K extends StoreName>(
  storeName: K,
  id: string
): Promise<void> {
  getUid()
  await deleteDoc(doc(db, storeName, id))
}

export async function clearStore<K extends StoreName>(
  storeName: K
): Promise<void> {
  const uid = getUid()
  const snapshot = await getDocs(
    query(collection(db, storeName), where("uid", "==", uid))
  )
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

async function deleteByCourseId(
  storeName: "resources" | "tasks" | "partners" | "scheduleEntries",
  courseId: string,
  uid: string
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, storeName),
      where("uid", "==", uid),
      where("courseId", "==", courseId)
    )
  )
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

export async function deleteCourseCascade(courseId: string): Promise<void> {
  const uid = getUid()
  await deleteByCourseId("resources", courseId, uid)
  await deleteByCourseId("tasks", courseId, uid)
  await deleteByCourseId("partners", courseId, uid)
  await deleteByCourseId("scheduleEntries", courseId, uid)
  await deleteDoc(doc(db, "courses", courseId))
}

export async function deleteCareerCascade(careerId: string): Promise<void> {
  const uid = getUid()
  const snapshot = await getDocs(
    query(
      collection(db, "courses"),
      where("uid", "==", uid),
      where("careerId", "==", careerId)
    )
  )
  for (const d of snapshot.docs) {
    await deleteCourseCascade(d.id)
  }
  await deleteDoc(doc(db, "careers", careerId))
}
