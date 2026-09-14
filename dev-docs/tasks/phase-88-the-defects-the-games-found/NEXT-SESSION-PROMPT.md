# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings) and §7 (rules). Then read the whole task
you pick, including its §8.

**The board (2026-09-14, session 5), re-derived from the task files:** **2 of 24 built.**
- ✅ **GAM-019**, `4bb438165` + `15f7bf720`. Session 5 found it had turned `test:main`'s CN-002 red, and fixed the fixture
  in `8af0c943d` (GAM-019 §8).
- 🟢 **GAM-006**, `82a7d3775` + `062dfd9c0`. AC1–AC5, AC7 and AC8 are met. AC6's TPL-005 half is driven, and TPL-006's pin is
  removed (`1cf0a81d2`). **Rocket School's `chStates` is not driven**, so its pins stay with P87 (§8, session 5).
- 🟡 **GAM-012** faults 1–2 committed `bb27086de`. Fault 3, AC6 and the deploy bundle are owed (GAM-012 §8).
- 🟡 **GAM-004**: AC1 measured, D47 does **not** reproduce in the runtime (13 arms). Nothing to build yet.
- 🟡 **GAM-018**: AC1 measured, prediction confirmed and widened. Not built. R2 waits on AC2.
- 🔒 **Ruled, not built:** GAM-001 + GAM-003 (R3), GAM-002 (R4), GAM-005 (R6), GAM-007 (R8), GAM-008 (R9), GAM-009 (R10),
  GAM-010 (R11, after GAM-012).
- ⬜ Everything else is as scoped.

## State of the tree

Session 5 committed everything it touched, in three commits after `b3be201e0`:
`062dfd9c0` (GAM-006, including session 4's uncommitted work), `1cf0a81d2` (TPL-006's pin), `8af0c943d` (CN-002's fixture).
This handoff, the README and GAM-019 §8 are a fourth, docs-only commit.

⚠️ **Session 4 left its work uncommitted "waiting on Richard". Session 5 committed it** under the `cline-dev` rule (commit
as you go, no push), after driving it in a browser. If that was not wanted, `062dfd9c0` is the commit to look at.

The tree still holds peers' uncommitted work that is not P88's: P87/TPL-007 (`templates/rocket-school/`,
`library/modules/game-kit/`, `packages/noodl-mcp/tests/tpl007*`, `scripts/devtools/drive-rkt*`), TPL-008
(`templates/todo-list/`, `tpl008*`), and P78's register and prompt. 🔴 **A TPL-008 session edited P78's register at 18:22**
(D71–D73). Do not pathspec-commit that file without asking.

**Gitignored build output, rebuilt on this machine at 18:29:** `packages/noodl-editor/src/external/{viewer,deploy,ssr}` (all
three carry `states/unreadable-color`; the previous bundles are in session `3599104b…`'s scratchpad,
`gam006/external-before/`) and `packages/nodegx-export/dist`.

## Do, in order

1. **The small owed rows first, because each is a dated line, not a build.**
   - **P78 D49:** a dated line saying GAM-006 is fixed (`062dfd9c0`), TPL-006's pin removed (`1cf0a81d2`), Rocket School's
     pins kept and undriven. ⚠️ The register is held by a live TPL-008 session: coordinate, or leave the line to it.
   - **P78 TPL-003's `test:main` red** (`tests-unit/tpl-003/landing-template.test.ts`, 21 expected, 28 installed). The
     embedded `landing-pages.content.json` grew with TPL-004's commits on 09-11. It is P78's, not P88's: tell P78, or
     register it there. 🔴 Count the artefact; do not just bump the literal.
2. **GAM-018 AC2, the product arms.** Confetti alone in a deployed page, the editor preview and an SSR deploy, then with
   one unguarded kit. Then 🔒 R2 with AC1's and AC2's readings beside it. `extractProjectOverlay` spawns
   `dist/kit-extract.cjs`, so a fix is graded on the bundle.
3. **GAM-004, the browser arm (AC5 moved first).** A copy of TPL-005 with attempt 1 restored for the hit gate, driven
   with real key events. AC6's comment (`tpl005Components.ts:473-477`) is owed either way.
   ⚠️ Read session 5's traps below before building a deploy for it: TPL-005 loses 4 wires in `deploy-from-disk`.
4. **Then the ruled Track A tasks** in README §5 order: GAM-005 (R6), GAM-007 (R8), GAM-009 (R10), GAM-008 (R9, AC1
   first), GAM-002 (R4, AC3 census first), GAM-001/GAM-003 (R3).

## Richard's, not a builder's

- Rulings still askable (README §4): R1, R11, R12, R15, R16, R17, R18, R20.
- The nodegx.io story-engine demo was built with the old runtime and the pin. It is unaffected until he rebuilds it.
- Whether session 5 should have committed session 4's work (above).

## Readings taken in session 5 (2026-09-14, HEAD `b3be201e0` → `8af0c943d`)

Logs are in session `3599104b…`'s scratchpad, `gam006/`. Every row is in GAM-006 §8 (session 5) or GAM-019 §8.

| gate | result |
|---|---|
| Deploy bundle into scratch, session 4's source (hashes checked) | `BUILD_A_EXIT=0`, sha `3f3c8d8f…` |
| Sabotage bundle, arm A (`states.ts` restored by hash) | `BUILD_SAB_EXIT=0`, sha `5c48c19f…` |
| FilterPill, old / new / sab: invalid published frames | 119/120 / 0/120 / 114/120; screen 1 / 27 / 10 colours (⚠️ `.pill` CSS transition) |
| Story/Passage (transitions on), old / new / sab | 40/40 / 0/38 / 38/40 invalid; eyebrow 1 / 19 / 2 colours, text flips in all three |
| TPL-005 banner + board, old / new / sab | 38/38 / 0/38 / 36/38 invalid; board 1 / 19 / 2 colours |
| Rocket School `chStates` | **not reached** in any arm (4 routes, GAM-006 §8) |
| `src/external` rebuilt in place | exit 0, file lists identical, `deploy/noodl.deploy.js` byte-identical to the new arm |
| `nodegx-export` `dist` | exit 0, carries `readColor` |
| `test:main` | **7,498 / 7,500**, `TEST_MAIN_EXIT=1`: CN-002 (GAM-019's, fixed) and TPL-003 (P78's) |
| CN-002 after the fixture fix | 12/12 |
| `template:story` after removing the pin | exit 0, exactly 2 lines moved; `tpl006Template` 61/61 |
| Viewer suite, export suite | **not re-run**; session 4's 110/110 and 101/101 were on the same source bytes (hash-checked) |
| Editor `test:ci` (Electron) | **not run** |

## Owed, small

- GAM-019: the jasmine `dynamic-ports.test.ts` flip (Electron `test:ci`), a Text Input panel look, an MCP bundle rebuild.
- P77's register row **D13** reads owner `NONE`; point it at P80 DEF-028 (GAM-023 §4).
- P78's register rows D41 and D47: a dated line pointing at GAM-018/004 §8 **when their status changes**.
- **For P87, not P88:** Rocket School's 22 `useTransitions: false` pins and `tpl007Template.test.ts`'s D49 gate can go once a
  drive reaches a `Game/Choice`. **For TPL-008:** `tpl008Components.ts` pins it too, with a gate at `tpl008Template.test.ts:190`.
- GAM-006's R7 warning (`states/unreadable-color`) was not observed in a browser. Every colour driven was valid CSS, so
  silence was expected, and no known-firing arm was driven there.

## Traps found in session 5

- 🔴 **Run `deploy-from-disk` from `packages/noodl-editor`.** `getAppPath()` is the working directory when it holds a
  `package.json`; from the repo root the deploy fails `ENOENT` on `<root>/src/external/deploy/index.json`.
- 🔴 **`deploy-from-disk` drops For Each item-port wires (D52), so a click drive through them reads identical arms.**
  Story choices, Rocket School's `Choice row`. Counted: Rocket School 85 of 1,634, landing-pages 11, pixel-game 4,
  story-engine 3. Reach the state another way (write the app Variable, fire a **wired** `to-*` signal) and keep a
  known-firing string beside the colour.
- 🔴 **`setInputValue('currentState', …)` on a States node with no `currentState` wire does nothing**: the input was never
  registered. Fire a wired `to-<state>` (set true, then false).
- 🔴 **`echo "X_$(…)_EXIT=$?"` prints the substitution's status.** Capture `rc=$?` on the next statement.
- ⚠️ **A CSS transition on the element makes the screen reading lie.** `.pill` animated the sabotage arm's end jump
  into 10 in-between colours. Only the published frames separated new from sabotage there.
- ⚠️ In Rocket School's `deploy-from-disk` build, *New player* is a reachable button that does nothing, and writing
  `profileFormOpen` did not bring up a choice either. Candidate (unmeasured): `pfTrue` is an input-less Expression,
  R3's never-ran `null`.
- ⚠️ The shell's working directory moved between calls three times this session. Absolute paths, every time.
- Carried: both `nodegx-export` parity suites load runtime source with their own `require` shim, and a new import owes
  both; zsh reads `echo ===` as `=`-expansion; the viewer's States specs live under `tests/corpus/`;
  `extractProjectOverlay` runs `dist/kit-extract.cjs`.
