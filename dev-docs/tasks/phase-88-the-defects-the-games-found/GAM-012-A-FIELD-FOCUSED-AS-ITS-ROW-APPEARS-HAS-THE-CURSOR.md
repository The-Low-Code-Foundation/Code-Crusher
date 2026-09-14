# GAM-012 — A field focused as its row appears has the cursor, every time

**Status: ⬜ not started.** **Source:** [P78 D68](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by P87 [RKT-003](../phase-87-the-first-play-test/RKT-003-ONE-SCREEN-PER-QUESTION.md) AC5 run 2, 2026-09-13 · **Side:** product (viewer focus tracker)

A child playing with the keyboard answers the first question and presses Enter twice. The second question arrives with no
cursor in the box. The author did send Focus. It worked once and never again.

## 1. The person sentence

**Each time a question's answer box appears and the author sends it Focus, a person on a keyboard can type
straight away, on the first question and the fiftieth, without touching the mouse.**

## 2. What was measured

HEAD `eb12ebe99`, 2026-09-14.

| reading | where |
|---|---|
| Driven, keyboard-only arm, build 4, 1366×768 and 1280×720 × FR/EN: 20/20 rounds graded, **`focusIn` failed in 13/13 typed rounds after the first**. Round 1 passed. The Text Input's Focus was sent on its row's `didMount`, and the row remounted after each verdict. As recorded 2026-09-13, not re-driven | RKT-003 §5 lines 137-141; clause `scripts/devtools/drive-rkt003-stage.js:29`, `:475` |
| With a Function focusing the rendered `<input>` on the next animation frame (build 5): `focusIn` passed on 17 typed rounds, including the 13 after a verdict. As recorded 2026-09-13 | RKT-003 §5 lines 142-144 |
| **No pointer event in any round of either run.** The failure appeared only in the keyboard-only arm, and the mouse arms never reported it. As recorded | RKT-003 §5 lines 142, 145 |
| Text Input's Focus calls `this.context.setNodeFocused(this, true)`, then reports `Done` unconditionally. Re-read at HEAD | `packages/noodl-viewer-react/src/nodes/controls/text-input.ts:210-220` |
| 🔴 **Candidate 1, read from source, not isolated.** `setNodeFocused` calls `node._focus()` **only if the node is not already in `focusedNoodlNodes`**, then pushes it. Nothing removes a node on unmount. So a second Focus to the same node instance is a silent no-op. Re-read at HEAD | `viewer.jsx:348-358`; `react-component-node.ts:747-757` (`componentWillUnmount` does not touch the list) |
| The list is rebuilt only by `onClickCapture`, on a **click**: it walks the clicked element's ancestors for nodes with `_focus` and replaces the list. So in a mouse session any click clears the stale entry, which fits the mouse arms never showing it. Re-read at HEAD | `viewer.jsx:378-395` |
| 🔴 The Blur branch reads inverted: `if (index !== -1) return;`. A Blur on a tracked node does nothing; a Blur on an untracked node calls `_blur()`, then `splice(-1, 1)` removes the list's **last** entry, another node. Read from source at HEAD, not driven | `viewer.jsx:359-375` |
| **Candidate 2.** Text Input's `_focus` returns silently when `innerReactComponentRef` is null; it does not use the queue that exists for exactly this. Re-read at HEAD | `text-input.ts:327-330`; `withInnerComponent` at `react-component-node.ts:1638-1660`, flushed by the ref callback at `:779-783` |
| Against candidate 2: the signal was on the **row's** `didMount`, sent from the wrapper's `componentDidMount`. React commits a child's refs and `componentDidMount` before its parent's, so the field's ref should exist by then. That is an inference, not measured | `react-component-node.ts:736-743` |
| The React field's `focus()` is `this.ref.current && this.ref.current.focus()`. Re-read at HEAD | `components/controls/TextInput/TextInput.tsx:266-268` |
| Group's Focus uses the same tracker. Group's `_focus` only sends its `focused` signal. Re-read at HEAD | `nodes/visual/group.ts:178-189`, `:483-488` |
| No spec covers the tracker: the ERG-001 corpus harness **stubs** `setNodeFocused` to a no-op. Re-read at HEAD | `tests/corpus/erg-001-visual-outcomes.test.ts:86-89` |
| At HEAD the question box has **no Text Input** (RKT-005 replaced it with `game-kit.AnswerPad`). Its workaround `qbFocusBox` runs `FOCUS_ANSWER_SCRIPT` on `qbTyped.didMount`, which calls `document.querySelector('.rkt-answer input').focus()` inside `requestAnimationFrame`. Re-read at HEAD | `packages/noodl-mcp/tests/tpl007Components.ts:975-981`, `:1012`, `:1048-1050` |

## 3. Where it bites a person

- Every keyboard-only flow that shows a field again: a quiz, a chat box that clears and refocuses after Send, a search field on a
  panel that reopens, a wizard step revisited.
- It is silent. Focus reports `Done` (`text-input.ts:218`) whether or not anything moved.
- It reads like a timing bug, so authors reach for next-frame scripts. Rocket School now has four of them (this one and GAM-010's three).

## 4. Related work and collisions

- **P88 [GAM-010](GAM-010-A-BUTTON-CAN-BE-GIVEN-THE-KEYBOARD.md)**: a Button Focus through the same tracker would inherit this.
  **This task comes first.**
- **P14 PLAT-003** ([notes](../phase-14-editor-platform-health/PLAT-003-NOTES.md) lines 360, 1760) typed `setNodeFocused` and the
  click handler; it did not change their behaviour. Not an owner.
- **P41 [ACC-004](../phase-41-accessibility/README.md)** (line 77) will move focus on route change. If it uses the tracker, it
  meets this defect on the second navigation.
- The deprecated `nodes-deprecated/controls/text-input.tsx:353-366` calls the same tracker.
- Owner grep: `grep -a -rn "setNodeFocused\|focusedNoodlNodes\|onClickCapture" dev-docs --include='*.md'` (PLAT-003 only), plus
  `grep -a -rn -i "focus signal\|Focus action" dev-docs/tasks`. No owner.

## 5. Design

**Isolate first; no fix is chosen until AC1 names the cause.** The candidates, each with the measurement that separates it:

1. **Stale tracker entry** (candidate 1). Measure: log `focusedNoodlNodes.includes(node)` and whether `_focus` ran, per Focus.
   Discriminator: a click anywhere between rounds should cure it; if so, this is the cause.
2. **No element yet** (candidate 2). Measure: `!!node.innerReactComponentRef` at the moment `_focus` runs.
3. **Focus stolen afterwards.** Measure: a `focusin`/`focusout` log on `document` for the round, naming each target, including
   the Next button the verdict focused and whether unmounting a focused element sent focus to `body`.
4. **Signal ordering.** Measure: the order of the row's `didMount`, the field's `componentDidMount`, and the Focus input's
   `valueChangedToTrue`.

Likely fix shapes, to be chosen by AC1's result: the tracker checks `document.activeElement` rather than its own list (or drops a
node on `willUnmount`), and its Blur branch is corrected. `_focus` goes through `withInnerComponent` so a Focus before mount is held.
🔒 **Ruling, only if candidate 1 is confirmed:** should the tracker exist at all, now that the browser tracks focus? Removing it
changes the click-blurs-other-nodes behaviour Group's `Focus Lost` relies on.
**Do not** "fix" this with a next-frame delay inside the runtime. That is the workaround, moved.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, and the cause named, recorded in §8.** A minimal project, no template: a Text Input inside a Group toggled by `Mounted`, Focus wired from the Group's `didMount`, a Button that toggles it, driven keyboard-only (CDP Enter with `text: "\r"`) for five cycles. Expect `activeElement` to be the input on cycle 1 only. Beside it, the four §5 measurements, and a **control arm** with one click on `body` between cycles. The cause is the candidate the measurements confirm, not the one that fits. |
| AC2 | **The person sentence, in a browser.** The same project passes all five cycles, keyboard only; and the mouse arm still passes. |
| AC3 | **Sabotage arm.** Revert the fix; AC2's cycle 2 goes RED. |
| AC4 | **A tracker spec that does not stub it.** Focus A, Focus A again after a remount, Focus B, Blur B, each asserting `activeElement` and the list. If the Blur inversion is confirmed, it gets its own row and its own sabotage arm. |
| AC5 | **Blast radius.** List every wire into `focus`/`blur` on Text Input and Group in shipped `library/` and `templates/`, and every `Focus Lost` consumer on Group. Record per wire what repeated Focus does before and after. Group's click-driven `focused`/`focusLost` rows must be unchanged. |
| AC6 | **Workaround.** At HEAD Rocket School's box is the kit pad, which has no Focus input, so `qbFocusBox` cannot become a wire. Record that. Then check the keyboard-only drive (`drive-rkt003-stage.js --keys`) still passes 4/4 cells. Remove any Text Input Focus workaround the template still carries, if one exists; §8 lists what was searched. |

## 7. Traps

- A drive with **any** pointer event rebuilds the tracker's list and hides candidate 1. The drive must assert zero pointer events.
- A CDP Enter without `text: "\r"` does not activate a focused native button (RKT-003 AC5 run 1). A stalled round then looks
  like a focus failure.
- `jsdom` does not run React's commit order the way a browser does for refs and `componentDidMount`. Candidate 2's measurement
  belongs in the browser.
- Focus reports `Done` before anything moved. An AC that reads the outcome grades nothing; read `document.activeElement`.

## 8. Record

Not started.
