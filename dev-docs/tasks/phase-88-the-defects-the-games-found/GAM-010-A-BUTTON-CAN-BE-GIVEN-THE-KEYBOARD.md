# GAM-010 — A Button can be given the keyboard

**Status: ⬜ not started.** **Source:** [P78 D59](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by P87 [RKT-003](../phase-87-the-first-play-test/RKT-003-ONE-SCREEN-PER-QUESTION.md), 2026-09-13 · **Side:** product (viewer controls)

A game says *"press Enter to go on"*, but nothing in the graph can put the keyboard on the Next button. A
person on a keyboard has to Tab to it, or reach for the mouse.

## 1. The person sentence

**When a verdict appears, the author sends Focus to the Next button, and a person on a keyboard presses
Enter and goes on. No script looks the button up by its label.**

## 2. What was measured

HEAD `eb12ebe99`, 2026-09-14.

| reading | where |
|---|---|
| Button declares no `focus` input. Its only focus words are `focusPort: 'label'` (the editor's double-click) and the Click description. Re-read at HEAD | `packages/noodl-viewer-react/src/nodes/controls/button.ts:14-16`, `:50-57` |
| **Family census** (`grep -a -n "focus" nodes/controls/*.ts`): a `focus` signal exists on **Text Input** (Focus and Blur) and on **Group**. **None** on Button, Checkbox, Radio Button, Radio Button Group, Dropdown (`options.ts`, the Select) or Slider. Re-read at HEAD | `text-input.ts:210-231`; `nodes/visual/group.ts:178-189`; `button.ts`, `checkbox.ts`, `radiobutton.ts`, `radiobuttongroup.ts`, `options.ts`, `slider.ts` (0 hits) |
| Every control already has `Focused` / `Blurred` outputs and a `Focused` state, via `addControlEventsAndStates`. This is a known-firing signal for every AC. Re-read at HEAD | `nodes/controls/utils.ts:153-194` |
| Button renders a real `<button>` whose root ref is `noodlRootRef`; there is no `focus()` method on the component. Re-read at HEAD | `components/controls/Button/Button.tsx:112-113` |
| Checkbox, Radio Button and Slider render a real `<input>` and Select a real `<select>` (`opacity: 0`, overlaid), so a focus target exists for each. Re-read at HEAD | `Checkbox.tsx:177`, `RadioButton.tsx:181`, `Slider.tsx:176`, `Select.tsx:127-138`, `:206` |
| Text Input and Group focus through the **viewer's** tracker `context.setNodeFocused`. 🔴 That tracker does not call `_focus()` for a node already in its list (see GAM-012) | `viewer.jsx:348-376` |
| Group's `_focus` only sends its `focused` signal; it does not move DOM focus. Re-read at HEAD | `group.ts:483-488` |
| Workaround `FOCUS_BUTTON_SCRIPT`: `requestAnimationFrame`, then `document.querySelectorAll('button')`, keep visible buttons whose `innerText` equals the word, `.focus()`. Re-read at HEAD | `packages/noodl-mcp/tests/tpl007Components.ts:1232-1240` |
| ⚠️ **The register names one site (`fbFocusNext`); at HEAD there are three:** Feedback banner `fbFocusNext`, Teach card `tcFocus`, Race/Result `rrFocus`. Re-read at HEAD | `tpl007Components.ts:1285` + `:1317-1318`, `:1356`, `:1834` |
| Driven: with the workaround, `focusNext` passed on every verdict in RKT-003 AC5 run 3 (4/4 cells, 20/20 rounds). As recorded 2026-09-13, not re-driven | RKT-003 §5 lines 142-144 |

## 3. Where it bites a person

- Keyboard-only play in every game.
- A form's primary button after validation, and the confirm button of a dialog.
- Accessibility generally: the workaround matches by visible label, so it breaks under translation, when two buttons share a word, or
  when a button's label is an icon.

## 4. Related work and collisions

- **P88 [GAM-012](GAM-012-A-FIELD-FOCUSED-AS-ITS-ROW-APPEARS-HAS-THE-CURSOR.md)** owns the focus tracker's defect. A Button
  Focus routed through `setNodeFocused` would inherit it: round 1 works, and later rounds do nothing until a click. **Build
  GAM-012 first, or route this through the node's own element.**
- **P41 [ACC-001](../phase-41-accessibility/README.md)** (README line 74) owns the *visible* focus ring (`outline: none` on
  Button, Checkbox, RadioButton, Select, Range in `assets/style.css`). A focused Button nobody can see is half this sentence;
  AC2 records whether the ring is visible, and does not fix it here.
- **P41 ACC-004** (line 77) moves focus on route change. Different trigger, same need for a runtime focus path.
- Owner grep: `grep -a -rn -i "focus input\|focus signal\|no focus\|Focus action" dev-docs/tasks --include='*.md'`. No task owns a
  Focus input on a control.

## 5. Design

- **One shared definition.** Add `Focus` (and `Blur`, matching Text Input) in `Utils.addControlEventsAndStates` or beside it,
  so Button, Checkbox, Radio Button, Dropdown and Slider get the same ports, descriptions and ERG-001 outcomes (`Done`) in one place.
- **Target.** Use the control's real focusable element (`<button>`, `<input>`, `<select>`), not the wrapper `div`. Queue the call
  through `withInnerComponent` (`react-component-node.ts:1638-1660`) or its DOM equivalent, so a Focus that arrives in the frame
  the control mounts is not lost.
- 🔒 **Ruling for Richard:** does a control's Focus go through the viewer tracker (so a click elsewhere, or focusing a
  sibling, blurs it the way Text Input is blurred today), or does it call the element's `.focus()` directly and let the
  browser own focus? The tracker is the house's existing path; it is also the path GAM-012 found broken.
> 🔒 **R11, ruled 2026-09-14 (session 2): follow R13.** R13 ([GAM-012 §5](GAM-012-A-FIELD-FOCUSED-AS-ITS-ROW-APPEARS-HAS-THE-CURSOR.md)):
> a Focus to a **mounted** control focuses it every time. A Focus to an **unmounted** one **fails, is not held**, and the builder is
> told in the editor, not the browser. So a Button's Focus obeys the same rule as Text Input's, through the same (corrected)
> path. ⚠️ **This rejects the "Target" bullet's queue through `withInnerComponent`**: a Focus that arrives before mount is not
> kept for later. Build after GAM-012's fix lands, so the family inherits a working tracker.
- **Radio Button Group**: focus the checked radio, or the first. Decide and document; do not leave it undefined.
- **Do not** add `tabIndex` or change tab order in this task.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8.** A spec asserts `button.ts`'s node definition has a `focus` input; it fails. A drive on a minimal project, Button + a Delay → a wire into `focus` (the editor refuses the wire, or the viewer logs `input doesn't exist`), shows `document.activeElement` is not the button while its `Focused` output never fires. Known-firing beside it: the same project's Text Input Focus does fire `Focused`. |
| AC2 | **The person sentence, in a browser.** Rocket School with `fbFocusNext`, `tcFocus` and `rrFocus` replaced by a Focus wire into each button. The keyboard-only drive (`drive-rkt003-stage.js --keys`, CDP Enter with `text: "\r"`) reaches 20/20 rounds with no pointer event, at 1366×768 and 1280×720 × FR/EN. Record whether the focus ring is visible (ACC-001's concern). |
| AC3 | **Repeat focus.** Focus the same Button on five successive verdicts with no click in between; `document.activeElement` is the button every time. This is the GAM-012 shape, applied here. |
| AC4 | **Family.** A spec per control (Button, Checkbox, Radio Button, Dropdown, Slider): Focus moves `document.activeElement` to its real element and fires `Focused`; Blur fires `Blurred`. **Sabotage arm:** point the target at the wrapper `div`, and the Checkbox and Dropdown rows go RED. |
| AC5 | **Blast radius.** The new ports appear in the node catalog and in `get_node_type`. No existing port changes name, type or default across the five nodes; a spec compares the port lists before and after. |
| AC6 | **Workaround.** `FOCUS_BUTTON_SCRIPT` and its three Function nodes are removed from `tpl007Components.ts`, and the template gates still pass. If any one stays, §8 says which and why. |

## 7. Traps

- A focused native `<button>` activates only on a key event carrying `text: "\r"`. A CDP Enter without it looks like "Focus did
  nothing" (RKT-003 AC5 run 1 made exactly this probe mistake).
- Select's real `<select>` is `opacity: 0`. `getClientRects()` still reports it, so a probe that looks for *visible* focus can pass on it.
- iOS Safari does not move focus to a tapped button (RKT-005 §2). Do not write a touch arm that expects it to.
- The export side: a new input on five node types needs a check against `packages/nodegx-export/coverage-ledger.json` (one row per
  type) and the emitter; a Focus the export drops silently is this defect again in the exported app.

## 8. Record

Not started.
