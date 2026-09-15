# Phase 88 — next session

**Read first:** [`README.md`](README.md) §3 (what scoping corrected), §4 (rulings) and §7 (rules). Then read the whole task
you pick, including its §8.

**The board (2026-09-14, session 11), re-derived from the 25 task files' status lines:** **9 of 25 built.**
- ✅ **GAM-019**, `4bb438165` + `15f7bf720` (+ CN-002's fixture, `8af0c943d`).
- 🟢 **GAM-006** `062dfd9c0`, **GAM-005** `44b3a9add`, **GAM-007** `d57a11668`, **GAM-008** `5da1c9fd6`, **GAM-009** `bdf1d3b19`: committed. Their
  remainders are in each §8 and on the README board.
- 🟢 **GAM-002**, session 11, **uncommitted.** R4 as option A, plus a lexer in place of the regex (no parser ships in the
  runtime). `String(n)`, `Number(s)`, `JSON.stringify(o)`, `parseInt`, `Date.now()` and `typeof n` work, and a method name
  after `)` is no longer a port. Census: 386 Expressions and 517 wires, and **0 wires lose a port**, so no migration.
  **Left:** AC4 (the editor, driven), the cloud runtime, the bundles, and AC6 on Rocket School (the peer's files).
- 🟢 **GAM-001**, session 11, **uncommitted.** R3's B: an Expression evaluates at load over unset inputs, and a ticked
  `Evaluate At Load` checkbox turns that off. A throw, a compile failure or a `NaN` over unset inputs leaves it abstaining.
  The census lists 14 first-frame visibility changes by name. **Left:** AC4 and AC6 on Rocket School, and rendering the
  corpus both ways.
- 🟢 **GAM-003**, session 11, **uncommitted.** A `null` or `NaN` size, bare or merged, clears silently; `"tall"` is still
  refused. FLD-004's `NaN` row was changed as ruled. **Left:** AC5 in a browser, and AC7 on Rocket School.
- 🟡 **GAM-012** (fault 3, AC6), **GAM-018** (🔒 R2), **GAM-004** (🔒 close as disproved?).
- ⬜ **16 not started.** Of those, **GAM-021** and **GAM-022** need no ruling. GAM-010 (R11) waits on GAM-012's fault 3.
  GAM-025 needs its call-site sweep first. GAM-013, 011, 015, 016, 017, 020 and 023 wait on rulings. GAM-014 and GAM-024
  wait on measurements.

**The ratchet:** sessions 7 to 11 each built. Keep building.

## Do, in order

1. **GAM-021** (no ruling): stop warning `page-cannot-scroll` about the scroll setting the same plan applies. §5 has the
   design: one resolver used by both the check and `writeProjectSettings`. 🔴 Rocket School's gate pins the pair
   `['page-cannot-scroll', 'uncollapsible-multi-column']` (`tpl007Template.test.ts:108-118`), and that file is the TPL-007 peer's.
2. **GAM-022** (no ruling unless the read finds one): Arm B judges the `For Each` item's root, not the container. Read the
   three calibration grids' item roots **first** (§5). It shares that pinned pair with GAM-021, so whichever lands second
   writes the final pin.
3. **Remainders, only between builds:**
   - GAM-002 AC4: rebuild the `src/external` viewer bundle, type `String(n)` into an Expression in the editor, and read the
     port panel and the preview, with a console listener attached first.
   - GAM-001 AC5: render the corpus both ways. The 14 changes are named in its §8.
   - GAM-003 AC5: a browser page with a meter whose input arrives on a press, and a console listener attached before navigation.
   - GAM-005, GAM-007, GAM-008, GAM-009: their browser and Rocket School halves (see each §8).
4. **GAM-018, only once R2 is ruled.** GAM-024 waits on it.

## Richard's, not a builder's

- **Commit session 11?** Three tasks, and they share files (below). One commit per task needs the hunk split recorded in
  memory: build the earlier task's version of each shared file, `git hash-object -w` + `git update-index --cacheinfo`, and
  commit from the index **without** a pathspec.
- 🔒 **From GAM-001 (a decision inside R3, worth confirming):** a load-time evaluation that yields `NaN` is treated as no
  answer, so `a + b` over unset inputs does not raise `node/nan-input` downstream. Session 1 set that as a condition.
  And a compile failure is still reported only when an input arrives, as before.
- 🔒 **From GAM-001's census:** `def036-dash-drive`'s `label != ""`-style guards now show an empty Text or Icon where a page
  does not set the port. That is the ruling working as asked, and it is the change most likely to be noticed.
- 🔒 **From GAM-003:** FLD-004's *"keeps it for NaN"* row was split. `Infinity` still keeps; `NaN` now clears silently, per R3.
- 🔒 **Found by GAM-002's census:** two published catalog examples (`cloud-who-is-in-this-role`,
  `fn-cloud-function-roundtrip`) used `Number(…)` and threw at HEAD. They work now and were not edited.
- 🔒 **`catalog:examples` is red at HEAD**, independent of P88. `agent-sse-chat-stream` and `agent-store-shared-state` wire
  Text Input's `text` output, which the catalog does not have (last touched by AIX-005).
- Still open from earlier sessions: `library/prefabs/form-fields/project/project.json` (re-export or revert?); a jump not
  firing At Target Value (GAM-008); an absorbed focused `Set` deciding what a remount shows (GAM-009); R2 (GAM-018);
  GAM-004's close; rulings R1, R11 (built as R13 follows), R12, R15, R16, R17, R18, R20.

## State of the tree (session 11, uncommitted)

**GAM-002:**
- New:
  - `packages/noodl-runtime/src/nodes/std-library/expression-ports.ts`
  - `packages/nodegx-export/src/analyze/expression-ports.ts` (a **byte-identical** copy)
  - `packages/noodl-runtime/test/gam-002-string-and-number-in-an-expression.test.ts`
  - `packages/nodegx-export/tests/gam-002-expression-ports-parity.test.ts`
- Changed:
  - `nodegx-export/src/analyze/jsfun.ts`
  - `nodegx-export/tests/{jsfun,stores-events,hls001-corpus-identity}.test.ts` (two pins of the old junk `length` port, and the golden's header note)
  - `nodegx-export/tests/goldens/hls001-corpus.sha256.json` (1 line, `cheer/src/pages/Home.tsx`)

**GAM-001:**
- New: `packages/noodl-viewer-react/tests/gam-001-an-optional-port-left-unset-shows-the-part.test.ts`

**GAM-003:**
- New: `packages/noodl-viewer-react/tests/gam-003-a-meter-computed-by-an-expression.test.ts`
- Changed:
  - `packages/noodl-viewer-react/src/react-component-node.ts` (`isEmptyMagnitude`)
  - `packages/noodl-viewer-react/tests/fld-004-units-port-abstains.test.ts` (the `NaN` row)

**Shared by GAM-002 and GAM-001:**
- `packages/noodl-runtime/src/nodes/std-library/expression.ts`. GAM-002's hunks are the import, `registerInputIfNeeded`'s
  guard, the `expression` description and setter, and `updatePorts`. GAM-001's are `evaluateAtLoad`,
  `_scheduleLoadEvaluation`, the callback, `_argumentsForEvaluation`, `_evaluateOverUnsetInputs` and `NOT_EVALUATED`.
- `docs/node-catalog/enrichment/expression.json`. GAM-002 owns the `expression` port text and two `antiPatterns`; GAM-001
  owns the `runtimeBehavior` sentence.
- `packages/noodl-types/src/node-catalog{,-enriched}.json` (the Expression entry only) and
  `docs-site/docs/nodes/custom-code/expression.md`: both regenerated.

**Docs:**
- the three task files and this phase's README and handoff;
- D54, D55 and D62's rows and dated paragraphs in the P78 register. ⚠️ Stage the register hunk by hunk: the TPL-007 peer has
  P78 files open too.

**Scratch** (`11f00cd7…/scratchpad/`):
- `gam002/`: census, sabotage script, catalog diff and logs.
- `gam001/`: census, sabotage script, gate logs.
- `gam003/`: the failing run at HEAD.

**Bundles:** none rebuilt. The editor preview, deploys and the installed MCP app still carry the old Expression and units setter.

⚠️ **Peers are live** in `templates/rocket-school` (a Monster game), `packages/noodl-mcp/tests/tpl007*`,
`scripts/devtools/drive-tpl007-monster.js`, and P78's `NEXT-SESSION-PROMPT.md` and `TPL-007-…md`.

## Readings taken in session 11 (2026-09-14, HEAD `5df2a01a6`)

| gate | result |
|---|---|
| GAM-002 spec at HEAD / after | 17 failed + 2 passed / **21/21**; arms S1 **8**, S2 **2**, S3 **6**, S4 **1** |
| GAM-001 spec at HEAD | 3 failed + 4 passed; after **10/10**; arms G1 **2**, G2 **1**, G3 **1**, G4 **2** (1 predicted; the second is explained in GAM-001 §8) |
| GAM-003 spec at HEAD | 3 failed + 3 passed; after **6/6**; arm G5 **4** |
| NDA-004 + GAM-002 (runtime) | **32/32** |
| GAM-002 census (`SAME=1` arm) | 386 / 517; 0 wires lose a port (0) |
| GAM-001 census (`SAME=1` arm) | 460 wires out; 14 changes on unset-capable sources (0) |
| catalog generate + merge | only the Expression entry differs from HEAD, both times; `docs:nodes` changed 1 page |
| `catalog:check`, `catalog:merge:check`, `docs:nodes:check` | exit 0 |
| whole `noodl-runtime` | **162 suites, 2,759 passed, 13 skipped**, exit 0 |
| whole `noodl-viewer-react` | **114 suites, 1,496 passed, 1 todo**, exit 0 |
| whole `nodegx-export` | first run 3 red (GAM-002's pins); HEAD `jsfun.ts` 70/70; final run **102 suites, 3,510 passed, 1 skipped**, exit 0 |
| editor `test:main` | **458 suites, 7,522 / 7,522**, exit 0 (log mtime 23:00, this run) |
| noodl-mcp suites, Electron `test:ci`, bundles, cloud runtime | not run |

## Traps found in session 11

- 🔴 **A parameter naming an input an Expression lacks becomes a dynamic input port**, and its arrival runs the expression.
  A spec that sets a not-yet-built checkbox reads an evaluation at HEAD for that reason alone.
- 🔴 **A computed `NaN` reaches a units setter bare.** `setInputValue`'s `isNaN` test does not merge it into the unit. Only
  the first update's queue wraps it as `{value: NaN}`.
- 🔴 **The first update's queue replaces a queued `null` seed** with a value produced in the same update, before the
  consumer drains. That is why an Expression fed at creation never raised `not-a-dimension`.
- 🔴 **`nodegx-export` pins the old Expression scan in three places:** `jsfun.test.ts`, `stores-events.test.ts`'s
  `GOLDEN_HOME`, and HLS-001's `cheer` hash. A scan change owes all three, with HEAD's `jsfun.ts` put back to prove attribution.
- 🔴 **A census whose "before" assumes nothing arrives at build overcounts** (52 against 14). Filter to inputs that can
  really be unset.
- 🔴 **Port order is text order.** In `` `${ {k: a}.k }` `` the key comes first.
- 🔴 **Parallel Bash calls share one working directory** (again): a `cd` in a jest call broke two reads' relative paths.
