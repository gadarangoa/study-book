import type { JSONContent } from "@tiptap/react"
import {
  DEVELOPMENT_IMAGE_MAX_BYTES,
  DEVELOPMENT_IMAGE_MAX_DIMENSION_PX,
  DEVELOPMENT_IMAGE_MIME_TYPES,
} from "../types"
import type {
  DevelopmentImageAttrs,
  DevelopmentImageMimeType,
} from "../types"

export interface ImageValidationResult {
  valid: boolean
  message?: string
  mimeType?: DevelopmentImageMimeType
  width?: number
  height?: number
}

export interface EmbeddedImageInput {
  file: File
  alt: string
  title?: string
}

export async function validateDevelopmentImage(
  file: File
): Promise<ImageValidationResult> {
  if (
    !(DEVELOPMENT_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return {
      valid: false,
      message: "Selecciona una imagen PNG, JPEG o WebP.",
    }
  }
  if (file.size > DEVELOPMENT_IMAGE_MAX_BYTES) {
    return {
      valid: false,
      message: "La imagen no puede superar los 5 MB.",
    }
  }

  const dimensions = await readImageDimensions(file)
  if (
    Math.max(dimensions.width, dimensions.height) >
    DEVELOPMENT_IMAGE_MAX_DIMENSION_PX
  ) {
    return {
      valid: false,
      message: "La imagen no puede superar 2400 px en su lado mayor.",
    }
  }

  return {
    valid: true,
    mimeType: file.type as DevelopmentImageMimeType,
    ...dimensions,
  }
}

export async function embedDevelopmentImage(
  input: EmbeddedImageInput
): Promise<DevelopmentImageAttrs> {
  const validation = await validateDevelopmentImage(input.file)
  if (!validation.valid || !validation.mimeType || !validation.width || !validation.height) {
    throw new Error(validation.message ?? "No se pudo validar la imagen.")
  }
  return {
    src: await readFileAsDataUrl(input.file),
    alt: input.alt.trim(),
    ...(input.title?.trim() ? { title: input.title.trim() } : {}),
    mimeType: validation.mimeType,
    fileSize: input.file.size,
    width: validation.width,
    height: validation.height,
  }
}

export function normalizeDevelopmentContent(value: unknown): JSONContent {
  if (!isRecord(value)) return { type: "doc", content: [] }
  return normalizeNode(value)
}

function normalizeNode(value: Record<string, unknown>): JSONContent {
  const node: JSONContent = {
    type: typeof value.type === "string" ? value.type : undefined,
  }
  if (typeof value.text === "string") node.text = value.text
  if (isRecord(value.attrs)) node.attrs = value.attrs
  if (Array.isArray(value.marks)) node.marks = value.marks as JSONContent["marks"]
  if (Array.isArray(value.content)) {
    node.content = value.content
      .filter(isRecord)
      .map((child) => normalizeNode(child))
  }
  return node
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") resolve(reader.result)
      else reject(new Error("No se pudo leer la imagen."))
    })
    reader.addEventListener("error", () => {
      reject(new Error("No se pudo leer la imagen."))
    })
    reader.readAsDataURL(file)
  })
}

function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.addEventListener("load", () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    })
    image.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("No se pudo leer el tamaño de la imagen."))
    })
    image.src = objectUrl
  })
}