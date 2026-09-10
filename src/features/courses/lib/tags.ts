export const MAX_TAGS_PER_COURSE = 10
export const MAX_TAG_LENGTH = 30

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of tags) {
    if (typeof raw !== "string") continue
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-")
    if (!tag) continue
    if (tag.length > MAX_TAG_LENGTH) continue
    if (seen.has(tag)) continue
    seen.add(tag)
    result.push(tag)
    if (result.length >= MAX_TAGS_PER_COURSE) break
  }
  return result
}

export function parseTagsInput(input: string): string[] {
  return normalizeTags(input.split(","))
}

export function formatTagsValue(tags: string[]): string {
  return tags.join(", ")
}

export function collectAllTags(
  courses: Array<{ tags?: string[] }>
): string[] {
  const seen = new Set<string>()
  for (const course of courses) {
    for (const tag of course.tags ?? []) {
      seen.add(tag)
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b))
}

export function matchesTags(
  courseTags: string[] | undefined,
  selectedTags: string[]
): boolean {
  if (selectedTags.length === 0) return true
  const set = new Set(courseTags ?? [])
  return selectedTags.every((tag) => set.has(tag))
}
