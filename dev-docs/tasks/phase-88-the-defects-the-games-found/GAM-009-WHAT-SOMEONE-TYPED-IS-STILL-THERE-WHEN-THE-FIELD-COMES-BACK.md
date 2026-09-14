# GAM-009 — What someone typed is still there when the field comes back

**Status: ⬜ not started.** **Source:** [P78 D61](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by P87 [RKT-006](../phase-87-the-first-play-test/RKT-006-RESTART-FROM-INSIDE-THE-RACE.md), 2026-09-13 · **Side:** product (viewer controls, Text Input)

A child types player two's name, starts a race, taps *Change the race*, and the name box is empty. Any
Text Input that unmounts and mounts again (a `Mounted` toggle, a tab, a wizard step) comes back showing its Value input.
It does not show what the person typed.

## 1. The person sentence

**Someone types into a field, the field is hidden and shown again, and what they typed is still in it,
without the author wiring anything to keep it.**

## 2. What was measured

HEAD `eb12ebe99`, 2026-09-14.

| reading | where |
|---|---|
| Driven: `nameBox ""` in 4 of 4 cells after *Change the race*, build 2. As recorded 2026-09-13, not re-driven | `scripts/devtools/drive-rkt006-restart.js:190`, `:208`, `:487` (`choicesKept`) |
| The React field's **state** is seeded from `props.startValue` in its constructor. Re-read at HEAD | `components/controls/TextInput/TextInput.tsx:66-70` |
| On mount the field calls `this.setText(this.props.startValue)`. Re-read at HEAD | `TextInput.tsx:88-93` |
| Typing runs `onChange → setText(value)`. That writes React state and calls `props.onTextChanged`, and **never** writes the node's `props.startValue`. Re-read at HEAD | `TextInput.tsx:80-86`, `:261-264` |
| The only writers of the node's `props.startValue` are the node's `setText` and `clear`. Re-read at HEAD | `nodes/controls/text-input.ts:372-373`, `:348` |
| ⚠️ **The register's citation `text-input.ts:372-373` is the *writer*, not the mount.** The mechanism holds at HEAD; the mount lives in `TextInput.tsx:69` and `:92` | this row |
| 🔴 **The remount also re-emits Start Value on the Value output.** `componentDidMount → setText → props.onTextChanged`. The output handler writes `outputPropValues` and flags it dirty with no equality check, then `onChange` sends `Value Changed`. Read from source at HEAD, **not driven** | `TextInput.tsx:85`, `react-component-node.ts:562-566`, `text-input.ts:285-287` |
| ⚠️ The register says *"the `Text` output still holds the name"* after the remount. The source reading above says a remount overwrites it with Start Value. **The two disagree, and AC1 has to measure which is true** | P78 D61 vs. this table |
| `startValue.set` returns early when the value equals `_internal.text`. So an author who re-sends the same Value after a person typed over it changes nothing. Re-read at HEAD | `text-input.ts:184` |
| ERG-001 §4 contract: `Set` abstains while the field has focus and reports `Unchanged`, and it still writes `props.startValue` on every path. Re-read at HEAD | `text-input.ts:146-155`, `:364-391`; pinned by `tests/corpus/erg-001-visual-outcomes.test.ts:379-425` |
| Template workaround `Race/Setup#rsNameKeep`, a Variable: `rsNameB.onTextChanged → rsNameKeep.value → rsNameB.startValue`. Re-read at HEAD | `packages/noodl-mcp/tests/tpl007Components.ts:1605`, `:1648-1649` |

## 3. Where it bites a person

- Every form split across steps or tabs: Site Builder forms, checkout, onboarding.
- Any field inside a collapsible section, and any Text Input under a `Mounted` toggle.
- The workaround needs a Variable and a feedback wire. Nothing teaches it, and a feedback wire on a
  Text Input is exactly the loop shape P77 D31 found.

## 4. Related work and collisions

- **P77 [D33](../phase-77-the-site-builder-rescue/DEFECTS-THE-SITE-BUILDER-FOUND.md) (line 1692), adjacent, not the same defect.**
  Its *"plausible benign reading"* (line 1706-1707) is that `startValue` does not emit `onTextChanged`.
  🔴 At HEAD, from source, **it does**: when mounted and unfocused through `TextInput.setText` (`TextInput.tsx:85`), and when unmounted
  through the node's own flag (`text-input.ts:381-388`). D33 is about a write loop through that route; D61 is about what a
  remount shows. This task must not make D33's six writes worse, so its census is part of AC5's population.
- **P77 D31/D32** (line 1673) traced a real cycle through `bodyField.startValue → bodyField.onTextChanged`. A fix that makes
  typing write back must add no emission, or it changes that trace.
- **ERG-001 §4** ([phase-35](../phase-35-authoring-ergonomics/ERG-001-OUTCOME-CONTRACT.md) §4, the sweep that put the
  focused-`Set` rule into `text-input.ts`). The fix must not break it.
- **P88 GAM-011** adds an insert action on the same node. Land this first so both do not rewrite `setText` at once.
- Owner grep: `grep -a -rn -i "remount" dev-docs/tasks --include='*.md'` filtered for Text Input / Start Value found only
  D61 itself and P87's README. No other owner.

## 5. Design

- **(a) Typing writes `props.startValue`.** That is the register's cheapest door, and it is one line in the node's
  `onTextChanged.onChange`. A remount then starts from what is in the field.
- **(b) Typing also writes `_internal.text`.** A later unfocused `Set` would then write what was typed, not the author's last
  Value, and re-sending the same Value would apply again (`:184`). That changes `Set`'s meaning.
- 🔒 **Ruling for Richard:** when a person has typed over an authored Value, does the Value input still own the field? **(a)**
  keeps `Set` pointing at the author's last Value. **(b)** makes the field's own content the source of truth. The question is
  not about code.
- 🔒 **Second ruling:** should a remount fire `Value Changed` at all when the value did not change? Today it fires on every
  mount (`TextInput.tsx:92`). (a) alone keeps that firing.
- > 🔒 **Ruled, 2026-09-14 (session 1):** **(a).** Typing writes the start value, and `Set` still means the author's last
  > Value. **And a remount fires `Value Changed` only on a real change.** A remount that shows the same value emits nothing.
  > — Richard, both as recommended
  >
  > ⚠️ The second half **removes** an emission. AC5's census must list every graph in the population that receives the
  > mount emission today, P77 D33's six rows included, because each one stops receiving it.
- **Do not** remove the `hasFocus()` guard in `setText` (`text-input.ts:376`); it is ERG-001 §4.
- **Do not** make `startValue.set` emit anything new. D31's trace depends on what emits today.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8.** A jsdom spec mounts a Text Input, types `Tom` through a real `input` event, unmounts it with `Mounted`, and remounts it. It reads the DOM value (expect `""` at HEAD) **and** the node's `Value` output. That settles the register-vs-source disagreement in §2. Known-firing beside it: the `input` event did change the output to `Tom` before the unmount. |
| AC2 | **The person sentence, in a browser.** A minimal project: a field under a `Mounted` toggle. Type with real CDP key events, hide, show; the field reads `Tom`. Same drive over Rocket School's setup with `rsNameKeep` removed: `nameBox === 'Tom'` in 4/4 cells. |
| AC3 | **Sabotage arm.** Revert the write the fix adds; AC1's spec goes RED on the DOM value. |
| AC4 | **ERG-001 §4 still holds.** `erg-001-visual-outcomes.test.ts`'s focused-`Set` row (Unchanged) and its unfocused control (Done) both still pass. A new row types into a focused field, sends `Set`, and asserts the typed text survives, plus a control where the field is unfocused and `Set` lands. |
| AC5 | **Blast radius.** Enumerate every Text Input in the shipped `library/` and `templates/` with a wire **into** `startValue` and a wire **out of** `onTextChanged`. For each, record before and after whether a remount fires `Value Changed` and with what value. P77 D33's six rows are in the population. The count comes from the artefacts, not from memory. |
| AC6 | **Workaround.** Rocket School's `rsNameKeep` and its two wires can be removed and AC2's template arm still passes. Record whether it was removed or kept, and why. |

## 7. Traps

- A spec that calls `node.setText` to "type" does not type. Typing is `onChange`, and the defect lives only on that path.
- An unmounted field and a focused field are both abstaining paths in `setText`, and they are different ones. Grade each.
- `jsdom`'s `document.activeElement` follows `.focus()`, so a spec can accidentally put the field in the focused mode.
- The deprecated `nodes-deprecated/controls/text-input.tsx` is a second copy. Say whether it is in scope, with a reason.

## 8. Record

Not started.
