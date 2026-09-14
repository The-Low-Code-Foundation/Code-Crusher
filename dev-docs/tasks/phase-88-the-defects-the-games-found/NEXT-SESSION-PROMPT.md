# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings) and §7 (rules). Then read the whole task
you pick, including its §8: session 3 changed three of them.

**The board (2026-09-14, session 3), re-derived from the task files:** **1 of 24 built.**
- ✅ **GAM-019**, committed `4bb438165` + `15f7bf720`.
- 🟡 **GAM-012** faults 1–2 committed `bb27086de`. Fault 3, AC6 and the deploy bundle are owed (GAM-012 §8).
- 🟡 **GAM-006**: AC1 RED recorded; **(b) built, `82a7d3775`**, graded by reverted arms in the runtime *and* the export (AC8).
  **(a)/AC3–AC7 not started**, plus a new owed defect (below).
- 🟡 **GAM-004**: AC1 measured. **D47 does not reproduce in the runtime** (13 arms). Not built, nothing to build yet.
- 🟡 **GAM-018**: AC1 measured, prediction confirmed and widened. Not built. R2 waits on AC2.
- 🔒 **Ruled, not built:** GAM-001 + GAM-003 (R3 and its follow-ups), GAM-002 (R4), GAM-005 (R6), GAM-007 (R8), GAM-008 (R9),
  GAM-009 (R10), GAM-010 (R11, after GAM-012).
- ⬜ Everything else is as scoped.

## State of the tree

Session 3 is **committed** (Richard: "Commit away"): `82a7d3775` (GAM-006 (b), the export's `statesLib`, the regenerated
HLS-001 golden, the gam-006 spec) and `42cd090fe` (the gam-004 spec, GAM-004/GAM-018 records, README, this prompt). The tree
still holds a peer session's uncommitted P87/TPL-007 work (`templates/rocket-school/`, `library/modules/game-kit/`,
`packages/noodl-mcp/tests/tpl007*`, `scripts/devtools/drive-rkt*`, P78's register and prompt, `package.json`, `docs-site`,
`form-fields`). None of it is P88's, so commit only by pathspec.

## Do, in order

1. **GAM-006, finish what (b) started** (Track A, ruled R7). In this order:
   - 🔴 **The delayed colour.** A colour with a per-value transition delay publishes its parsed **RGBA array** for the
     whole delay (`[51,68,85,255]` at 0/96/192 ms; the spec's "delayed hex" row records it and grades nothing yet). The
     `ms < c.delay` branch in `states.ts` `onRunning` and in `statesLib.ts` `onTweenRunning` both publish the parsed start.
     Turn the recording row into a RED assertion first, then fix both files, with a reverted arm in each. Add an A5 parity
     row with a delayed **colour**: today's delayed A5 value is `opacity`, a number, so parity cannot see it.
   - **(a) and AC3:** read the colour before parsing (Color Blend's `parseColor`, `colorblend.ts:45-90`, with its depth
     bound). R7: warn only if CSS rejects the value, and say what happens where there is no document. AC3 needs a **browser**.
   - AC7 (`node-transitions.ts`, measure first), AC4 (census before landing), AC5/AC6 (browser drives, workarounds).
   - Owed by (b) whatever else happens: rebuild the viewer bundle and the `nodegx-export` `dist` (both gitignored), so the
     editor and a deployed app get the change.
2. **GAM-018 AC2, the product arms.** Confetti alone in a deployed page, the editor preview and an SSR deploy, then with
   one unguarded kit. Then 🔒 R2 with AC1's and AC2's readings beside it. Remember that `extractProjectOverlay` spawns
   `dist/kit-extract.cjs`, so a fix is graded on the bundle (§8).
3. **GAM-004, the browser arm (AC5 moved first).** A copy of TPL-005 with attempt 1 restored for the hit gate, driven with
   real key events. If it reads late, bisect browser against runtime. If on time, D47 is **measured and not reproduced**,
   and whether to close it is Richard's call. Either way AC6's comment (`tpl005Components.ts:473-477`) is owed.
4. **Then the ruled Track A tasks** in README §5 order: GAM-005 (R6), GAM-007 (R8), GAM-009 (R10), GAM-008 (R9, AC1 first),
   GAM-002 (R4, AC3 census first), GAM-001/GAM-003 (R3).

## Readings taken in session 3 (2026-09-14, over HEAD `bb27086de`, uncommitted tree)

Logs are in session `04c88900…`'s scratchpad (`gam004/`, `gam018/`, `gam006/`).

| gate | result |
|---|---|
| `noodl-runtime` `gam-004-gate-reads-the-same-turn.test.ts` | 13/13 (`AC1_RUN6_EXIT=0`); same on the pre-FB-025 drain (`OLDDRAIN_EXIT=0`) |
| `noodl-runtime` `tsc --noEmit -p tsconfig.json` (includes `test/**`) | 0 errors (`RUNTIME_TSC_EXIT=0`) |
| GAM-018 extractor arms A–D, B′, B″, E1–E4 | `GAM018_AC1_EXIT=0`, `GAM018_AC1_RUN2_EXIT=0` |
| `noodl-viewer-react` `gam-006-states-token-colour.test.ts` | 8/8 with (b) (`GAM006_DELAY2_EXIT=0`); reverted arm 3 red of 7 |
| `noodl-viewer-react` States corpus (`nda-001`, `nda-004`, `erg-001`) | 3 suites, 42/42 |
| `nodegx-export` `animation-pair.test.ts` | 57/57 (`AC8_GREEN2_EXIT=0`); export half reverted: 7 red |
| `nodegx-export` full suite | **100/101 suites** (`EXPORT_FULL_EXIT=1`, 3,490 passed). The one red was `hls001-corpus-identity`: exactly **1** hash differed, `glow-desk/src/lib/states.ts`. With (b) reverse-applied it is 4/4 (`HLS001_HEAD_EXIT=0`), so (b) moved it, as it should. The golden was regenerated deliberately (`HLS001_REGENERATE=1`), and **1** hash line moved. 4/4 after (`HLS001_AFTER_REGEN_EXIT=0`). **Re-run on the final bytes: 101/101 suites, 3,491 passed** (`export-full2.log`, `EXPORT_FULL2_EXIT=0`) |
| `test:ci` (editor, Electron), `test:main` | **not run** |

## Owed, small

- GAM-019: the jasmine `dynamic-ports.test.ts` flip (Electron `test:ci`), a Text Input panel look, an MCP bundle rebuild.
- P77's register row **D13** reads owner `NONE`; point it at P80 DEF-028 (GAM-023 §4).
- P78's register rows D41, D47 and D49 still read as scoped. Add a dated line pointing at GAM-018/004/006 §8 **when their
  status changes**, not before.

## Traps found in session 3

- 🔴 **A Function's script body runs synchronously inside its update.** Only `Success` waits for the `await`. A gate
  evaluated beside a synchronous Function reads this turn's value. GAM-004's "known-late" arm was wrong the first time for
  this reason; only a value written *after* an `await` is late.
- 🔴 **`createCorpusGraph` nested components need component-level `ports`.** Without them every wire into the instance
  fails with a *logged* `input doesn't exist`, and the arms read "no signal" rather than erroring.
- 🔴 **`setInputValue` on a dynamic input nobody registered does nothing.** GAM-006's delay row read "no array" until
  `registerInputIfNeeded` was called first.
- 🔴 **`extractProjectOverlay` runs `dist/kit-extract.cjs`**, not `src`.
- 🔴 **`animation-pair.test.ts` boots the real `states.ts`.** A States runtime change reddens P18's parity rows until the
  emitted `statesLib` changes in step. Count the reds: (b) alone gave 7, not 1.
- ⚠️ A `cd` inside one parallel Bash call moved the shell for the other (session 3 hit it again). Absolute paths.
- Carried: two Text Inputs in the catalog; `createNodeFromReactComponent` drops uncopied fields; a combined jest run can
  skip a suite; a census reading the wrong keys prints the same zero; `*` ports have no kind.
