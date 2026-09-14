# GAM-006 — A colour switched by a States node reaches the screen, with transitions on

**Status: ⬜ not started.** **Source:** [P78 D49](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) (replaces D43) · found by TPL-006 story engine, 2026-09-12 (TPL-005 pixel game, 2026-09-11, first) · **Side:** product (runtime, `States`)

A States node flips its text and leaves its colour behind: the eyebrow reads "An ending" and the ink stays the
reading colour, at every sample for 1.5 s. This happens with transitions on, which is the default.

## 1. The person sentence

**Someone switches a component's state, and every colour that state names appears on the screen, gliding there when
transitions are on and jumping there when they are off.**

## 2. What was measured

Readings are re-read at HEAD `eb12ebe99` (2026-09-14) unless marked. Template readings are from the working tree over that commit.

| reading | where |
|---|---|
| **Seen in the browser, two arms that differ only in `useTransitions`.** With `true`, the string flips and both colours read their previous value at 0, 60, 150, 320, 700 and 1500 ms. With `false`, all three land. *As recorded 2026-09-12, not re-driven* | register D49 |
| `useTransitions` is on by default, in both places | `packages/noodl-viewer-react/src/nodes/std-library/states.ts:136`, `:318-327` |
| `boolean`, `string` and `textStyle` values are assigned and flagged at once. Every other type takes the transition path unless dur and delay are both 0, transitions are off, or the state is only passed through | `states.ts:716-724`, `:725-751` (the guard is `:735-741`) |
| 🔴 **The mechanism.** `onStart` parses a colour with `setRGBA(resolveColor(v))`. `resolveColor` only looks the value up in a `styles.colors` table and otherwise returns it unchanged, so `var(--primary)` is read two characters at a time as hex (`'ar'` gives 10, the rest NaN) | `states.ts:165-179`, `:89-101`; `packages/noodl-viewer-react/src/styles.ts:122-127` |
| 🔴 **The tween ends on the parsed garbage, not the authored value.** The last frame writes `rgbaToHex(targetValues)`, which is `#0aNaNNaNNaN`. The browser rejects it and keeps the old colour. D49's "never publishes" is precisely: it publishes an invalid colour | `states.ts:190-194`, `:108-110` |
| **Already MEASURED headlessly by P18**, with the loaded `states.ts`, owner NONE. *As recorded 2026-09-03, not re-run* | [EXP-011 §49.3, §49.6](../phase-18-code-export-v2/EXP-011-PICKER-COVERAGE.md); `packages/nodegx-export/tests/animation-pair.test.ts:600` (A5) |
| ⚠️ **D49's title does not hold as written for numbers or hex colours.** A `number` value tweens through `Number()` and `EaseCurves.linear`, and a `#rrggbb` colour parses. Both are predicted to work from source. Neither has been measured in a browser. The D49 table measured only a string and two **token** colours | `states.ts:161-164`, `:197-199` |
| The same parse, from the same lookup, sits in visual-node state transitions (variants). Predicted to break the same way for a token colour. **Not measured** | `packages/noodl-viewer-react/src/node-transitions.ts:38-42`, `:88-100` |
| A resolver that reads `var()` off the document already exists: P79 E2's fix for Color Blend | `packages/noodl-viewer-react/src/nodes/std-library/colorblend.ts:45-75` |
| **Census, States nodes with a colour value and transitions on** (working tree). Templates: `landing-pages` `Site/FilterPill` `fpLook` (`bg`, `fg`, `edge`; tokens; set `true`); `pixel-game` `Pages/Play` `plBannerStates` (`tone`) and `plBoardStates` (`edge`), both default, tokens, **still unpinned** | `templates/*/components/**/nodes.json` |
| Prefabs: `app-shell` `Nav Item` `color` (default, `var(--primary)`/`var(--muted-foreground)`); `navigation-menu` `Item` `color` (default, style names `Primary`/`Grey - 900`, which resolve only if the project carries colour styles). Every other colour-carrying prefab States is pinned `false` | `library/prefabs/*/project/project.json` |
| Numbers with transitions on (the controls for the number claim): `landing-pages` `FaqRow`/`PhotoCard`/`ServiceCard` `chevron`; prefabs `toast` `Toast Component` `Pos`, `toggle-switch` `pos` | same |
| Ten prefab components wire a value into `currentState`, as D49 says. 8 of them pin `false`; `toast` and `toggle-switch` default and carry no colour | same (`toId`/`toProperty`) |
| Workarounds pinned by gates: TPL-006 `psLook` and `rdMode` (`tpl006Template.test.ts:533-545`); all 22 Rocket School States (`tpl007Template.test.ts:196`) | `packages/noodl-mcp/tests/` |

## 3. Where it bites a person

Any selected/unselected, calm/urgent or success/error look done with a States node, in any project that colours with tokens.
The authoring doctrine insists on tokens, and every v2 template uses them. The panel is right, the validator is silent, the
string beside it changes, and the colour does not. The idiom is [CMP-001 §4](../phase-85-the-component-is-the-backbone/CMP-001-THE-COMPONENT-INTERFACE-PLAYBOOK.md).

## 4. Related work and collisions

- 🔴 **[EXP-011 §49.3](../phase-18-code-export-v2/EXP-011-PICKER-COVERAGE.md) found and measured this mechanism first** and
  registered it owner NONE. The export resolves the token and "degrades to the interpreter's own answer where there is no document".
  `animation-pair.test.ts` A5 pins the interpreter's current garbage, so a runtime fix changes what that row compares against.
- [P79 E2](../phase-79-the-syllabus/DEFECTS-LESSON-3-FOUND.md) is the same shape in Color Blend, fixed 2026-09-05. That fix is the resolver to reuse.
- [P30 audit, Animation](../phase-30-node-library-audit/audit/animation.md) and [Interpolation D1](../phase-30-node-library-audit/audit/interpolation.md) (the colour-format contract).
- D43 is disproved and replaced by D49. Read it for history, and do not build its mechanism.
- The template workarounds: [TPL-005](../phase-78-the-templates/TPL-005-THE-PIXEL-GAME.md) (predicted broken, not pinned),
  [TPL-006](../phase-78-the-templates/TPL-006-THE-STORY-ENGINE.md), [TPL-007](../phase-78-the-templates/TPL-007-THE-MATHS-AND-TYPING-GAME.md),
  and [P87 README](../phase-87-the-first-play-test/README.md) `:144`.
- Greps run: `useTransitions`, `NaNNaN`, `token colour`, `resolveColor` over `dev-docs/tasks`. Nothing else owns the runtime fix.

## 5. Design

- **(a) Resolve before parsing.** `onStart` reads both endpoints through a shared colour reader: `var(--token)` via the document
  (Color Blend's `parseColor`), `#RGB`, `#RRGGBB(AA)` and `rgb()/rgba()`.
- **(b) Land on the authored value.** The last frame writes the state's own parameter, not `rgbaToHex`. Then even a colour the
  reader cannot parse arrives, as a jump at the end.
- (a) without (b) still ends on an unreadable value. (b) without (a) is a correct end state with no glide. Land (b) first, because it alone meets the person sentence.
- **(c)** `node-transitions.ts` gets the same reader, if AC7 shows it has the defect.
- 🔒 **Richard:** a colour the reader cannot parse: jump silently at the end, or also raise a runtime warning naming the value,
  as Color Blend "reports what it cannot read"?
  > 🔒 **Ruled, 2026-09-14 (session 1): warn only if CSS rejects it.** A value the browser accepts but the tween cannot
  > interpolate (a named colour such as `red` or `transparent`) jumps at the end silently. A value the browser would also reject
  > raises a runtime warning naming it. — Richard, choosing that option over "jump silently" and "jump and always warn"
  >
  > ⚠️ Owed by the build: where there is no document (server render, a headless spec), "would CSS reject it" has no oracle.
  > Say what the node does there, and do not warn on a guess.
- **Do not** flip the `useTransitions` default. Numbers animate with it (the toggle-switch knob), and it changes every project.
- **Do not** "fix" by pinning `false` across the prefabs. That is the template workaround, generalised.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8.** A viewer spec boots the real `states.ts` with a `var(--primary)` colour and transitions on, and runs past the tween. The colour output is not the token (expected `#0aNaNNaNNaN`), beside a known-firing string value on the same node that flips. Two more arms on the same spec, recorded whatever they read: a `#8a4f16` colour, and a `number` value. **Their result corrects or confirms the register's "or a number".** |
| AC2 | (b): the token arm ends on the authored value. Sabotage arm: restore `rgbaToHex(targetValues)` and it goes RED. |
| AC3 | (a), in a real browser with the document's tokens: every frame of the tween is a valid CSS colour and the midpoint differs from both endpoints. Sabotage arm: bypass the reader and the frames are invalid. |
| AC4 | **Blast radius before landing:** list every States node with a colour value and transitions on across `library/prefabs`, `templates/`, the embedded template `.content.json` files and the P86 corpus. Record what each shows today and after. §2's four (FilterPill, `plBannerStates`, `plBoardStates`, app-shell `Nav Item`) are the known-firing hits. |
| AC5 | **Person, real browser:** TPL-006's `Story/Passage` with `useTransitions` true, walked to an ending. `rule` and `tone` change on the rendered DOM. Plus TPL-003's `Site/FilterPill` clicked: the selected look changes. Control: the same drive on HEAD reads unchanged. |
| AC6 | **Workarounds:** flip one Rocket School colour States (`Game/Choice` `chStates`) to `true` in a copy and drive its selected look. Then decide, and record, whether the Rocket School and TPL-006 pins and their two gates stay (as belt and braces) or go. TPL-005's two unpinned nodes are driven and read correct. |
| AC7 | `node-transitions.ts`: a visual state with a token colour is measured at HEAD. If RED, it is fixed here under AC2/AC3's arms, or registered with an owner. |
| AC8 | `animation-pair.test.ts` A5 is updated so the interpreter and the export agree on a token colour, and it stays green. |

## 7. Traps

- 🔴 **A hex-colour fixture grades nothing.** Hex parses today. The defect needs a token.
- 🔴 **Server render freezes the clock** (`ssr.note`), so a render-server read shows the start state whatever the fix does. Use a browser, and wait out the duration.
- ⚠️ A token that resolves to another token: Color Blend bounds the recursion. Keep the bound.
- ⚠️ `resolveColor`'s named-style lookup must keep working for legacy projects (`Primary`). Test that arm as well.

## 8. Record

Not started.
