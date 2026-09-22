import type { BibEntry } from "../types"

/**
 * Formats a bibliography entry as an APA 7th ed. reference line:
 * "Author (year). Title. Source."
 * Uses "(s.f.)" when the year is empty (undated source).
 * Returns "" for incomplete entries (caller marks them as pending).
 */
export function formatBibEntry(entry: BibEntry): string {
  const author = entry.author.trim()
  const year = entry.year.trim()
  const title = entry.title.trim()
  const source = entry.source.trim()
  if (!author || !title) return ""
  const yearLabel = year ? `(${year})` : "(s.f.)"
  return `${author} ${yearLabel}. ${title}.${source ? ` ${source}.` : ""}`
}

/** A year is valid when it is 4 digits. Empty is not validated here — it means "no date". */
export function isValidBibYear(year: string): boolean {
  return /^\d{4}$/.test(year.trim())
}

/** An entry is complete when it has author and title; the year is optional ("s.f." otherwise). */
export function isBibEntryComplete(entry: BibEntry): boolean {
  return entry.author.trim().length > 0 && entry.title.trim().length > 0
}
