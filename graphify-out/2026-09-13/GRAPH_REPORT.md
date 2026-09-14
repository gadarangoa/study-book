# Graph Report - .  (2026-09-02)

## Corpus Check
- Corpus is ~36,493 words - fits in a single context window. You may not need a graph.

## Summary
- 318 nodes · 442 edges · 25 communities (19 shown, 6 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 52 edges
2. `compilerOptions` - 19 edges
3. `compilerOptions` - 16 edges
4. `StudyBook Constitution` - 9 edges
5. `Speckit Workflow` - 9 edges
6. `Course Modules Spec` - 9 edges
7. `Speckit Analyze Command` - 8 edges
8. `scripts` - 7 edges
9. `Spec Template` - 7 edges
10. `tailwind` - 6 edges

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

## Communities (25 total, 6 thin omitted)

### Community 0 - "React UI Components"
Cohesion: 0.08
Nodes (47): AppSidebar(), navItems, useIsMobile(), cn(), Button(), buttonVariants, Input(), Separator() (+39 more)

### Community 1 - "Dev Toolchain"
Cohesion: 0.07
Nodes (26): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+18 more)

### Community 2 - "Speckit Commands"
Cohesion: 0.10
Nodes (26): Speckit Analyze Command, Speckit Constitution Command, Speckit Converge Command, Speckit Implement Command, Speckit Tasks Command, Speckit Tasks-to-Issues Command, Analysis Detection Passes, Append-Only Tasks (+18 more)

### Community 3 - "UI Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 5 - "Theme System"
Cohesion: 0.12
Nodes (11): ResolvedTheme, Theme, THEME_VALUES, ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, AppLayout() (+3 more)

### Community 6 - "Shell Utilities"
Cohesion: 0.12
Nodes (5): get_feature_paths(), get_repo_root(), _persist_feature_json(), resolve_specify_init_dir(), common.sh script

### Community 7 - "Spec-Driven Development"
Cohesion: 0.15
Nodes (19): Specification-Driven Development, Constitution Template, Core Principles, Governance, Plan Template, Spec Template, Functional Requirements, Success Criteria (+11 more)

### Community 8 - "Node TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "Spec Quality & Domain"
Cohesion: 0.20
Nodes (14): Specification Quality Checklist, Content Quality, Feature Readiness, Requirement Completeness, Course as Foundational Data Structure, Course Modules Spec, Authentication Scoping, Course Entity (+6 more)

### Community 10 - "NPM Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @base-ui/react, class-variance-authority, clsx, @fontsource-variable/inter, lucide-react, react, react-dom (+6 more)

### Community 11 - "Auth & Card UI"
Cohesion: 0.29
Nodes (8): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Label()

### Community 12 - "Speckit Planning"
Cohesion: 0.29
Nodes (10): Speckit Checklist Command, Speckit Clarify Command, Speckit Plan Command, Speckit Specify Command, Clarification Taxonomy, Command Handoff Pattern, Requirements Quality Dimensions, Spec Quality Validation (+2 more)

### Community 13 - "Branch Management"
Cohesion: 0.31
Nodes (4): get_highest_from_specs(), is_feature_number_in_range(), spec_prefix_exists(), create-new-feature.sh script

### Community 14 - "Root TypeScript Config"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, files, @/*, references

### Community 15 - "Project Overview"
Cohesion: 0.50
Nodes (4): React Logo, Vite Logo, React TypeScript Vite shadcn/ui Stack, README

## Knowledge Gaps
- **135 isolated node(s):** `@opencode-ai/plugin`, `check-prerequisites.sh script`, `common.sh script`, `resolve-template.sh script`, `setup-plan.sh script` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `React UI Components` to `Auth & Card UI`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `dependencies` connect `NPM Dependencies` to `Dev Toolchain`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `@opencode-ai/plugin`, `check-prerequisites.sh script`, `common.sh script` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07978142076502732 - nodes in this community are weakly interconnected._
- **Should `Dev Toolchain` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Speckit Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.10153846153846154 - nodes in this community are weakly interconnected._
- **Should `UI Component Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._