# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings: 7 ruled in session 1, and what each still
leaves open) and §7 (rules). Then read the whole task you pick. Every task file has its own collisions (§4) and traps (§7).

**The board (2026-09-14, session 1), re-derived from the task files:** **1 of 24 built.**
- ✅ **GAM-019**: the door refuses a wire to an input a built-in node does not have. Built, graded by reverted arms at the rule,
  at `validate_component`/`validate_project`, and in Rocket School's generator. Zero change over the real validator on 178
  projects. **Uncommitted.** Its §8 lists what is owed.
- 🔒 **Ruled, not built:** GAM-001 + GAM-003 (R3), GAM-002 (R4), GAM-005 (R6), GAM-006 (R7), GAM-007 (R8), GAM-008 (R9),
  GAM-009 (R10).
- ⬜ Everything else is as scoped.

## Do, in order

1. **Ask Richard to commit GAM-019** (it is his call; nothing is committed). Commit by pathspec, and `git add` the untracked files
   first: `packages/noodl-editor/tests-unit/gam-019/`, `packages/noodl-mcp/tests/gam019BuiltinPortDoor.test.ts`. The tracked
   files: `rules/nonexistentPort.ts`, `CatalogIndex.ts`, `react-component-node.ts`, `noodl-mcp/src/catalog.ts`,
   `scripts/node-catalog/{generate.js,lib/build-catalog.js,lib/derive-encoding.js}`, `noodl-types/src/node-catalog{.json,.d.ts,-enriched.json}`,
   `nodegx-project-contract/run-on-value-change-migration.ts`, `noodl-editor/tests/validation/dynamic-ports.test.ts`, and the
   P88/P78 docs. ⚠️ P78's register also carries P87's uncommitted edits, so a pathspec commit of it takes those too. Ask.
2. **Ask R3's owed follow-ups together** (GAM-001 §5 and GAM-003 §5):
   - What does a **saved** Expression default to under "evaluate at load, with an opt-out"? On changes every existing
     project's first frame.
   - Is the opt-out one of NDA-017's `Run On Value Change` controls, which Expression already has, or a new checkbox?
   - Under evaluation, `round(s * 48)` over unset `s` is `NaN`, still not a size. Is a `NaN` from unset inputs "empty" or
     "not a size"?
   - And GAM-019's follow-up: the refusal's first hint is "did you mean `set`?", which offers a **signal** for a value wire.
     Fix it (don't suggest a signal for a value wire, or tighten short-name distance), or leave it?
3. **Build what needs no ruling**, by who it bites:
   - **GAM-012 AC1, isolation.** Is the focus tracker the cause? GAM-010 waits on it.
   - **GAM-004 AC1, isolation.** It rebuilds the two failing attempts, which are not in git.
   - **GAM-018 AC1.** Prediction: confetti with `custom-html-module` registers, and confetti with `nodegx-clipboard` fails.
     GAM-014 may wait on it. ⚠️ The GAM-019 corpus run logged `kit "nodegx-richtext" failed to load: Cannot convert object to
     primitive value` on the NodeGX test projects. That is a live reading for this task.
4. **Then the ruled Track A tasks**, in README §5 order: GAM-006 (R7), GAM-005 (R6), GAM-007 (R8), GAM-009 (R10), GAM-008 (R9,
   AC1 first), GAM-002 (R4, AC3 census first). GAM-001/003 wait on step 2.

## Owed by GAM-019, small

- 🔴 The jasmine `noodl-editor/tests/validation/dynamic-ports.test.ts` flip has **not run** (Electron `test:ci` only). Run it
  when the box is free, one heavy job at a time.
- Look at a Text Input's property panel in a running editor: the Run On Value Change → Value checkbox should now show.
- Rebuild the bundled MCP server (`noodl-mcp` build) so installed agents get the refusal. Until then only `src` has it.

## Owed, small, not a task

- P77's register row **D13** reads owner `NONE`, but P80 DEF-028 ✅ covers it. Point the owner cell at DEF-028 (GAM-023 §4 has
  the reading).

## Traps found in session 1

- 🔴 **The catalog has two Text Inputs.** `Text Input` is the deprecated node (declared-port-groups only).
  `net.noodl.controls.textinput` is the live one. Read the type name, not the display name.
- 🔴 **`createNodeFromReactComponent` builds `defineNode`'s options as an explicit literal.** A definition field it does not
  copy is silently dropped (NDA-017's `runOnValueChange` was). Suspect it whenever a React node's definition "does nothing".
- 🔴 **A combined jest run can silently skip a suite.** Five spec paths gave "4 suites". Count the PASS lines against the files.
- 🔴 **A census that reads the wrong keys prints the same zero.** Legacy `project.json` connections are
  `fromId/fromProperty/toId/toProperty`, not `targetId`. Match a known baseline (525 / 790) before trusting it.
- ⚠️ A `cd` inside one parallel Bash call moves the shell for the others. Use absolute paths, or `cd … && pwd &&` in each.
- Carried from scoping: twelve register rows were wrong about their own mechanism; a fix can remove a template's accidental
  safety (Rocket School's `cdShown` rides on D55's `null`); P30's audit ruled three of these behaviours correct; export parity
  is owed for GAM-006/008/013/017; `grep -a` always.

## State of the tree

- **Nothing from P88 is committed.** P87's template, kit, gates and drives are uncommitted too.
- Scratch evidence for GAM-019 (census, compare script, AC7 runner, logs) is in session `2ca95830…`'s scratchpad. The
  numbers are recorded in GAM-019 §8.
