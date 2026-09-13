export type {
  ApaDocument,
  ApaDocumentContent,
  ApaDocumentFormData,
  ApaDocumentStatus,
  ApaFormDocument,
  ApaFormSections,
  ApaPageSize,
  BibEntry,
  BibEntryFormData,
  CoverData,
  SaveState,
  SpecificObjective,
} from "./types"
export {
  APA_DEFAULT_PAGE_SIZE,
  APA_DOCUMENT_STATUSES,
  APA_FORM_TEMPLATE_VERSION,
  APA_PAGE_SIZE_LABELS_ES,
  APA_PAGE_SIZES,
  APA_STATUS_LABELS,
  APA_STATUS_LABELS_ES,
  APA_TEMPLATE_VERSION,
  SAVE_STATE_LABELS,
  countWords,
  isApaDocumentStatus,
  normalizeCoverData,
  normalizePageSize,
} from "./types"
export { createApaFormTemplate, createApaTemplateContent } from "./apa-template"
export { formatBibEntry, isBibEntryComplete, isValidBibYear } from "./lib/apa-format"
export { useApaDocuments } from "./hooks/useApaDocuments"
export { migrateLegacyDocument, useApaFormDocument } from "./hooks/useApaFormDocument"
