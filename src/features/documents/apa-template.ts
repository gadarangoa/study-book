import type { ApaDocumentContent } from "./types"
import type { ApaFormSections } from "./types"
import { APA_TEMPLATE_VERSION, APA_FORM_TEMPLATE_VERSION } from "./types"

export { APA_TEMPLATE_VERSION, APA_FORM_TEMPLATE_VERSION }

function todayInputValue(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * Default APA 7th ed. (Spanish) form template: empty cover fields plus
 * guide text for each section. Every new form document starts as a copy
 * of these sections. User changes live only in their document.
 */
export function createApaFormTemplate(courseName = "", teacherName = ""): ApaFormSections {
  return {
    cover: {
      workTitle: "",
      authors: [],
      institution: "",
      courseName,
      teacherName,
      date: todayInputValue(),
    },
    introduction:
      "Presenta el tema, el problema y los objetivos del trabajo.",
    justification: "",
    generalObjective: "",
    specificObjectives: [],
    development: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Desarrolla aquí los argumentos, evidencias y análisis." },
          ],
        },
      ],
    },
    conclusions:
      "Resume los hallazgos principales y las líneas futuras.",
    bibliography: [],
  }
}

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
