# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings: 7 ruled in session 1, and what each still
leaves open) and §7 (rules). Then read the whole task you pick. Every task file has its own collisions (§4) and traps (§7).

**The board (2026-09-14, session 1), re-derived from the task files:** **1 of 24 built.**
- ✅ **GAM-019**: the door refuses a wire to an input a built-in node does not have. Committed as `4bb438165`, graded by reverted
  arms at the rule, at `validate_component`/`validate_project`, and in Rocket School's generator. Zero change over the real
  validator on 178 projects. Its §8 lists what is owed.
- 🔒 **Ruled, not built:** GAM-001 + GAM-003 (R3), GAM-002 (R4), GAM-005 (R6), GAM-006 (R7), GAM-007 (R8), GAM-008 (R9),
  GAM-009 (R10).
- ⬜ Everything else is as scoped.

## Do, in order

1. ✅ **R3's follow-ups ruled, 2026-09-14 (session 2).** Saved Expressions evaluate at load (on for all). The opt-out is a
   new node-level checkbox. A `NaN` size is empty and silent. GAM-019's hint matches the wire's kind. Recorded in GAM-001 §5,
   GAM-003 §5, GAM-019 §8 and README §4. **GAM-001 and GAM-003 are now unblocked.** ✅ GAM-019's hint is **built** (session 2,
   uncommitted, reverted arms at the rule, `validate_component` and the plan door; GAM-019 §8 "Session 2").
2. **Build what needs no ruling**, by who it bites:
   - **GAM-012 AC1, isolation.** Is the focus tracker the cause? GAM-010 waits on it.
   - **GAM-004 AC1, isolation.** It rebuilds the two failing attempts, which are not in git.
   - **GAM-018 AC1.** Prediction: confetti with `custom-html-module` registers, and confetti with `nodegx-clipboard` fails.
     GAM-014 may wait on it. ⚠️ The GAM-019 corpus run logged `kit "nodegx-richtext" failed to load: Cannot convert object to
     primitive value` on the NodeGX test projects. That is a live reading for this task.
3. **Then the ruled Track A tasks**, in README §5 order: GAM-006 (R7), GAM-005 (R6), GAM-007 (R8), GAM-009 (R10), GAM-008 (R9,
   AC1 first), GAM-002 (R4, AC3 census first). GAM-001/003 wait on step 1.

## Owed by GAM-019, small

- 🔴 The jasmine `noodl-editor/tests/validation/dynamic-ports.test.ts` flip has **not run** (Electron `test:ci` only). Run it
  when the box is free, one heavy job at a time.
- Look at a Text Input's property panel in a running editor: the Run On Value Change → Value checkbox should now show.
- Rebuild the bundled MCP server (`noodl-mcp` build) so installed agents get the refusal **and the kind-matched hint**. Until
  then only `src` has them.
- Known gap, not owed unless it bites: a refusal inside a *neighbouring* component normalised by `toNormComponent`
  (`validate.ts:186`, `:327`) still gets the unfiltered hint. The staged candidate goes through `normalizeV2Component`, which is fixed.

## Owed, small, not a task

- P77's register row **D13** reads owner `NONE`, but P80 DEF-028 ✅ covers it. Point the owner cell at DEF-028 (GAM-023 §4 has
  the reading).

## Traps found in session 2

- 🔴 **A port name is not a port kind.** `NormNode.instancePorts` kept names only. The kind of a `Component Inputs` port lives
  in `nodes.json` (`type`), and it is now in `instancePortTypes`. Framing a ruling as "the rule knows the source port" hid that.
- 🔴 **`*` ports have no kind.** The live Text Input's `startValue` and `onTextChanged` are both declared `*`. A premise that
  guessed `value`/`signal` for them failed in the spec, and the MCP spec's "signal wire" was really a `*` wire.
- 🔴 **Which normaliser a door uses decides whether an arm grades anything.** The plan door (`stage_plan_operation`)
  normalises the staged component with `normalizeV2Component` (`planTools.ts:239`), and `toNormComponent` normalises only
  its neighbours. A reverted arm on the wrong one left AC7 unchanged. Revert where the door reads, and watch the output move.
- ⚠️ **Read the catalog through `loadDefaultCatalog()` in a spec**, not with an ad-hoc `node -e` over `node-catalog.json`.
  Three guesses at its shape failed this session.
- ⚠️ zsh does not word-split an unquoted `$D`. `npx jest $D` ran 0 suites and exited 1. Use an array: `"${D[@]}"`.

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

- `4bb438165` holds GAM-019, the P88 folder and P78's register (P87's register rows included, as Richard ruled). After it, only
  the "uncommitted → `4bb438165`" doc markers and this prompt changed; commit them with the next P88 work.
- **Session 2, uncommitted:** the four rulings (GAM-001 §5, GAM-003 §5, GAM-019 §8, README §4) and GAM-019's hint:
  `validation/{CatalogIndex,model,normalize}.ts`, `validation/rules/nonexistentPort.ts`,
  `noodl-editor/tests-unit/gam-019/builtinPortDoor.test.ts`, `noodl-mcp/tests/gam019BuiltinPortDoor.test.ts`. Commit with
  pathspecs, and `git add` nothing untracked. None of the files is new.
- Session 2's logs (`hint-*.log`) are in session `c7b27bb6…`'s scratchpad. Session 1's AC7 runner is still at
  `2ca95830…/scratchpad/gam019-ac7-rocket.ts` (`npx ts-node -T -P ./scripts/tsconfig.json <file>`, from the repo root).
- P87's template, kit, gates and drives are still uncommitted, and none of them was touched.
- Scratch evidence for GAM-019 (census, compare script, AC7 runner, logs) is in session `2ca95830…`'s scratchpad. The
  numbers are recorded in GAM-019 §8.
