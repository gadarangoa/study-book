import {
  ref,
  uploadBytes,
  deleteObject,
  getBytes,
  getMetadata,
  listAll,
} from "firebase/storage"
import { storage, auth } from "./firebase"

const RESOURCES_BUCKET = "resources"

function getResourcePath(courseId: string, resourceId: string): string {
  return `${RESOURCES_BUCKET}/${courseId}/${resourceId}`
}

export async function uploadPDF(
  file: File,
  courseId: string,
  resourceId: string
): Promise<string> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error("Not authenticated")

  const path = getResourcePath(courseId, resourceId)
  const fileRef = ref(storage, `${path}/${file.name}`)

  await uploadBytes(fileRef, file)
  return `${path}/${file.name}`
}

export async function deletePDF(storagePath: string): Promise<void> {
  const fileRef = ref(storage, storagePath)
  await deleteObject(fileRef)
}

export async function getPDFBytes(storagePath: string): Promise<ArrayBuffer> {
  const fileRef = ref(storage, storagePath)
  return await getBytes(fileRef)
}

export async function getPDFMetadata(storagePath: string) {
  const fileRef = ref(storage, storagePath)
  return await getMetadata(fileRef)
}

export async function listResourceFiles(
  courseId: string,
  resourceId: string
): Promise<string[]> {
  const path = getResourcePath(courseId, resourceId)
  const dirRef = ref(storage, path)

  try {
    const result = await listAll(dirRef)
    return result.items.map((item) => item.fullPath)
  } catch {
    return []
  }
}
