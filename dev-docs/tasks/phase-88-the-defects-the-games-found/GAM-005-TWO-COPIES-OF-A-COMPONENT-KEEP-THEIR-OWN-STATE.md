# GAM-005 — Two copies of a component keep their own state, or the author is told they will not

**Status: ⬜ not started.** **Source:** [P78 D57](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by TPL-007 Rocket School, 2026-09-12 · **Side:** product (authoring doctrine, validation)

A page places two feedback banners. One answer opens both, because the banner kept "open" in a `Variable`, and a
`Variable` is one value for the whole app however many times its component is placed. Nothing the author or the agent reads says so.

## 1. The person sentence

**Someone builds a component that remembers something and places it twice. Each copy remembers its own, or, before
the page ever runs, the editor names the Variable that the copies will share.**

## 2. What was measured

Source readings were re-read at HEAD `eb12ebe99` (2026-09-14). Template readings are from the working tree over that commit, where `templates/` is untracked.

| reading | where |
|---|---|
| Seen in the browser: after one answer, both banners were open ("Fast and correct!" and "The computer got there first"), the EN/FR pills doubled, and four choice rows shared one pick (`choiceRowPick`). *As recorded 2026-09-12, not re-driven* | register D57 |
| The runtime is doing what it documents. Variable2's `Name` is *"Which app-wide variable this node reads and writes"*, and `Changed` fires *"from anywhere in the app"*. *Re-read at HEAD* | `packages/noodl-runtime/src/nodes/std-library/data/variablenode2.ts:172`, `:109` |
| The node reference says it plainly too: *"every node bound to the same name sees the same value"*. *Re-read at HEAD* | `docs-site/docs/nodes/data/variable2.md:4`, `:10`, `:66`; `set-variable.md:76` |
| 🔴 **The authoring doctrine an agent actually receives is silent.** The interface playbook `INTERFACE_DOCTRINE_MD` has 0 case-insensitive hits for "variable". It reaches `get_project_info` as `interfaceDoctrine`. *Re-read at HEAD* | `packages/noodl-editor/src/editor/src/models/AiAssistant/authoring/prompts/interfaces.ts`; `packages/noodl-mcp/src/tools/read.ts:176` |
| ⚠️ **The decomposition doctrine points the other way.** *"Shared app state goes through Variables and Objects, not through prop drilling."* It gives no converse for a component's own state. Served as `authoringDoctrine`. *Re-read at HEAD* | `…/authoring/prompts/decomposition.ts:165-166`; `read.ts:168` |
| The MCP server instructions have 0 hits for "variable". *Re-read at HEAD* | `packages/noodl-mcp/src/instructions.ts` |
| The playbook's §4, *"The state machine is the component's brain"*, is where the rule belongs. It teaches States idioms and never names the alternative it replaces. *Re-read at HEAD* | `interfaces.ts:97-108` |
| A per-instance store already exists and is documented as such: Component Object, *"every instance has a separate object"*. *Re-read at HEAD* | `docs-site/docs/nodes/component-utilities/net-noodl-component-object.md:10`, `:65` |
| A validator precedent that counts placements per component type already exists. *Re-read at HEAD* | `packages/noodl-editor/src/editor/src/validation/componentInterface.ts:279-292` |
| **Census: components that hold a Variable and are placed more than once.** Found in 4 templates: `landing-pages` `Site/FilterPill` ×4 (`workFilter`), `pixel-game` `Game/Move` ×4 (`playerX`, `playerY`), `rocket-school` `Profiles/New player form` ×2 (`newLang`, `newLevel`, `newLook`, `newSeed`), `story-engine` `Story/Source` ×2 (`storyPasted`). Found in 0 prefabs, where the same census ran over the `project.json` shape; that shape is different and has no known-firing hit. *Measured 2026-09-14, working tree* | `templates/*/components/**/nodes.json`, `library/prefabs/*/project/project.json` |
| The repeater note: *"without an `id` every re-run of the source is a fresh set of rows and the old ones stay"*. *As recorded 2026-09-12, not re-read in the repeater.* ⚠️ The Collection diff keys on object identity (F50), which predicts that old rows are **removed** and re-added, not kept. The two readings disagree | register D57; `packages/noodl-runtime/src/collection.ts:504-546` |

## 3. Where it bites a person

Anyone who reaches for a Variable for a component's own state: an open/closed flag, a selected tab, a picked choice, a
draft. The first placement works. The second placement breaks both copies, often on another page, so the bug shows
up far from the cause. With one instance on the page nothing is visibly wrong, and neither the drive clauses nor the
console see it. Rocket School's banner was caught from a screenshot.

## 4. Related work and collisions

- **No owner found.** Greps over `dev-docs/tasks`: `global by name`, `app-wide`, `Variable.*global`, `global.*Variable`,
  `variable.*local state`. The hits are records, not owners:
  - [P85 STUDIED-APPS](../phase-85-the-component-is-the-backbone/STUDIED-APPS.md) row 21 quotes D57.
  - [RKT-006 §3](../phase-87-the-first-play-test/RKT-006-RESTART-FROM-INSIDE-THE-RACE.md) accepts `raceProgressA/B` as harmless with one race.
  - [TPL-006](../phase-78-the-templates/TPL-006-THE-STORY-ENGINE.md) uses three app-wide Variables on purpose.
  - [SBR-004](../phase-77-the-site-builder-rescue/SBR-004-THE-PUBLIC-SITE-WEARS-THE-THEME.md) relies on app-wide Variables on purpose.
  - [CWF-008](../phase-42-first-hour/CWF-008-THE-CLOUD-VOCABULARY.md) is the cloud cross-request leak, which is a different defect.
- **The doctrine's owner is [CMP-001](../phase-85-the-component-is-the-backbone/CMP-001-THE-COMPONENT-INTERFACE-PLAYBOOK.md).**
  Its gate `packages/noodl-mcp/tests/cmp001InterfaceDoctrine.test.ts` binds every claim in the playbook to the shelf, and bounds
  its length (`:155`). A new sentence has to pass that gate.
- [P87 README](../phase-87-the-first-play-test/README.md) `:143` already carries the rule as a template trap. That is exactly the
  place a person building a new app never reads.

## 5. Design

- **(a) Doctrine, in both texts.** Playbook §4: *a Variable is one value for the whole app; a component's own state is a
  States node, a Component Object, or a Counter/Switch.* The decomposition line gains the converse in the same sentence.
- **(b) A validator code** (working name `variable-in-repeated-component`): a `Variable2`/`Set Variable` inside a
  component that is placed more than once, naming the variable and the placements. Put it beside `componentInterface.ts`, which
  already counts placements, so it feeds `validate_component`, `validate_project` and every plan tool.
- **(c) The repeater `id` sentence** goes in only if AC7 reproduces it. Otherwise the P87 note is withdrawn.
- 🔒 **Richard: warning or info?** All four template hits in §2 may be intended: a filter row writing one shared filter is
  the point of `Site/FilterPill`. A warning that is mostly right-by-design teaches authors to ignore the panel. Should the code
  be `info`, a `warning` that one "shared on purpose" comment on the node silences, or a warning with no escape?
  > 🔒 **Ruled, 2026-09-14 (session 1): a warning, with a "shared on purpose" escape.** It warns by default and names the
  > Variable and the placements. One marker on the node silences it, so an intended case says so once. — Richard
  >
  > ⚠️ Owed by the build: what the marker **is**. Pick something an agent can write through the plan tools and a person can
  > see in the editor, and read what the four §2 template hits would need.
- **Do not** make Variables per-instance. App-wide is documented, depended on (TPL-006, SBR-004), and correct.
- **Do not** fix this in the templates only. Rocket School already did, and that is how it stayed invisible to everyone else.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8, before any change.** (i) A spec reads `interfaceDoctrine` and `authoringDoctrine` from a live `get_project_info` and asserts a sentence saying a Variable is app-wide. It is RED, beside a known-firing assertion that the §4 States idiom text is present. (ii) `validate_component` on a fixture (a banner whose open flag is a Variable, placed twice) returns no Variable diagnostic, beside a known-firing code in the same response (the fixture carries one unlabelled node). |
| AC2 | (a) lands and AC1(i) is green, and `cmp001InterfaceDoctrine.test.ts` stays green. Sabotage arm: delete the sentence and the spec goes RED. |
| AC3 | (b) fires on the fixture placed twice and does **not** fire on the same component placed once. Both arms. Sabotage arm: count placements as 1 and the twice-placed arm goes RED. |
| AC4 | **Blast radius before landing:** run the code over every shipped template, the prefabs, the embedded templates (`site-builder`, `landing-pages` `.content.json`) and the P86 corpus. Every hit is listed and classed as defect or intended. §2's four template hits must appear; they are the known-firing signal. |
| AC5 | **Person, real browser:** a page with two copies of a banner built the way the new doctrine says. Opening one leaves the other closed, read on the rendered DOM. Control arm: the Variable version on the same page opens both. |
| AC6 | **Workarounds:** Rocket School moved its banner and choice row off Variables, and that is correct under this task, so they stay. AC4's run says whether `Profiles/New player form` (placed twice, four Variables) is a live defect. It is either filed or recorded as intended, with the drive or reading that decided it. |
| AC7 | **The repeater `id` note is measured before it is taught.** A Function that emits fresh id-less rows into a For Each is run twice. Count the rendered rows, beside a control run with ids. The doctrine gains the sentence only if the row count grows. Otherwise the P87 README note is corrected. |

## 7. Traps

- 🔴 **A single-instance fixture grades nothing.** The defect needs two placements, and both must be on screen together.
- 🔴 **The node reference already says "app-wide".** A spec that greps `docs-site` passes today. Grade the text an agent
  receives (`get_project_info`), not the text a human might find.
- ⚠️ A banner opened by a Variable written from a `didMount` can look independent on first render and then share on the first write.
  Drive the write, not the load.
- ⚠️ The playbook gate checks its claims against the shelf. If the new sentence cites a prefab, that prefab must really do it.

## 8. Record

Not started.
