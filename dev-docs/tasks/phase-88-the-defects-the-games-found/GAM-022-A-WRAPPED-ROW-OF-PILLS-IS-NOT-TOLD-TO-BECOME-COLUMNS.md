# GAM-022 — A wrapped row of pills is not told to become columns

**Status: ⬜ not started.** **Source:** [P78 D50](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by TPL-006 `Story/Sidebar`, 2026-09-12, and pinned again by TPL-007 `Game/Choice row` · **Side:** product (validator, `uncollapsible-multi-column` arm B)

On every build the door says that a wrapped row of two-word tags "cannot collapse at any width" and suggests a `Columns`
autoFit at 260-320px. The tags wrap correctly at 390px. Following the advice would give every tag a 300px column.

## 1. The person sentence

**A row of content-sized pills that wraps with a gap gets no warning, and a grid of items that were given a width still
does.**

## 2. What was measured

Re-read at HEAD `eb12ebe99` on 2026-09-14 unless marked otherwise.

| reading | where |
|---|---|
| Arm B fires on: `flexDirection: row`, `flexWrap: wrap`, a `For Each` child, and a non-empty `columnGap`. That is the whole predicate. Nothing is read about the items | `validation/responsiveArrangement.ts:234-255` |
| The message's own mechanism is *"a wrapped flex row does not shrink its children, so each item keeps the width it was given"* | `:247-250` |
| Arm A excludes a **container** that is content-width (`CONTENT_WIDTH_MODES.has(parameters.sizeMode)`), *"the exclusion that took the authored false-positive rate to zero"* | `:259-261` |
| 🔴 **The register's reading is wrong on one point.** D50 says *"Arm A has exactly the exclusion Arm B is missing"*. Arm A's exclusion reads the container, and **both D50 containers are full-width**: `Story/Sidebar#sbList` is `sizeMode: contentHeight, width: 100%`, and so is `Game/Choice row#crRow`. The **items** are what is content-sized: `/Story/Carried` and `/Game/Choice` each have a `Group` root at `contentSize`. **Copying Arm A's exclusion into Arm B silences neither template** | `templates/story-engine/components/Story/Sidebar/nodes.json`, `templates/rocket-school/components/Game/Choice row/nodes.json` and their `For Each.template` components, read with `node` |
| Arm B receives only the component's own nodes and a catalog: `checkResponsiveArrangement(nodes, { component, catalog })`. It cannot see the `For Each` template's root | `validation/authoredCandidate.ts` (the `checkResponsiveArrangement` call); signature at `responsiveArrangement.ts:132-139` |
| The views that could resolve the item already exist in the same layer: `ComponentNodesView { name, nodes: { type, parameters, ports }[] }` | `authoredCandidate.ts:176-183` |
| The library's pill rows: `/Tags` has no gap and its item root is `net.noodl.ParentComponentObject`; `/Multi Select/Pills` has no gap, a `contentSize` container and `contentWidth` items; `/Multi Select/Dropdown` has no gap and `contentWidth` items. **All three avoid the warning only by setting no gap** | `library/prefabs/{tags,multi-select}/project/project.json`, read with `node` |
| Calibration at shipping time: of 45 row Groups parenting a `For Each`, 36 were legacy chip/pill/carousel lists with no gap, and 3 had a `columnGap`, all of them the defect (`Puppy test 3`'s puppy grid, the reference build's featured grid, sonnet's product grid) | as recorded 2026-08-11, `responsiveArrangement.ts:72-79`, [NOTES-DSG-004](../phase-54-design-groundwork/NOTES-DSG-004.md) lines 61-64; not re-run |
| Two template gates pin this warning: TPL-006 asserts exactly `['Story/Sidebar uncollapsible-multi-column']`, and TPL-007 asserts the code set `['page-cannot-scroll', 'uncollapsible-multi-column']`, with the comment *"a wrapped row of content-sized pills"* | `noodl-mcp/tests/tpl006Template.test.ts:772-776`, `tpl007Template.test.ts:108-115` |

## 3. Where it bites a person

An author who follows the design doctrine (*"use the gap ports, never margins on the children"*) on a tag list, a filter
bar, a segmented control or a choice row. The door gives them a warning and wrong advice. Obey the advice and the page
breaks. Obey the doctrine and the warning stays. The library itself chose the third way: drop the gap.

## 4. Related work and collisions

- P77 [SBR-004](../phase-77-the-site-builder-rescue/SBR-004-THE-PUBLIC-SITE-WEARS-THE-THEME.md) lines 99-104 read Arm B at
  `responsiveArrangement.ts:238-256`, took its refusal as correct for a nav bar, and **dropped `columnGap`** to escape it.
  Before landing, check whether SBR-004's nav links are content-width items. If they are, SBR-004's workaround is this
  defect too, and its gap can come back.
- P54 [DSG-004](../phase-54-design-groundwork/DSG-004-THE-GATES-BEHIND-THE-DOCTRINE.md) §2.1 and NOTES-DSG-004: the rule's
  origin and its calibration corpus.
- P88 [GAM-021](GAM-021-A-PLAN-IS-NOT-WARNED-ABOUT-THE-SCROLL-SETTING-IT-IS-ABOUT-TO-APPLY.md): changes the other half of
  TPL-007's pinned pair. Whichever lands second writes the final pin.
- Grep run: `grep -rlan "uncollapsible-multi-column" dev-docs/tasks` found SBR-004, P78 README and NEXT-SESSION-PROMPT,
  NOTES-DSG-004, and this phase's README. **No owner.**

## 5. Design

- **Judge the item, not the container.** Pass Arm B the component views. It resolves `For Each.template` to that
  component's visual root and abstains when the root's resolved `sizeMode` is `contentSize` or `contentWidth`.
- **Unknowable abstains, but look at the 3 true positives first.** A template that does not resolve, is wired, or has an
  instance or `ParentComponentObject` root is unknowable. The module's rule is that unknowable abstains. **But if any of the
  three calibration grids has an unknowable item root, abstaining silences a true positive.** Read their item roots before
  choosing, and record them in §8.
- 🔒 **Ruling for Richard, only if that read finds an unknowable true positive:** keep firing on unknowable item roots (the
  pill false positive survives when the pill is a component instance), or abstain (a real grid built from instance roots
  goes unreported).
- A container that is itself content-width could also be excluded, as in Arm A, but it is not D50's case and has no measured
  instance. Add it only with its own arm.
- **Do not** drop the `columnGap` discriminator. It is what separated 3 from 45.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8:** a spec with a full-width wrapped row, `columnGap`, and a `For Each` whose template root is `contentSize` gets `uncollapsible-multi-column`. |
| AC2 | After the fix the AC1 shape is silent. **The same row with the template root at `explicit` and width 300px still fires**, in the same spec. |
| AC3 | 🔴 **Reverted arm:** remove the item-root read, and AC2's silent arm goes red while its firing arm stays green. |
| AC4 | 🔴 **The wrong fix goes red too:** an arm that ports Arm A's container exclusion instead leaves AC1's shape firing. The spec shows it, so the register's reading cannot be built by mistake. |
| AC5 | **Census before landing:** firings over `library/prefabs` and `templates/` before and after. Before (predicted): `Story/Sidebar` and `Game/Choice row`. After: neither. Re-run the calibration corpus's three true positives and record that each still fires, or apply the ruling. |
| AC6 | **Pins updated in the same change:** TPL-006's assertion becomes `[]`. TPL-007's code set loses `uncollapsible-multi-column`. Each gate is run once against the reverted fix and goes red. |
| AC7 | **The person's door:** TPL-006's generator output (`validate_component` on `Story/Sidebar`) carries no warning, and the sidebar at 390×844 still wraps its tags (a render reading, not only the diagnostic). |

## 7. Traps

- 🔴 **Arm A's exclusion is about a different node.** It would read as a fix and change nothing on either template.
- ⚠️ A `For Each` renders its items into its parent. The wrapped row's children are the items, not the `For Each`.
  Resolve the item from `parameters.template`.
- ⚠️ Two gates pin this warning, so an unrelated change that breaks the check also turns them red. Read the diff of codes,
  not only the count.

## 8. Record

Not started.
