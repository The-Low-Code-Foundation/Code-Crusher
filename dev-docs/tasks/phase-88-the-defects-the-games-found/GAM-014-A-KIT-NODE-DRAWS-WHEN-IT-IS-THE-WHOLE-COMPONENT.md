# GAM-014 — A kit React node draws when it is the whole of a component

**Status: ⬜ not started.** **Source:** [P78 D53](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by TPL-007 (Rocket School) session 1's drive, 2026-09-12 · **Side:** product (MCP door visual-root derivation, or the viewer — AC1 decides which)

A kit author makes a component whose only visual node is their kit's React node, places it on a page, and nothing
draws: no element, no console error. Wrapping the same node in a Group makes it draw.

## 1. The person sentence

**A component whose root is a kit's React node draws wherever it is placed, the same as one whose root is a Group.**

## 2. What was measured

Read at HEAD `eb12ebe99`, 2026-09-14. Nothing was run for this file.

| reading | where |
|---|---|
| `Game/Face`, `Game/Race track` and `Game/Keyboard` each had the kit node (`game-kit.Avatar`, `.RaceTrack`, `.KeyboardMap`) alone at the root. Placed on a page, nothing drew and there were 0 console errors. The kit was registered: `window.__noodl_modules[0].reactNodes` listed all three. A Group root took the drive from 14/17 to 17/17. **As recorded 2026-09-12, not re-read.** | register D53; [TPL-007](../phase-78-the-templates/TPL-007-THE-MATHS-AND-TYPING-GAME.md):379-383 |
| 🔴 **The pre-wrap artefact is gone.** Today `Game/Face/nodes.json` has `visualRoots: ["fcRoot"]` (a Group) with `fcAvatar` inside it. The generator files are untracked, so no commit holds the kit-rooted version. Its `visualRoots` field is the one reading that picks between the candidates below, and it was never recorded. Re-read at HEAD. | `templates/rocket-school/components/Game/Face/nodes.json`; `tpl007Components.ts` `FACE` (576-607) |
| The runtime draws an instance from `componentModel.roots` and returns nothing when that list is empty. Re-read at HEAD. | `noodl-runtime/src/nodes/componentinstance.ts:109-113`, `:322-326` |
| The importer the deploy engine uses carries `visualRoots` into the legacy graph only when it is non-empty. The step that turns the legacy graph into `componentData.roots` was **not read**. Re-read at HEAD. | `noodl-editor/src/editor/src/io/ProjectImporter.ts:254-255`; `noodl-preview/src/loader.ts:26,119` |
| The door derives `visualRoots` at write time. `assembleCreateFiles` calls `resolveVisualRoots` with `isVisualType ?? catalogVisualPredicate`, and an absent result means **no key at all**. Re-read at HEAD. | `noodl-mcp/src/tools/author.ts:221-282`; `noodl-mcp/src/visualRoots.ts:181-194` |
| `projectVisualPredicate` answers from the catalog for a type the catalog has. Any other type is treated as a component legacyName, and a name the project does not have answers `false`. Re-read at HEAD. | `author.ts:196-201`; `visualRoots.ts:145-168`; `catalog.ts:411-413` |
| **A kit type is known to the catalog only through the project overlay.** It is installed when the server binds (`server.ts:131` → `installProjectOverlay`) and merged into the catalog (`catalog.ts:123-160`). The overlay maps `isVisual = category === 'Visual'`, and every React node registers as `'Visual'`. Re-read at HEAD. | `nodegx-kit-catalog/src/index.js:365`; `noodl-viewer-react/src/react-component-node.ts:975-990` |
| 🔴 **So the register's suspect does not follow from source when extraction ran.** With a loaded overlay, the derivation counts `game-kit.Avatar` as visual. The overlay is **empty** when extraction is `unavailable` (the bundle is not built, or it failed) or when the kit's registration failed. The kit type then falls to the component branch and answers `false`. Re-read at HEAD. | `noodl-mcp/src/kitExtract/extract.ts:186-212`; `entry.js:118-150` |
| The Rocket School generator installs modules **before** it binds the server, so the order is right if extraction ran. Re-read at HEAD. | `noodl-mcp/tests/tpl007Template.ts:147`, `:150` |
| The editor re-derives the field on every save, from `allowAsChild`. The node library sets `allowAsChild` for every `'Visual'` node, so **an editor save repairs a missing field** once the kit is loaded. Re-read at HEAD. | `NodeGraphModel.ts:1256-1266`; `noodl-runtime/src/nodelibraryexport.ts:445-449` |

**Two candidates remain, and AC1 separates them:**
- **(A) The door wrote no `visualRoots`**, because the overlay did not know the kit type when the component was written.
- **(B) The door wrote the kit node as a root, and the runtime still draws nothing** for a kit node in that position.

## 3. Where it bites a person

- Every kit author whose visual node is the whole of a component. That is the natural shape for a wrapper: `Game/Face` is
  "an Avatar with a ring rule".
- The component file says `type: "visual"` either way. The page is blank with a clean console.
- Under (A), the same fault can hide an agent-authored page whenever the kit extractor is not built or a kit fails to
  register (D41, [GAM-018](GAM-018-A-KIT-REGISTERS-THE-SAME-WHATEVER-IS-INSTALLED-BESIDE-IT.md)).
- The editor would repair the file on its next save, so the defect is only ever seen in a project the editor has not saved.

## 4. Related work and collisions

- **AWP-001 / F43** (cited in the `visualRoots.ts` header): the derivation itself. An agent's app rendering nothing
  because `visualRoots` was absent is that task's founding defect. This task must not undo its rule that a logic-only
  component gets **no key**.
- **CN-003** ([phase 69](../phase-69-the-node-you-write-yourself/CN-003-THE-PROJECT-CATALOG-OVERLAY.md)) owns the overlay,
  and **CN-015** owns showing its failures. Under (A), CN-003's `unavailable` state is the trigger.
- **[GAM-018](GAM-018-A-KIT-REGISTERS-THE-SAME-WHATEVER-IS-INSTALLED-BESIDE-IT.md)**: an extractor that wrongly fails a kit
  empties the overlay for that kit, which is candidate (A)'s path.
- **[GAM-017](GAM-017-A-KIT-NODE-TAKES-A-SIGNAL-AND-A-SIZE-THE-WAY-A-BUILT-IN-DOES.md)**: the Race Track's wrapper Group also
  carries its size budget, so removing that wrap depends on GAM-017 as well as on this task.
- No task owns a kit type at a component root. Grep run:
  `grep -rnai --include='*.md' "kit.\{0,30\}as .\{0,20\}root\|kit react node as\|visual root.\{0,40\}kit\|kit type.\{0,30\}visual" dev-docs/tasks`
  → only the register row.

## 5. Design

**Measure first (AC1), then take the branch it names.**

- **If (A):** the door decided "not visual" about a type it did not know.
  - (A1) Refuse or warn on a write whose root node's type is neither in the catalog nor a project component. For
    example, the warning could name `unknown-root-type`, together with the overlay's `unavailable` or `failures` reason.
  - (A2) Re-derive at read time when the overlay changes. `readVisualRoots` already derives when the key is absent, but
    only from what the catalog knows then.
  - ⚠️ Treating every unknown namespaced type as visual is **a guess**. A logic kit node at the root would then be
    handed to the runtime as something to draw.
- **If (B):** find why `roots[0].render()` gives nothing for a kit node. For instance, a kit registering after the
  component graph is built. Fix it in the viewer.
- 🔒 **Ruling, only if (A):** when the door cannot tell whether a root type draws, should it refuse the write, warn and
  write no roots, or write the node as a root?
- **Do not** make every unknown type visual to silence this.
- **Do not** "fix" it in the product by inserting a Group. The wrap is the template's workaround, not the design.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **Reproduced RED at HEAD, and the candidate named.** Build a small project with `game-kit` as its only module (not beside the library, D41). It holds `Kit/Face`, whose only node is a root `game-kit.Avatar`, and a Group-rooted control component. Write both through `create_component`, deploy with `nodegx-deploy.cjs` and drive in Chromium: the kit-rooted placement contains no `<img>`, while the Group-rooted one does (the known-firing signal). Record in §8 the component's `nodes.json` `visualRoots` and `get_project_info`'s overlay state (loaded, `unavailable`, `failures`). Repeat with the extractor bundle removed. |
| AC2 | The fix at the layer AC1 named. **Reverted arm:** restore the old line and AC1's exact RED comes back. |
| AC3 | **Person sentence, in a real browser and in the editor:** the kit-rooted component draws on the deployed page, and draws in the editor canvas on a copy of the project that the editor has not saved before the reading. |
| AC4 | The absence rule holds beside a firing signal: a component whose root is a **logic** kit node still gets no `visualRoots` key, in the same run where the visual kit root gets one (or where the refusal fires, under A1). |
| AC5 | **Blast radius:** count every component in `templates/` and `library/prefabs` whose root node is a kit type, with its `visualRoots` before and after. Also count every library module with `reactNodes` whose node the door would now treat differently. |
| AC6 | **Workaround:** remove `Game/Face`'s Group wrap and re-drive; the face draws at every size it is placed. Then say whether `Game/Keyboard`'s wrap can go too, and why `Game/Race track`'s stays until GAM-017 (its Group is the 30vh / 56vw budget). Update the template gate that pins the wraps in the same change. |

## 7. Traps

- 🔴 **Opening the fixture in the editor repairs it.** `getVisualRootIds` rewrites the field on save, and opening a project
  writes files. Take AC1's reading on disk and in the deploy **before** anything opens it, and drive a copy.
- ⚠️ `scripts/devtools/render-from-disk.js:212-216` maps `visualRoots` straight through. The render harness is a different
  path from the deploy importer, so a harness reading is not a deploy reading.
- ⚠️ An overlay that is `unavailable` and a project with no kits both give an empty node list. Read the `unavailable` field,
  not the count.
- ⚠️ A stale `dist/kit-extract.cjs` can make (A) appear or disappear. Record its mtime beside AC1.

## 8. Record

Not started.
