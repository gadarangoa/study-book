# Graph Report - study-book  (2026-09-14)

## Corpus Check
- 125 files · ~48,837 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 779 nodes · 1850 edges · 51 communities (49 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a7bb09ec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_React UI Components|React UI Components]]
- [[_COMMUNITY_Dev Toolchain|Dev Toolchain]]
- [[_COMMUNITY_Speckit Commands|Speckit Commands]]
- [[_COMMUNITY_UI Component Config|UI Component Config]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_Shell Utilities|Shell Utilities]]
- [[_COMMUNITY_Spec-Driven Development|Spec-Driven Development]]
- [[_COMMUNITY_Node TypeScript Config|Node TypeScript Config]]
- [[_COMMUNITY_Spec Quality & Domain|Spec Quality & Domain]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Auth & Card UI|Auth & Card UI]]
- [[_COMMUNITY_Speckit Planning|Speckit Planning]]
- [[_COMMUNITY_Branch Management|Branch Management]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Project Overview|Project Overview]]
- [[_COMMUNITY_OpenCode Plugin|OpenCode Plugin]]
- [[_COMMUNITY_Prerequisites Check|Prerequisites Check]]
- [[_COMMUNITY_Template Resolver|Template Resolver]]
- [[_COMMUNITY_Plan Setup|Plan Setup]]
- [[_COMMUNITY_Tasks Setup|Tasks Setup]]
- [[_COMMUNITY_Extension Hooks|Extension Hooks]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 104 edges
2. `Button()` - 43 edges
3. `Input()` - 20 edges
4. `Label()` - 20 edges
5. `compilerOptions` - 19 edges
6. `Course` - 18 edges
7. `Badge()` - 17 edges
8. `useAuth()` - 16 edges
9. `compilerOptions` - 16 edges
10. `Partner` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Acceptance Criteria` --semantically_similar_to--> `Specification Quality Checklist`  [INFERRED] [semantically similar]
  .specify/templates/spec-template.md → specs/001-course-modules/checklists/requirements.md
- `React TypeScript Vite shadcn/ui Stack` --conceptually_related_to--> `Vite Logo`  [INFERRED]
  README.md → public/vite.svg
- `React TypeScript Vite shadcn/ui Stack` --conceptually_related_to--> `React Logo`  [INFERRED]
  README.md → src/assets/react.svg
- `Implementation Plan - Login Page + Sidebar Layout` --conceptually_related_to--> `Accessible by Default`  [INFERRED]
  .opencode/plan.md → .specify/memory/constitution.md
- `Implementation Plan - Login Page + Sidebar Layout` --conceptually_related_to--> `Component-First Architecture`  [INFERRED]
  .opencode/plan.md → .specify/memory/constitution.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SpecKit Command Pipeline** — commands_speckit_constitution, commands_speckit_specify, commands_speckit_clarify, commands_speckit_plan, commands_speckit_tasks, commands_speckit_analyze, commands_speckit_checklist, commands_speckit_implement, commands_speckit_converge, commands_speckit_taskstoissues [EXTRACTED 1.00]
- **Extension Hooks Across All Commands** — commands_speckit_analyze, commands_speckit_checklist, commands_speckit_clarify, commands_speckit_constitution, commands_speckit_converge, commands_speckit_implement, commands_speckit_plan, commands_speckit_specify, commands_speckit_tasks, commands_speckit_taskstoissues, concept_extension_hooks [EXTRACTED 1.00]
- **Constitution Core Principles** — constitution_component_first, constitution_type_safe_data, constitution_offline_first, constitution_modular_features, constitution_accessible_by_default [EXTRACTED 1.00]
- **Speckit SDD Pipeline** — workflows_speckit_workflow, workflows_speckit_workflow_specify_step, workflows_speckit_workflow_plan_step, workflows_speckit_workflow_tasks_step, workflows_speckit_workflow_implement_step, workflows_speckit_workflow_review_gates [EXTRACTED 1.00]
- **Specification Quality Framework** — templates_spec_template, checklists_requirements, checklists_requirements_content_quality, checklists_requirements_requirement_completeness, checklists_requirements_feature_readiness [INFERRED 0.85]
- **Course Domain Model** — specs_spec_course_entity, specs_spec_resource_entity, specs_spec_task_entity, specs_spec_partner_entity, specs_spec_schedule_entry_entity [EXTRACTED 1.00]

## Communities (51 total, 2 thin omitted)

### Community 0 - "React UI Components"
Cohesion: 0.09
Nodes (33): AppSidebar(), useIsMobile(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup() (+25 more)

### Community 1 - "Dev Toolchain"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+7 more)

### Community 2 - "Speckit Commands"
Cohesion: 0.08
Nodes (36): Speckit Analyze Command, Speckit Checklist Command, Speckit Clarify Command, Speckit Constitution Command, Speckit Converge Command, Speckit Implement Command, Speckit Plan Command, Speckit Specify Command (+28 more)

### Community 3 - "UI Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 5 - "Theme System"
Cohesion: 0.08
Nodes (28): AuthProvider(), AuthContext, AuthContextValue, ProtectedRoute(), useAuth(), InvitationList(), InvitationListProps, InviteDialog() (+20 more)

### Community 6 - "Shell Utilities"
Cohesion: 0.14
Nodes (21): BibliographyFieldProps, CoverFieldsProps, ObjectivesFieldsProps, APA_DOCUMENT_STATUSES, APA_STATUS_LABELS, ApaDocument, ApaDocumentFormData, ApaDocumentWithMeta (+13 more)

### Community 7 - "Spec-Driven Development"
Cohesion: 0.08
Nodes (33): Specification Quality Checklist, Content Quality, Feature Readiness, Requirement Completeness, Course as Foundational Data Structure, Specification-Driven Development, Course Modules Spec, Authentication Scoping (+25 more)

### Community 8 - "Node TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "Spec Quality & Domain"
Cohesion: 0.09
Nodes (21): ContributionAttribution, CourseAccess, CourseMember, Invitation, InvitationStatus, InvitationWithCourse, MemberRole, SharedCourseView (+13 more)

### Community 10 - "NPM Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, @base-ui/react, class-variance-authority, clsx, date-fns, firebase, @fontsource-variable/inter, katex (+19 more)

### Community 11 - "Auth & Card UI"
Cohesion: 0.14
Nodes (28): EMPTY_FORM, EntryErrors, EntryForm(), CareerForm(), CourseTagFilter(), CourseTagFilterProps, Field(), colorStyles (+20 more)

### Community 12 - "Speckit Planning"
Cohesion: 0.13
Nodes (31): DevelopmentField(), DevelopmentFieldProps, DevelopmentImage, DevelopmentImageDialog(), DevelopmentImageDialogProps, DevelopmentTableControls(), DevelopmentTableControlsProps, DocumentCreateDialogProps (+23 more)

### Community 13 - "Branch Management"
Cohesion: 0.16
Nodes (19): CourseCard(), CourseCardProps, CourseDetailProps, CourseForm(), CourseFormProps, CourseList(), CourseListProps, ScheduleEntryListProps (+11 more)

### Community 14 - "Root TypeScript Config"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, files, @/*, references

### Community 15 - "Project Overview"
Cohesion: 0.50
Nodes (4): React Logo, Vite Logo, React TypeScript Vite shadcn/ui Stack, README

### Community 16 - "OpenCode Plugin"
Cohesion: 0.35
Nodes (6): TaskFormProps, TaskItem(), TaskItemProps, TaskListProps, Task, TaskFormData

### Community 17 - "Prerequisites Check"
Cohesion: 0.12
Nodes (18): cn(), AlertDialogMedia(), AlertDialogOverlay(), CardAction(), CardFooter(), Checkbox(), DialogOverlay(), DropdownMenuCheckboxItem() (+10 more)

### Community 18 - "Template Resolver"
Cohesion: 0.32
Nodes (9): Career, CareerFormData, CareerWithStats, CareerCard(), CareerCardProps, CareerFormProps, CareerList(), CareerListProps (+1 more)

### Community 19 - "Plan Setup"
Cohesion: 0.23
Nodes (10): DAYS, SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+2 more)

### Community 20 - "Tasks Setup"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (25): 1. Initialize Analysis Context, 2. Load Artifacts (Progressive Disclosure), 3. Build Semantic Models, 4. Detection Passes (Token-Efficient Analysis), 5. Severity Assignment, 6. Produce Compact Analysis Report, 7. Provide Next Actions, 8. Offer Remediation (+17 more)

### Community 26 - "Community 26"
Cohesion: 0.13
Nodes (16): ApaFormEditorProps, PAPER_MAX_WIDTH_CM, ZOOM_LEVELS, BibliographyField(), CoverFields(), ObjectivesFields(), ConclusionsFields(), ConclusionsFieldsProps (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (7): scripts, build, dev, format, lint, preview, typecheck

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): Adding components, React + TypeScript + Vite + shadcn/ui, Using components

### Community 33 - "Community 33"
Cohesion: 0.23
Nodes (16): clearStore(), create(), createInvitation(), deleteByCourseId(), deleteCareerCascade(), deleteCourseCascade(), deleteInvitationsByCourseId(), deleteMembersByCourseId() (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (15): 1. Initialize Convergence Context, 2. Load Artifacts (Progressive Disclosure), 3. Build the Intent Inventory, 4. Assess the Codebase and Classify Findings, 5. Assign Severity, 6. Present the In-Session Findings Summary, 7. Append Convergence Tasks (or report converged), 8. Provide Next Actions (Handoff) (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (10): ApaPdfPreview(), ApaZoomLevel, formatCoverDate(), PAGE_CONTENT_HEIGHT, PAGE_SIZE_DIMENSIONS, renderPlainText(), validateEntry(), formatBibEntry() (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (11): DEVELOPMENT_IMAGE_MIME_TYPES, DevelopmentImageAttrs, DevelopmentImageMimeType, embedDevelopmentImage(), ImageValidationResult, isRecord(), normalizeDevelopmentContent(), normalizeNode() (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (7): CourseLanding(), CourseLandingProps, FeatureCard(), PartnerListProps, TeamManagerProps, ScheduleEntry, Partner

### Community 38 - "Community 38"
Cohesion: 0.31
Nodes (9): DocumentCreateDialog(), DocumentList(), useResources(), useScheduleEntries(), useTasks(), useApaDocuments(), getById(), CourseDetailPage() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (10): Completion Report, Done When, Key rules, Mandatory Post-Execution Hooks, Outline, Phase 0: Outline & Research, Phase 1: Design & Contracts, Phases (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (10): Completion Report, Done When, For AI Generation, Mandatory Post-Execution Hooks, Outline, Pre-Execution Checks, Quick Guidelines, Section Requirements (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (10): Checklist Format (REQUIRED), Completion Report, Done When, Mandatory Post-Execution Hooks, Outline, Phase Structure, Pre-Execution Checks, Task Generation Rules (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.36
Nodes (6): ScheduleEntryList(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (7): createApaFormTemplate(), createApaTemplateContent(), todayInputValue(), ApaDocumentContent, normalizePageSize(), isFormDocument(), migrateLegacyDocument()

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (7): Anti-Examples: What NOT To Do, Checklist Purpose: "Unit Tests for English", Example Checklist Types & Sample Items, Execution Steps, Post-Execution Checks, Pre-Execution Checks, User Input

### Community 45 - "Community 45"
Cohesion: 0.38
Nodes (6): ApaFormEditor(), ApaPageStyle(), APA_STATUS_LABELS_ES, usePartners(), useApaFormDocument(), DocumentEditorPage()

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (6): Completion Report, Done When, Mandatory Post-Execution Hooks, Outline, Pre-Execution Checks, User Input

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (6): Completion Report, Done When, Mandatory Post-Execution Hooks, Outline, Pre-Execution Checks, User Input

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (5): Outline, Post-Execution Checks, Pre-Execution Checks, Scope Guard, User Input

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (4): Outline, Post-Execution Checks, Pre-Execution Checks, User Input

### Community 50 - "Community 50"
Cohesion: 0.50
Nodes (4): ApaPdfPreviewProps, DocumentListProps, ApaDocumentStatus, ApaFormDocument

## Knowledge Gaps
- **263 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Prerequisites Check` to `React UI Components`, `Community 42`, `Auth & Card UI`, `Speckit Planning`, `Plan Setup`, `Tasks Setup`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `Button()` connect `Speckit Planning` to `React UI Components`, `Theme System`, `Community 38`, `Auth & Card UI`, `Branch Management`, `Community 45`, `OpenCode Plugin`, `Prerequisites Check`, `Template Resolver`, `Plan Setup`, `Tasks Setup`, `Community 26`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Auth & Card UI` to `Theme System`, `Community 38`, `Community 42`, `Speckit Planning`, `Community 45`, `Prerequisites Check`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _267 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.09103840682788052 - nodes in this community are weakly interconnected._
- **Should `Dev Toolchain` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Speckit Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._