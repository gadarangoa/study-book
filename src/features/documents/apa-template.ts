import type { ApaDocumentContent } from "./types"
import { APA_TEMPLATE_VERSION } from "./types"

export { APA_TEMPLATE_VERSION }

/**
 * Default APA 7th ed. (Spanish) document: cover page fields plus the base
 * academic sections. Every new document starts as a copy of this JSON.
 */
export function createApaTemplateContent(): ApaDocumentContent {
  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1, class: "apa-cover-title" },
        content: [{ type: "text", text: "Título del trabajo" }],
      },
      { type: "paragraph", attrs: { class: "apa-cover" }, content: [{ type: "text", text: "Nombre del autor" }] },
      { type: "paragraph", attrs: { class: "apa-cover" }, content: [{ type: "text", text: "Institución" }] },
      { type: "paragraph", attrs: { class: "apa-cover" }, content: [{ type: "text", text: "Curso" }] },
      { type: "paragraph", attrs: { class: "apa-cover" }, content: [{ type: "text", text: "Docente" }] },
      { type: "paragraph", attrs: { class: "apa-cover" }, content: [{ type: "text", text: today }] },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Resumen" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Escribe aquí el resumen del trabajo (150-250 palabras)." }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Introducción" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Presenta el tema, el problema y los objetivos del trabajo." }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Desarrollo" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Desarrolla los argumentos, evidencias y análisis." }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Conclusiones" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Resume los hallazgos principales y las líneas futuras." }],
      },
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Referencias" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Apellido, N. (año). Título de la obra. Editorial.",
          },
        ],
      },
    ],
  }
}
