# GAM-021 — A plan is not warned about the scroll setting it is about to apply

**Status: ⬜ not started.** **Source:** [P78 D56](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by TPL-007 (`npm run template:rocket`), 2026-09-12 · **Side:** product (MCP plan tools, precondition diagnostics)

A plan created with `scroll: "page"` gets `page-cannot-scroll` ("This project does not set `bodyScroll`") on every page it
stages. It gets the same warning again when it is applied. Then `apply_plan` writes `bodyScroll: true`. The warning is about
a state the same call replaces.

## 1. The person sentence

**An agent whose plan says how the app scrolls is never told the app cannot scroll. A project that really has not decided
is still told, once per page.**

## 2. What was measured

Re-read at HEAD `eb12ebe99` on 2026-09-14 unless marked otherwise.

| reading | where |
|---|---|
| `checkPageScroll` is silent unless `bodyScroll === null`, and then emits one warning per page component | `noodl-editor/src/editor/src/validation/pageScroll.ts:92-127` |
| The MCP door reads that value **from disk only**. `projectBodyScroll(store)` returns the file's boolean or `null`, and the plan is never consulted | `noodl-mcp/src/validate.ts:175-184`, passed at `:206` |
| Staging calls `preconditionDiagnostics(store, …, plannedComponentNames(plan))`. The plan is in scope, but only its component names are passed | `noodl-mcp/src/tools/planTools.ts:456` (and the baseline at `:481`) |
| `apply_plan` re-runs `validateStaged` for every component **before** any write and collects the warnings into `surviving` | `planTools.ts:969-983` |
| The setting is written after the components: `writeProjectSettings({ bodyScroll: plan.scroll === 'page' })` whenever `plan.scroll` is defined | `planTools.ts:1034-1041` |
| `writeProjectSettings` never overwrites a setting the project already has | `noodl-mcp/src/project/ProjectStore.ts:190-207` |
| So the value apply will leave behind is knowable at staging time: **the project's own boolean if it has one, otherwise the plan's `scroll`**. The warning is false exactly when the project is unset and `plan.scroll` is defined | derived from the three rows above |
| `create_project` writes `bodyScroll: true` for every new project, so a project created through the door never hits this. It bites plans applied to a project the door did not create | `noodl-mcp/src/tools/createProject.ts:179-199` |
| Rocket School's gate pins the pair of warning codes and asserts the artefact has `bodyScroll: true`: `expect([...codes].sort()).toEqual(['page-cannot-scroll', 'uncollapsible-multi-column'])` | `noodl-mcp/tests/tpl007Template.test.ts:108-118` |
| The editor's apply reads `bodyScroll` from `project.getSettings()` and applies plan `settings` in the same undo group. Whether the editor warns on its own plan's scroll as well has **not** been measured | `views/panels/AiAuthoringPanel/ProjectAuthoringView.tsx:736-740`; `models/AiAssistant/authoring/planStaging.ts:236-247` |

## 3. Where it bites a person

An agent that builds pages into an existing project. It told the plan how the app scrolls and gets a warning, on every
page, that the app cannot scroll. It is **the one warning whose recommended fix the agent has already made.** Either the
agent loses a turn trying to set a project setting that the tool is about to set, or it learns to ignore this code. The
second outcome costs every project that really is unset.

## 4. Related work and collisions

- P79 [DEFECTS-LESSON-2-FOUND](../phase-79-the-syllabus/DEFECTS-LESSON-2-FOUND.md) lines 138-141: *"Both lesson projects
  leave `bodyScroll` unset, so `validate_project` reports `page-cannot-scroll` on every write."* **Not the same defect.**
  Those projects really are unset and no plan is setting them, so the warning there is true and the fix is to set the
  project. This task must leave that warning firing, and AC3 grades it.
- P82 [REL-002a](../phase-82-0.2.2-the-first-row-on-the-shelf/REL-002a-THE-AMBUSH-DEFAULTS.md) ✅: the rule's origin and its
  three-state contract (`undefined` means do not check, `null` means unset, a boolean means decided). Keep all three states.
- P40 [AAQ-003](../phase-40-ai-authoring-quality/AAQ-003-AUTHORED-APPS-SCROLL.md) ✅: the plan-level `scroll` and the settings write.
- P84 [FLD-005-WHAT-WAS-BUILT](../phase-84-the-defects-the-field-report-found/FLD-005-WHAT-WAS-BUILT.md) lines 144-145: the
  code appears in both arms of a diagnostics diff. That is noise in another instrument, with the same cause.
- `noodl-mcp/tests/stagingDiagnostics.test.ts:161-172` works around the rule by writing `bodyScroll: true` into its fixture.
  It is a true-positive workaround and is unaffected by this task.
- Grep run: `grep -rlan "page-cannot-scroll" dev-docs/tasks` found TPL-007, P79 lesson 2, FLD-005 and this phase's README.
  **No owner.**

## 5. Design

- **Pass the value apply will write.** At staging and at the apply re-validation, resolve
  `bodyScroll = projectValue ?? (plan.scroll === 'page' ? true : plan.scroll === 'app' ? false : null)`, using the same
  never-overwrite rule as `writeProjectSettings`. Thread it through `preconditionDiagnostics` as an option rather than
  re-reading the plan inside `validate.ts`, so `validate_component`/`validate_project` keep reading disk.
- **One resolver, used by both the write and the check.** If staging and `writeProjectSettings` each derive the value, the
  two will drift apart. Export a single `settingsThisPlanWillWrite(store, plan)` and call it from both places.
- **Do not** suppress `page-cannot-scroll` by code in the plan tools. That would silence the true positive in §4 as well.
- **Do not** move the settings write ahead of validation. Validation is all-or-nothing before any write
  (`planTools.ts:969-983`), and that ordering is deliberate.
- Measure the editor path (§2, last row) before deciding whether it needs the same change.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8:** a spec creates a plan with `scroll: "page"` on a project whose `bodyScroll` is unset, stages one page, and reads `page-cannot-scroll` in the staging diagnostics, then again in `apply_plan`'s. It then reads `bodyScroll: true` on disk. |
| AC2 | After the fix, the same spec reads no `page-cannot-scroll` at either door and still reads `bodyScroll: true` on disk. |
| AC3 | **The true positive stays:** the same page staged in a plan with **no** `scroll` on an unset project still gets `page-cannot-scroll`, in the same spec run as AC2. |
| AC4 | `scroll: "app"` on an unset project gives no warning and leaves `bodyScroll: false` on disk. A project already `false` with a plan saying `"page"` gives no warning and stays `false`, because the setting is never overwritten. |
| AC5 | 🔴 **Reverted arm:** make the resolver ignore `plan.scroll`, and AC2 and AC4 go red while AC3 stays green. |
| AC6 | **The person's door, and the pin:** `tpl007Template.test.ts:115` changes to `['uncollapsible-multi-column']` (or to `[]` if GAM-022 lands first) in the same change. Run it once against the reverted fix and it goes red. |
| AC7 | The editor path is measured, and its result is recorded in §8 either as the same defect, fixed here, or as a reading showing it is not. |
| AC8 | Census: `validate_project` over every shipped template before and after gives identical `page-cannot-scroll` counts, since that tool reads disk and must not change. |

## 7. Traps

- 🔴 **`undefined` and `null` are different findings.** `undefined` means "the caller cannot say" and is silent. Do not
  pass `undefined` for "the plan will decide". Pass the boolean the plan will write.
- ⚠️ `apply_plan` can skip operations (`planTools.ts:960-963`), but the settings write does not depend on which operations
  survive. The resolver must not depend on them either.
- ⚠️ A gate that pins a set of codes goes green as soon as the set changes the right way. AC6 has to run against the
  reverted fix as well, or it grades nothing.

## 8. Record

Not started.
