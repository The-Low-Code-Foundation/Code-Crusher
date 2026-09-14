# GAM-018 — A kit registers the same whatever is installed beside it, and a kit that cannot register says so

**Status: ⬜ not started.** **Source:** [P78 D41](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by [TPL-005](../phase-78-the-templates/TPL-005-THE-PIXEL-GAME.md) (the pixel game), 2026-09-11 · **Side:** product (MCP kit extractor / library modules / kit failure surfaces)

TPL-005 wanted `nodegx-confetti` for the end of a run and could not have it. The kit extractor fails confetti on its
own, and registers it cleanly when all 32 modules sit beside it. A template is a two-module project, which is the arm
where it fails.

## 1. The person sentence

**Whether a kit's nodes are available does not depend on which other kits are installed. When a kit's nodes are not
available, the person is told which kit and why.**

## 2. What was measured

Read at HEAD `eb12ebe99`, 2026-09-14. Nothing was run for this file.

| reading | where |
|---|---|
| Four arms through `extractProjectOverlay`: A keyboard-shortcuts alone registers 1; B confetti alone registers **0**, with `registration failed: Cannot convert object to primitive value`; C both registers 1, confetti failing the same way; D all 32 registers 37 from 24 kits, failing `noodl-chartjs`, `noodl-lottie` and `simple-tooltips` but **not** confetti. **As recorded 2026-09-11, not re-read.** | register D41 table |
| **The extractor's `Noodl` is a catch-all.** A `Proxy` whose `get` returns the real member if one exists, and otherwise a recursive no-op **function** Proxy. It has no `set` trap, so an assignment `Noodl.defineNode = …` lands on the target and wins from then on. Re-read at HEAD. | `noodl-mcp/src/kitExtract/entry.js:88-93`; also `scripts/node-catalog/dom-shim.js:42-45` |
| **Confetti's two guards.** Its SDK shim returns early when `typeof Noodl.defineNode === "function"` (`:903`; the minified body is `:904`). Its node block returns when `typeof Noodl.defineNode !== 'function'` (`:918`), otherwise calls `Noodl.defineNode({...})` (`:976`) and passes the result to `Noodl.defineModule({ nodes: [confettiNode] })` (`:1015`). Re-read at HEAD. | `library/modules/confetti/project/noodl_modules/nodegx-confetti/index.js` |
| 🔴 **The reading, from source, not run.** Under the extractor, `typeof Noodl.defineNode` is `'function'`: it is the no-op Proxy. So the shim skips installing the real one, `defineNode({...})` returns the Proxy, and `registerModule` is handed a Proxy as a node. Turning that Proxy into a string throws exactly arm B's message. It is the **same message, from the same kind of Proxy**, that CN-016 found in `verify-dist`'s harness. | as above; [CN-016](../phase-69-the-node-you-write-yourself/CN-016-PUBLISH-A-KIT.md) ("fell through to the catch-all noop `Proxy`") |
| **Co-tenancy explains arm D.** By a grep for the assignment with no preceding guard, **13 shipped modules assign `Noodl.defineNode=` unconditionally** (inside their minified SDK), for example `custom-html-module`, `data-context`, `geospatial-analysis` and `i18next-noodl`. **10 assign it behind the same guard as confetti.** Four of the unguarded ones sort before `nodegx-confetti`. If one of them is scanned first, it installs a real `defineNode` on the Proxy's target, and confetti then registers. Re-read at HEAD; the classification is a grep, not an execution. | per-module grep over `library/modules/*/project/noodl_modules/*/index.js` |
| Scan order is `fs.promises.readdir`'s, passed through `moduleDirectories`. Whether that sorts was **not read**. Re-read at HEAD. | `nodegx-module-inject/src/index.js:179-203` |
| 🔴 **The real pages give `Noodl` no `defineNode`.** The browser viewer, the deploy page and the SSR server each define `Noodl` as a plain object with `defineModule`. So confetti alone, in a browser or in SSR, sees `undefined`, installs its shim and should register. **This points at the extractor arm, and specifically at its catch-all `Noodl` lying to a feature test.** It is not a generally under-built DOM. Not run: AC2 measures it. | `noodl-viewer-react/static/viewer/index.html:93-94`; `static/deploy/index.js:2-3`; `static/ssr/runtime-globals.js:34-35` |
| **The three arm-D failures are a different shape**, and do read as a thin DOM or React environment: `dom-shim`'s `getContext` returns `null` (lottie's `fillStyle` on null), there is no `ReactCurrentOwner` (chartjs), and there is no style target (simple-tooltips). **As recorded, not re-run.** | `dom-shim.js:12-21`; register D41 |
| **Where a failure reaches a person today.** The extractor's `failures` go into `get_project_info`, and the editor's Settings → Kits names the kit (CN-015 ✅). The editor's route **skips the zero-node check** while a kit is "not loaded yet". A kit whose own guard returns silently, as confetti's `:918` would in a page without the shim, throws nothing, so neither surface names it. Re-read at HEAD. | `noodl-mcp/src/tools/read.ts:105-106`; [CN-015](../phase-69-the-node-you-write-yourself/CN-015-FAILURES-NAME-THE-KIT.md):151-157 |

## 3. Where it bites a person

- They install a kit, and its node is missing from the picker, or an agent is told the type is unknown.
- It depends on what else is installed, so "does this kit work?" has no answer.
- A false failure also empties the overlay the door validates against and derives visual roots from
  ([GAM-014](GAM-014-A-KIT-NODE-DRAWS-WHEN-IT-IS-THE-WHOLE-COMPONENT.md) candidate A). A kit that works in the browser can
  still make an agent's page render blank.

## 4. Related work and collisions

- **Phase 69 [CN-015](../phase-69-the-node-you-write-yourself/CN-015-FAILURES-NAME-THE-KIT.md) ✅:** names a kit that
  **throws**. It does not cover a kit that registers zero nodes without throwing, and it leaves the blast-radius question
  to RULINGS-OPEN-QUEUE #14. This task builds the zero-node half and must not reopen #14.
- **Phase 69 CN-015 premise census** (`notes/cn-015-premise-census.md`): 5 modules were left unmeasured because they need a
  browser, and the census *"lied twice"* about the environment. The same trap applies here.
- **Phase 69 CN-003 / CN-016 / CN-017:** CN-003 is the extractor and its `dom-shim` precedent. CN-016 is the same Proxy
  coercion in another harness. CN-017 records React as a recursive no-op in a sandbox.
- **[P88 README](README.md) R2** is this task's ruling.
- Grep run:
  `grep -rnai --include='*.md' "dom-shim\|typeof Noodl.defineNode\|recursive noop\|noop proxy\|co-tenan\|nodegx-confetti\|Cannot convert object to primitive" dev-docs/tasks`.

## 5. Design

🔒 **R2, for Richard, once AC1 and AC2 are recorded:** when a kit registers in one environment and fails in another,
which is the bug? The source reading says the extractor's `Noodl` Proxy. The product pages would agree only if AC2
shows confetti registering alone in a browser.

- **(1) Shape the extractor's `Noodl` like the page:** a plain object with the members the viewer defines, and nothing
  else. A kit that only ever "worked" because the no-op answered for a missing member now fails in the extractor
  exactly as it would in a browser, which is honest. AC5's census shows who moves.
- **(2) Keep the Proxy, and answer `undefined`** for the SDK names (`defineNode`, `defineReactNode`,
  `defineCollectionNode`, `defineModelNode`). Narrower, and a third feature test would still be lied to.
- **(3) Change confetti's guard.** This is the wrong layer if the browser already works, and 10 shipped modules share
  the guard.
- **The visible half:** a kit whose script runs and registers **zero** nodes is named in `get_project_info` and in
  Settings → Kits (for example: "ran, registered no nodes"), and is kept apart from "not loaded yet".
- ⚠️ **In the browser, co-tenancy is real too:** 13 modules overwrite the page's `Noodl.defineNode`. If two of them carry
  different SDK copies, the last one wins. AC2's two-kit arm reads that.
- **Do not** make the extractor swallow more (from the register). A kit that cannot register is what a person needs told.
- **Do not** special-case confetti.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **Reproduced RED at HEAD, with the prediction tested.** Re-run arms A to D, plus B′ (confetti + `custom-html-module`, unguarded) and B″ (confetti + `nodegx-clipboard`, guarded). The source reading predicts B′ registers and B″ fails. Record each `failures` message verbatim and each project's `readdir` order. keyboard-shortcuts registering in every arm is the known-firing control. |
| AC2 | **The product arms.** Confetti alone, in a small project: in the deployed page, `window.__noodl_modules` holds its node and Celebrate draws a canvas. In the editor preview, the node is in the picker. In an SSR deploy, its module registers. Repeat for confetti + one unguarded module. Record in §8 whether the product works where the extractor fails. |
| AC3 | R2 recorded in Richard's words, beside the AC1 and AC2 readings. |
| AC4 | The fix at the ruled layer. **Reverted arm:** restore the old `Noodl` (or guard), and arm B's exact message returns while B′ stays green. |
| AC5 | **Blast radius:** every library module with a `main`, extracted **alone** in a two-module project before and after. Record its node count and failures, and compare with a browser count for any module whose extractor answer changes. |
| AC6 | **Visible:** a fixture kit whose script runs and registers zero nodes is named with its reason in `get_project_info` and in Settings → Kits, beside a kit that registered in the same project (the known-firing signal). **Reverted arm** included. |
| AC7 | **Workaround:** TPL-005 went without confetti. Show confetti alone registering through the door in a pixel-game-sized project, and say whether TPL-005 should now take it (not required by this task). |

## 7. Traps

- 🔴 **Arm D is the misleading control.** It is green because of what else is installed, so do not calibrate a fix
  against it.
- 🔴 **A drive of the editor's preview is not the extractor**, and neither is SSR. Record which of the four environments
  each reading came from.
- ⚠️ `readdir` order is not guaranteed across filesystems. An arm that passes on one machine can fail on another; sort
  explicitly or record the order.
- ⚠️ CN-015's census needed `window.React` before healthy modules read healthy. An environment change here can move other
  kits in both directions, which is why AC5 is per module.

## 8. Record

Not started.
