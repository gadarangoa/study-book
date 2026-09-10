import type { BibEntry } from "../types"

/**
 * Formats a bibliography entry as an APA 7th ed. reference line:
 * "Author (year). Title. Source."
 * Returns "" for incomplete entries (caller marks them as pending).
 */
export function formatBibEntry(entry: BibEntry): string {
  const author = entry.author.trim()
  const year = entry.year.trim()
  const title = entry.title.trim()
  const source = entry.source.trim()
  if (!author || !year || !title) return ""
  return `${author} (${year}). ${title}.${source ? ` ${source}.` : ""}`
}

/** A year is valid when it is 4 digits. */
export function isValidBibYear(year: string): boolean {
  return /^\d{4}$/.test(year.trim())
}

/** An entry is complete when it has author, a valid year and title. */
export function isBibEntryComplete(entry: BibEntry): boolean {
  return (
    entry.author.trim().length > 0 &&
    isValidBibYear(entry.year) &&
    entry.title.trim().length > 0
  )
}
