# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings) and §7 (rules). Then read the whole task
you pick, including its §8.

**The board (2026-09-14, session 6), re-derived from the 24 task files' status lines:** **2 of 24 built.**
- ✅ **GAM-019**, `4bb438165` + `15f7bf720` (+ CN-002's fixture, `8af0c943d`).
- 🟢 **GAM-006**, `82a7d3775` + `062dfd9c0`. Everything but AC6's Rocket School arm. TPL-006's pin was removed in `1cf0a81d2`.
- 🟡 **GAM-012**: faults 1–2 committed in `bb27086de`. Fault 3, AC6 and the deploy bundle are still owed.
- 🟡 **GAM-018**: AC1 (session 3) and AC2 (session 6) are measured. **The product registers confetti alone and the extractor does
  not.** 🔒 R2 is askable, and nothing is built.
- 🟡 **GAM-004**: measured and **not reproduced** in the runtime (session 3) or in a browser with real keys (session 6).
  🔒 Closing it as disproved is Richard's call.
- 🔒 **Ruled, not built:** GAM-001 + GAM-003 (R3), GAM-002 (R4), GAM-005 (R6), GAM-007 (R8), GAM-008 (R9), GAM-009 (R10),
  GAM-010 (R11, after GAM-012).
- ⬜ The other 13 are not started.

🔴 **The ratchet:** session 6 measured and fixed a red, but closed no build AC. Session 5 closed ACs, so it has not tripped,
but **this session builds.** Every measurement the ruled tasks were waiting on is done.

## Do, in order

1. **GAM-005 (R6)**: a warning, with a "shared on purpose" escape, for two copies of a component that share state. It is the
   first ruled Track A task in README §5 order. Reproduce RED at HEAD first (§7), and measure the blast radius over
   `library/prefabs`, the library modules and `templates/` before the warning lands.
2. Then, in README §5 order: **GAM-007 (R8)**, **GAM-009 (R10)**, **GAM-008 (R9, AC1 first)**, **GAM-002 (R4, AC3 census
   first)**, **GAM-001 / GAM-003 (R3)**.
3. **GAM-018, only once R2 is ruled:** AC4 at the ruled layer, graded on `dist/kit-extract.cjs` as well as `src`. Then AC5,
   every module extracted alone, before and after. ⚠️ **GAM-024's planned fix reuses this extractor**, so GAM-024 waits on
   GAM-018.

## Richard's, not a builder's

- 🔒 **R2 (GAM-018):** the extractor's `Noodl` is a catch-all Proxy that answers a kit's `typeof Noodl.defineNode` feature
  test. A real page and the SSR server define `Noodl` with `defineModule` only, and there confetti registers and draws.
  **Option 1:** make the extractor's `Noodl` a plain object shaped like the page's. **Option 2:** keep the Proxy, but answer
  `undefined` for the four SDK names. Option 1 is more honest. AC5's census shows which kits move.
- 🔒 **GAM-004:** close D47 as *measured and disproved* (README §8 allows it), or keep it open? Two environments, both
  attempts rebuilt, each beside a late arm that reads late. The 09-11 scripts are not in git.
- Rulings still askable (README §4): R1, R11, R12, R15, R16, R17, R18, R20.
- Carried from session 5: whether session 5 should have committed session 4's work (`062dfd9c0`). Session 6 committed its
  own work under the same `cline-dev` rule (commit as you go, no push).

## State of the tree

Session 6 committed its files by pathspec: GAM-004, GAM-018, the README, this handoff, `tpl005Components.ts` (comments
only) and `tests-unit/tpl-003/landing-template.test.ts`. **In the P78 register, only session 6's three dated lines were
committed (D41, D47, D49), staged hunk by hunk.** Someone else's uncommitted D66 hash edit (`uncommitted` → `4bb438165`,
made at 19:03) was left in the working tree.

⚠️ **HEAD moved during session 6.** A TPL-008 session committed `2ad64ccee` (the todo list) and `7b6f7c650` (D71–D73) at
18:59–19:01. The tree still holds peers' uncommitted P87/TPL-007 work (`library/modules/game-kit/`, `tpl007*`,
`scripts/devtools/drive-rkt*`).

**Scratch, not in git** (session `53867993…`'s scratchpad): `gam018/` and `gam004/` hold the projects, deploys, runners
and logs, plus a fresh `deploy-from-disk` bundle (`gam018/deploy-from-disk.cjs`, and `dfd-inspect.cjs`, a copy that prints a
thrown object). The `scripts/devtools/deploy-from-disk.cjs` in the repo dates from 09-12 and predates `062dfd9c0`'s entry change.

## Readings taken in session 6 (2026-09-14, HEAD `e7a88a49f` → `7b6f7c650`)

| gate | result |
|---|---|
| Extractor, confetti alone (my project) | 0 nodes, `registration failed: Cannot convert object to primitive value`, `EXTRACT_CONFETTI_EXIT=0` |
| Deployed page, confetti alone / wires restored / + `custom-html-module` | registers in all 3; Celebrate draws 0 / 1 / 1 canvas; known-firing clicks 0 → 1 in all; no errors |
| SSR kit loader, confetti alone / + `custom-html-module` | `loaded`, `failures: []`, `nodegx.confetti` registered, both exit 0 |
| Editor preview picker | **not driven**: read from source (`ViewerConnection.ts:334`, `static/viewer/index.html:92-104`) |
| GAM-004: ship / att1 / late 0 ms / late 80 ms, keys `DDDDDDUDUDUDUDUD` | hearts drop on moves 8 and 10 in the first three; the 80 ms arm drops on 8 and **11**; all deploys and drives exit 0 |
| TPL-003 `landing-template.test.ts`, before / after / reverted arm | 9/10 (21 vs 28) / **10/10** `TPL003_GREEN_EXIT=0` / 9/10 `TPL003_SAB_EXIT=1`; file restored byte-identical |
| `test:main` (at `7b6f7c650` + session 6's tree) | **7,500 / 7,500, 456 suites, `TEST_MAIN_EXIT=0`** |
| `noodl-mcp` `tpl005Template.test.ts` after the comment edit (jest; vitest reads "no tests") | **56 / 56**, `TPL005_EXIT=0` |
| Editor `test:ci` (Electron) | **not run** |

## Where session 5's handoff was wrong

- 🔴 *"`deploy-from-disk` drops For Each item-port wires (D52) … TPL-005 loses 4 wires."* **TPL-005's 4 are the
  `KeyboardShortcut.pressed → Game/Move.go` wires**, measured this session (GAM-024 §2 already said so). The deploy drops
  every wire touching a **kit** node, so a real-key drive of that deploy moves nothing until they are restored in the
  bundle. Whether For Each item wires also drop was not re-measured.
- *"`deploy-from-disk.cjs` … rebuilt"*: session 5 rebuilt it into its scratchpad, not in place. The repo copy is stale.

## Owed, small

- GAM-019: the jasmine `dynamic-ports.test.ts` flip (Electron `test:ci`), a Text Input panel look, an MCP bundle rebuild.
- P77's register row **D13** reads owner `NONE`; point it at P80 DEF-028 (GAM-023 §4).
- GAM-018 AC7 (TPL-005 taking confetti) waits on the fix.
- **For P87, not P88:** Rocket School's 22 `useTransitions: false` pins and `tpl007Template.test.ts`'s D49 gate. **For
  TPL-008:** `tpl008Components.ts` pins it too (gate at `tpl008Template.test.ts:190`). D49's register line says the row
  closes when those go.

## Traps found in session 6

- 🔴 **A hand-written V2 project needs `rootNodeId` in `nodegx.project.json`.** Without it, `deployToFolder` rejects with
  `{ result: 'failure', message: 'Failed to export project.' }`, which `deploy-from-disk` prints as `[object Object]`.
- 🔴 **Exported connections are `sourceId/sourcePort/targetId/targetPort`.** A diff keyed on the source files'
  `fromId/fromProperty` reports every wire as dropped.
- 🔴 **In a browser, the runtime updates once per animation frame.** A value written after `await setTimeout(0)` still
  makes a gate's read, where the runtime spec's `settle` reads it a turn late. A browser late-arm has to land after the next
  frame (80 ms did).
- ⚠️ A module registers under `reactNodes` as well as `nodes`. Read both, or a React kit reads as zero nodes.
- Carried: run `deploy-from-disk` from `packages/noodl-editor`; `setInputValue('currentState')` on an unwired States node
  does nothing; `echo "X_$(…)_EXIT=$?"` prints the substitution's status; both `nodegx-export` parity suites load runtime
  source with their own `require` shim; `extractProjectOverlay` runs `dist/kit-extract.cjs`.
