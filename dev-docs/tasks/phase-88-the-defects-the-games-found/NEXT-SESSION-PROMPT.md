# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings) and §7 (rules). Then read the whole task
you pick, including its §8.

**The board (2026-09-14, session 10), re-derived from the 25 task files' status lines:** **6 of 25 built.**
- ✅ **GAM-019**, `4bb438165` + `15f7bf720` (+ CN-002's fixture, `8af0c943d`).
- 🟢 **GAM-006**, `82a7d3775` + `062dfd9c0`. Everything but AC6's Rocket School arm.
- 🟢 **GAM-005**, session 7, **uncommitted**. **Left:** AC5 (browser), AC7 (repeater `id`), site-builder's two marks, and an MCP bundle rebuild.
- 🟢 **GAM-007**, session 8, **uncommitted**. **Left:** the browser halves of AC1 and AC5, and AC7 (Rocket School's gate, the peer's).
- 🟢 **GAM-009**, session 9, **uncommitted**. R10: typing writes the start value, and a remount announces only a value it has
  not already announced. Driven in a browser on a minimal Mounted-toggle page: the old and sabotage runtimes read `""`, the
  fixed runtime reads `Tom`. **Left:** AC2's Rocket School clause and AC6 (`rsNameKeep`, the peer's file).
- 🟢 **GAM-008**, session 10, **uncommitted**. AC1 isolated the cause: the setter gets **both** targets in one pass, and
  they collapse to a glide from where the bar was. RKT-006's "one target" and "duration 0 is not a jump" are both excluded,
  and a jump needs two frames. R9 is built: `Jump To` and `Jump Value`, which carry on towards Target Value in either
  order. A jump is not an arrival. C is in the ports, the enrichment and a spliced catalog. 4 reverted arms, 7 export A4 rows
  plus a CONTROL. Driven in a browser on a minimal page: new is full ≤ 32 ms after every press and glides; old and sab never
  refill. **Left:** AC2, AC5's Défi clause and AC6 (Rocket School's `cdKick`, the peer's), the export hook's jump, an MCP bundle.
- 🟡 **GAM-012**: faults 1–2 committed (`bb27086de`). Fault 3, AC6 and the deploy bundle are owed.
- 🟡 **GAM-018**: AC1 and AC2 are measured, and the extractor is the bug. 🔒 R2 is askable, and nothing is built.
- 🟡 **GAM-004**: not reproduced in the runtime or in a browser. 🔒 Closing it is Richard's call.
- 🔒 **Ruled, not built:** GAM-002 (R4), GAM-001 + GAM-003 (R3), GAM-010 (R11, after GAM-012),
  GAM-025 (R8's "data wins later", call-site sweep first).
- ⬜ The other 12 are not started (GAM-013 waits on R1). GAM-011 was waiting on GAM-009 (same node); it now waits on R12 only.

**The ratchet:** sessions 7, 8, 9 and 10 each built a task and closed ACs. Keep building.

## Do, in order

1. **GAM-002 (R4, AC3 census first):** `String(n)` and `Number(s)` work inside an Expression. Reproduce RED at HEAD first (§7).
2. Then **GAM-001 / GAM-003 (R3)**.
3. **Remainders, only between builds:**
   - GAM-008: AC6 is the peer's generator. The change is in the enrichment's countdown pattern: `jumpValue` 100 and
     `cdGate.ontrue → cdAnim.jumpTo`, in place of `cdSetDur0 → cdSetFull → cdKick`. Rocket School still cannot be walked
     in a `deploy-from-disk` build.
   - GAM-007: one browser page, a Static Data row with `on` → Function → For Each. It should draw no tile and put
     `collection/reserved-field-name` in the console, beside the `faces` twin that draws.
   - GAM-005: AC5 (two banners in a browser), AC7 (id-less rows into a For Each), and site-builder's two `siteCurrentSlug` marks.
   - GAM-009: Rocket School's `nameBox === 'Tom'` clause needs a build P87's drive can walk (P87's own pipeline, not
     `deploy-from-disk`). The no-workaround copy recipe is in GAM-009 §8 AC2.
4. **GAM-018, only once R2 is ruled** (AC4 graded on `dist/kit-extract.cjs` as well as `src`, then AC5). GAM-024 waits on it.
5. **GAM-025 (A)** is not next: its AC2 call-site sweep comes before any trap change.

## Richard's, not a builder's

- 🔒 **Commit GAM-005, GAM-007, GAM-009 and GAM-008?** None is committed. GAM-005 and GAM-007 both touch
  `validation/{diagnostics,index,authoredCandidate}.ts`, so one commit for those two is simplest. GAM-009 touches only the
  viewer and a devtool, so it can be its own commit. So can GAM-008 (see its files below). A pathspec commit must name every
  file below (`git add` the untracked ones first).
- 🔒 **New, from GAM-008:** a jump does **not** fire At Target Value. R9 did not decide this. It stops a countdown wired
  to "time's up" from firing the moment it refills, and it is the reverse of Transition's open B3. Keep it?
- 🔒 **New, from GAM-009 AC4:** a `Set` that a focused field absorbs still writes the start value (ERG-001's written rule).
  So typed `Tom`, a focused `Set` of `Ann`, then hide and show, comes back as `Ann`. Should an absorbed `Set` decide what a
  later remount shows?
- 🔒 **R2 (GAM-018):** option 1 makes the extractor's `Noodl` a plain object shaped like the page's. Option 2 keeps the Proxy
  and answers `undefined` for the SDK names.
- 🔒 **GAM-004:** close D47 as measured and disproved, or keep it open?
- Rulings still askable (README §4): R1, R11, R12, R15, R16, R17, R18, R20.

## State of the tree

**Session 7's files (GAM-005, uncommitted):**
- New: `packages/noodl-editor/src/editor/src/validation/repeatedComponentVariable.ts`,
  `packages/noodl-editor/tests-unit/gam-005/repeatedComponentVariable.test.ts`,
  `packages/noodl-mcp/tests/gam005VariableInRepeatedComponent.test.ts`.
- Changed: `noodl-mcp/src/validate.ts`, `AiAssistant/authoring/validate.ts`, `authoring/prompts/{interfaces,decomposition}.ts`,
  `noodl-mcp/tests/tpl00{3,5,6}Components.ts`, `templates/landing-pages/components/Site/FilterPill/nodes.json`,
  `templates/pixel-game/components/Game/Move/nodes.json`, `templates/story-engine/components/Story/Source/nodes.json`, the
  embedded `landing-pages.content.json`, and the GAM-005 task file.

**Session 8's files (GAM-007, uncommitted):**
- New: `packages/noodl-editor/src/editor/src/validation/reservedRowField.ts`,
  `packages/noodl-editor/tests-unit/gam-007/reservedRowField.test.ts`,
  `packages/noodl-mcp/tests/gam007ReservedRowField.test.ts`,
  `packages/noodl-runtime/test/gam-007-a-data-field-called-on.test.ts`,
  `dev-docs/tasks/phase-88-the-defects-the-games-found/GAM-025-A-ROW-FIELD-NAMED-ON-READS-AS-THE-DATA.md`.
- Changed: `packages/noodl-runtime/src/{model,collection}.ts`, the GAM-007 task file, and D64's row and section in the P78 register.

**Session 9's files (GAM-009, uncommitted):**
- New: `packages/noodl-viewer-react/tests/gam-009-typed-text-survives-a-remount.test.tsx`,
  `scripts/devtools/drive-gam009-remount.js`.
- Changed: `packages/noodl-viewer-react/src/components/controls/TextInput/TextInput.tsx`,
  `packages/noodl-viewer-react/src/nodes/controls/text-input.ts`, `scripts/devtools/deploy-from-disk.entry.ts` (ENOENT guard),
  the GAM-009 task file, and D61's row and section in the P78 register.

**Session 10's files (GAM-008, uncommitted):**
- New: `packages/noodl-viewer-react/tests/gam-008-a-bar-that-jumps-then-glides.test.ts`, `scripts/devtools/drive-gam008-refill.js`.
- Changed: `packages/noodl-viewer-react/src/nodes/std-library/animate-to-value.ts`; `packages/nodegx-export/src/emit/animateLib.ts`;
  **one hunk** in `packages/nodegx-export/src/analyze/plan.ts` (the Animate To Value refusal loop);
  `packages/nodegx-export/tests/{animation-pair,hls001-corpus-identity}.test.ts`; `packages/nodegx-export/tests/goldens/hls001-corpus.sha256.json`
  (2 lines); `docs/node-catalog/enrichment/net.noodl.animatetovalue.json`; `packages/noodl-types/src/node-catalog{,-enriched}.json`
  (the Animate To Value entry only); `docs-site/docs/nodes/animation/net-noodl-animatetovalue.md`; the GAM-008 task file; D67's row and
  section in the P78 register.

**Shared by sessions 7–10:** this handoff and the README. Sessions 7 and 8 also share `validation/{diagnostics,index,authoredCandidate}.ts`.

⚠️ **The P78 register also carries peers' uncommitted hunks.** Stage it hunk by hunk: session 7 owns D57's row and a dated
paragraph, session 8 owns D64's, session 9 owns D61's, and session 10 owns D67's.

⚠️ **The catalog is red before GAM-008, and it is GAM-009's.** `catalog:check` fails on `net.noodl.controls.textinput` alone,
which is GAM-009's uncommitted Text Input change, and `docs:nodes:check` fails on the Options and Text Input pages. Session 10
spliced only Animate To Value's entry and regenerated only its page. **GAM-009's commit owes its own catalog entry**
(`catalog:generate`, then keep that one entry) **and its doc page.** The Options page's owner was not traced.

⚠️ **Peers are live** in `templates/rocket-school`, `packages/noodl-mcp/tests/tpl007*` (untracked, changed 20:07) and
`templates/todo-list-demo`. Rocket School's D64 gate (`tpl007Template.test.ts:951-958`) and its `rsNameKeep` workaround
(`tpl007Components.ts:1683`, `:1726-1727`, pinned at `tpl007Template.test.ts:692`) are theirs.

**Bundles:** session 9 rebuilt `src/external`'s viewer, deploy and ssr bundles in place (`webpack.prod.js`, exit 0, no peer
job running). The file lists are identical, all three carry `_announcedValueIs`, and `deploy/noodl.deploy.js` is
**byte-identical** to AC2's driven "new" runtime (`ed604813…`). The previous three are in `gam009/external-before/`. They are
gitignored, so this reaches only this machine's editor preview and deploys.

**Scratch, not in git:** session 9's scratchpad (`3a932927…`), folder `gam009/`, holds every log named in GAM-009 §8,
`census.js` (`SABOTAGE=1`), `sabotage.sh`, `build-arms.sh`, the three runtimes, the minimal project and its three site
arms, and the Rocket School no-workaround copy. Sessions 7 and 8's `gam005/` and `gam007/` folders are in their own scratchpads.

**Scratch, session 10** (`f16bd48c…/scratchpad/gam008/`): the AC1 and after logs, `sabotage.js` (S1–S4), `build-arms.sh`,
the fresh `deploy-from-disk.cjs`, `runtime-{new,sab}`, `project-refill`, `site-{old,new,sab}`, `drive-*.json`, and the catalog, doc and HLS golden snapshots.

## Readings taken in session 10 (2026-09-14, HEAD `1f5c10c5b`)

| gate | result |
|---|---|
| GAM-008 spec at HEAD / after | 2 failed + 6 passed / **14/14** |
| 4 reverted arms on the node | S1 **2** red, S2 **5**, S3 **1**, S4 **1**, each exactly its rows; restored byte-identical (`222ee829…`) |
| `animation-pair.test.ts` | **66/66**: 7 new A4 jump rows, a CONTROL, and B13's refusal by name |
| AC5 minimal page, real CDP, 3 arms × 2 viewports | new: full in **28–32 ms** after every press, 245 px at 600 ms; old and sab: never; the chain (known-firing) 300 / 182 / 109 in every arm; 0 console errors in new and sab |
| whole `noodl-viewer-react` | **112 suites, 1,479 passed, 1 todo**, exit 0 |
| whole `nodegx-export`, first run | 1 red, HLS-001 AC3, 2 `animate.ts` files. HEAD's lib put back: 4/4. Golden regenerated: 2 lines. HLS 4/4 |
| whole `nodegx-export`, after the golden | **101 suites, 3,500 passed, 1 skipped**, exit 0 |
| editor `test:main` | **7,522 / 7,522, 458 suites**, exit 0 |
| catalog gates | merge and groups exit 0; `catalog:check` and `docs:nodes:check` red on the **baseline** (Text Input, GAM-009's) |
| noodl-mcp suites, Electron `test:ci`, MCP bundle | not run |

## Readings taken in session 9 (2026-09-14, HEAD `1f5c10c5b`)

| gate | result |
|---|---|
| GAM-009 spec at HEAD / after | 5 failed + 4 passed / **12/12** |
| 3 reverted arms | S1 4 red, S2 1 red, S3 1 red, each exactly its owning rows; all restored byte-identical |
| `erg-001-visual-outcomes.test.ts` | **19/19**, unchanged |
| AC5 census, 885 JSON files | 90 Text Inputs, 36 wired both ways, 7 `Value Changed` wired; the sabotage arm reads 0 over the same 5,399 nodes |
| AC2 minimal page, real CDP, 3 arms | old `""`, **new `Tom`**, sab `""`; every click reached; 0 console errors |
| AC2 Rocket School, P87 drive, 3 arms | **12 of 12 cells not reached**: graded nothing |
| whole `noodl-viewer-react` suite | **111 suites, 1,465 passed, 1 todo**, exit 0 |
| editor `test:main` | **7,522 / 7,522, 458 suites**, exit 0 |
| noodl-mcp suites, Electron `test:ci`, MCP bundle | **not run** (GAM-009 changed no door) |

## Owed, small

- **CMP-001 (P85):** `cmp001InterfaceDoctrine.test.ts:353` pins 33%, and the artefact is 37%. Re-run `measure-interfaces.py`
  and change the doctrine's figure with the literal. Do not bump the literal alone.
- GAM-019: the jasmine `dynamic-ports.test.ts` flip (Electron `test:ci`), a Text Input panel look, an MCP bundle rebuild.
- GAM-005 and GAM-007: an MCP bundle rebuild, so the installed app's doors carry both warnings.
- GAM-009: `nodegx-export`'s own input was not measured across a remount. It is P18's parity question.
- P77's register row **D13** reads owner `NONE`. Point it at P80 DEF-028. P77 **D33** can cite GAM-009 §8 AC5.
- **For P87, not P88:** Rocket School's 22 `useTransitions: false` pins, `New player form`'s marks, the D49 gate, and now
  `rsNameKeep` (redundant once GAM-009 lands). **For TPL-008:** four intended Variable findings to mark.

- GAM-008: an MCP bundle rebuild (so `get_node_type` shows Jump To), `src/external` viewer, deploy and ssr bundles (not rebuilt),
  and P18's `useAnimatedValue` jump, which `plan.ts` refuses by name.

## Traps found in sessions 7–10

- 🔴 **A "one frame later" workaround needs two frames.** A scheduler run joins by reading its start value, and lands on the
  next frame. Full and empty written one frame apart still glide (GAM-008 AC1).
- 🔴 **A jump that only stops the run breaks when the new target equals the old end.** That target arrives in the value pass,
  ahead of the jump signal, and is dropped as equal. Carry on after the inputs have landed (S1).
- 🔴 **A catalog gate can be red before you touch it.** Take `catalog:check` and `docs:nodes:check` first, diff the stale
  catalog by `typeName` (it is top-level `nodes`, not `packages`), and splice your one entry in, formatted as `JSON.stringify(…, null, 2) + "\n"`.
- 🔴 **An emitted library change moves HLS-001's golden.** Count the red, put HEAD's file back to prove it alone, then regenerate
  and count the moved lines.
- 🔴 **zsh leaves an unquoted `--include=*.js` unexpanded**: the grep counts nothing, and "0 wires" is a broken probe.

- 🔴 **A census joined per file is blind to V2 templates.** A component is `nodes.json` plus `connections.json` in one
  folder. Session 9's first census read 0 wires on every template field and missed 9 of 36 rows.
- 🔴 **A Text Input `Set` or `Value` while unmounted sends no `Value Changed`.** It arrives at the next mount. A remount check
  that compares against the output's value drops it for ever.
- 🔴 **Rocket School cannot be walked in a `deploy-from-disk` build.** P87's drives read NOT REACHED in every arm (GAM-006 s5,
  GAM-009 s9). A Rocket School clause needs P87's own build.
- 🔴 **`deploy-from-disk` must be bundled fresh** (the checked-in `.cjs` predates its entry), and it threw `ENOENT
  noodl_bundles` on a one-component project until session 9's guard.
- 🔴 **Parallel Bash calls share one shell's working directory.** A `cd` in one call moved another call's relative paths
  (sessions 8 and 9 each lost a listing to this). Use absolute paths.
- 🔴 **Template gates pin their warning list exactly.** Run them before landing any new diagnostic.
- 🔴 **`test:main` is the editor's jest only.** It does not run the `noodl-runtime`, `noodl-viewer-react` or noodl-mcp suites.
- 🔴 **`in` walks the prototype chain.** A reverted arm that drops the "is it a function" half of the Model trap's rule grades
  nothing.
- 🔴 **The plan door stamps each finding with the candidate's component name**, not the location's.
- ⚠️ `create_component` remaps a node id another component already uses (`page` → `page-2`).
- ⚠️ Doctrine strings wrap across source lines. A spec regex over them needs `\s+` between words.
