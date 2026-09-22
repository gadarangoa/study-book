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
  orderBy,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import type { Career } from "@/features/careers/types"
import type { Course } from "@/features/courses/types"
import type { Resource } from "@/features/resources/types"
import type { Task } from "@/features/tasks/types"
import type { Partner } from "@/features/partners/types"
import type { ScheduleEntry } from "@/features/courses/types"
import type { ApaFormDocument } from "@/features/documents/types"
import type { Invitation, CourseMember } from "@/features/collaboration/types"

export interface StoreMap {
  careers: Career
  courses: Course
  resources: Resource
  tasks: Task
  partners: Partner
  scheduleEntries: ScheduleEntry
  apaDocuments: ApaFormDocument
  invitations: Invitation
  courseMembers: CourseMember
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
  storeName: K,
  filterByUid: boolean = true
): Promise<StoreMap[K][]> {
  const uid = getUid()
  const snapshot = await getDocs(
    filterByUid
      ? query(collection(db, storeName), where("uid", "==", uid))
      : collection(db, storeName)
  )
  return snapshot.docs.map((d) => d.data() as StoreMap[K])
}

export async function getById<K extends StoreName>(
  storeName: K,
  id: string
): Promise<StoreMap[K] | undefined> {
  const snapshot = await getDoc(doc(db, storeName, id))
  if (!snapshot.exists()) return undefined
  return snapshot.data() as StoreMap[K]
}

export async function getByIndex<K extends StoreName>(
  storeName: K,
  indexName: string,
  value: string
): Promise<StoreMap[K][]> {
  const snapshot = await getDocs(
    query(collection(db, storeName), where(indexName, "==", value))
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
  storeName:
    "resources" | "tasks" | "partners" | "scheduleEntries" | "apaDocuments",
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

async function deleteInvitationsByCourseId(
  courseId: string,
  uid: string
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, "invitations"),
      where("courseId", "==", courseId),
      where("invitedByUid", "==", uid)
    )
  )
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

async function deleteMembersByCourseId(courseId: string): Promise<void> {
  const snapshot = await getDocs(
    query(collection(db, "courseMembers"), where("courseId", "==", courseId))
  )
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

export async function deleteCourseCascade(courseId: string): Promise<void> {
  const uid = getUid()
  await deleteInvitationsByCourseId(courseId, uid)
  await deleteMembersByCourseId(courseId)
  await deleteByCourseId("resources", courseId, uid)
  await deleteByCourseId("tasks", courseId, uid)
  await deleteByCourseId("partners", courseId, uid)
  await deleteByCourseId("scheduleEntries", courseId, uid)
  await deleteByCourseId("apaDocuments", courseId, uid)
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

// Collaboration functions

export async function getInvitationById(
  invitationId: string
): Promise<Invitation | undefined> {
  const snapshot = await getDoc(doc(db, "invitations", invitationId))
  if (!snapshot.exists()) return undefined
  return snapshot.data() as Invitation
}

export async function getPendingInvitations(
  courseId: string
): Promise<Invitation[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "invitations"),
      where("courseId", "==", courseId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    )
  )
  return snapshot.docs.map((d) => d.data() as Invitation)
}

export async function getActiveMembers(
  courseId: string
): Promise<CourseMember[]> {
  const snapshot = await getDocs(
    query(collection(db, "courseMembers"), where("courseId", "==", courseId))
  )
  return snapshot.docs.map((d) => d.data() as CourseMember)
}

export async function getSharedCourses(uid: string): Promise<Course[]> {
  const [ownedSnapshot, memberSnapshot] = await Promise.all([
    getDocs(query(collection(db, "courses"), where("uid", "==", uid))),
    getDocs(query(collection(db, "courseMembers"), where("uid", "==", uid))),
  ])

  const ownedCourses = ownedSnapshot.docs.map((d) => d.data() as Course)
  const memberCourseIds = memberSnapshot.docs.map(
    (d) => (d.data() as CourseMember).courseId
  )

  const sharedCourses: Course[] = []
  for (const courseId of memberCourseIds) {
    const courseDoc = await getDoc(doc(db, "courses", courseId))
    if (courseDoc.exists()) {
      sharedCourses.push(courseDoc.data() as Course)
    }
  }

  return [...ownedCourses, ...sharedCourses]
}

export async function createInvitation(
  invitation: Invitation
): Promise<Invitation> {
  const payload = stripUndefined({ ...invitation })
  await setDoc(doc(db, "invitations", invitation.id), payload)
  return invitation
}

export async function updateInvitation(
  invitation: Invitation
): Promise<Invitation> {
  const payload = stripUndefined({ ...invitation })
  await setDoc(doc(db, "invitations", invitation.id), payload)
  return invitation
}

export async function createCourseMember(
  member: CourseMember
): Promise<CourseMember> {
  const payload = stripUndefined({ ...member })
  await setDoc(doc(db, "courseMembers", member.id), payload)
  return member
}

export async function removeCourseMember(
  courseId: string,
  uid: string
): Promise<void> {
  const memberId = `${courseId}_${uid}`
  await deleteDoc(doc(db, "courseMembers", memberId))
}
