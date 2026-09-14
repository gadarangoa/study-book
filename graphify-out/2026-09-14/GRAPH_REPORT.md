# Graph Report - study-book  (2026-09-13)

## Corpus Check
- 112 files · ~28,705 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 645 nodes · 1680 edges · 33 communities (31 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `663d9ad1`
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 104 edges
2. `Button()` - 41 edges
3. `compilerOptions` - 19 edges
4. `Input()` - 18 edges
5. `Label()` - 18 edges
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

## Communities (33 total, 2 thin omitted)

### Community 0 - "React UI Components"
Cohesion: 0.11
Nodes (21): useIsMobile(), Separator(), Sidebar(), SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput(), SidebarMenuAction() (+13 more)

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
Cohesion: 0.10
Nodes (19): AuthProvider(), AuthContext, AuthContextValue, ProtectedRoute(), useAuth(), ResolvedTheme, Theme, THEME_VALUES (+11 more)

### Community 6 - "Shell Utilities"
Cohesion: 0.07
Nodes (57): ApaFormEditor(), ApaFormEditorProps, PAPER_MAX_WIDTH_CM, ZOOM_LEVELS, ApaPageStyle(), ApaPdfPreview(), ApaPdfPreviewProps, ApaZoomLevel (+49 more)

### Community 7 - "Spec-Driven Development"
Cohesion: 0.08
Nodes (33): Specification Quality Checklist, Content Quality, Feature Readiness, Requirement Completeness, Course as Foundational Data Structure, Specification-Driven Development, Course Modules Spec, Authentication Scoping (+25 more)

### Community 8 - "Node TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "Spec Quality & Domain"
Cohesion: 0.07
Nodes (47): ContributionAttribution, CourseAccess, CourseMember, Invitation, InvitationStatus, InvitationWithCourse, MemberRole, SharedCourseView (+39 more)

### Community 10 - "NPM Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, date-fns, firebase, @fontsource-variable/inter, katex (+18 more)

### Community 11 - "Auth & Card UI"
Cohesion: 0.13
Nodes (29): EMPTY_FORM, EntryErrors, EntryForm(), CareerForm(), CourseTagFilter(), CourseTagFilterProps, Field(), colorStyles (+21 more)

### Community 12 - "Speckit Planning"
Cohesion: 0.13
Nodes (28): DevelopmentFieldProps, DocumentCreateDialogProps, InviteDialogProps, LinkForm(), LinkFormProps, NoteForm(), NoteFormProps, ResourceListProps (+20 more)

### Community 13 - "Branch Management"
Cohesion: 0.11
Nodes (27): CourseCard(), CourseCardProps, CourseDetailProps, CourseForm(), CourseFormProps, CourseList(), CourseListProps, ScheduleEntryList() (+19 more)

### Community 14 - "Root TypeScript Config"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, files, @/*, references

### Community 15 - "Project Overview"
Cohesion: 0.50
Nodes (4): React Logo, Vite Logo, React TypeScript Vite shadcn/ui Stack, README

### Community 16 - "OpenCode Plugin"
Cohesion: 0.15
Nodes (18): CourseLanding(), CourseLandingProps, DocumentCreateDialog(), DocumentList(), FeatureCard(), TaskFormProps, TaskItem(), TaskItemProps (+10 more)

### Community 17 - "Prerequisites Check"
Cohesion: 0.14
Nodes (15): cn(), AlertDialogMedia(), AlertDialogOverlay(), CardAction(), CardFooter(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuLabel() (+7 more)

### Community 18 - "Template Resolver"
Cohesion: 0.29
Nodes (10): Career, CareerFormData, CareerWithStats, CareerCard(), CareerCardProps, CareerFormProps, CareerList(), CareerListProps (+2 more)

### Community 19 - "Plan Setup"
Cohesion: 0.23
Nodes (10): DAYS, SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+2 more)

### Community 20 - "Tasks Setup"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (8): SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent(), SidebarGroupLabel(), SidebarHeader(), SidebarMenu(), SidebarMenuItem()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): AppSidebar(), SidebarInset(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger()

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (7): scripts, build, dev, format, lint, preview, typecheck

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): Adding components, React + TypeScript + Vite + shadcn/ui, Using components

## Knowledge Gaps
- **169 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Prerequisites Check` to `React UI Components`, `Auth & Card UI`, `Speckit Planning`, `Branch Management`, `Plan Setup`, `Tasks Setup`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `Button()` connect `Speckit Planning` to `React UI Components`, `Theme System`, `Shell Utilities`, `Spec Quality & Domain`, `Auth & Card UI`, `Branch Management`, `OpenCode Plugin`, `Prerequisites Check`, `Template Resolver`, `Plan Setup`, `Tasks Setup`, `Community 25`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Auth & Card UI` to `Shell Utilities`, `Spec Quality & Domain`, `Speckit Planning`, `Branch Management`, `OpenCode Plugin`, `Prerequisites Check`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Dev Toolchain` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Speckit Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._