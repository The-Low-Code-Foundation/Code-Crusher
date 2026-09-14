# GAM-006 — A colour switched by a States node reaches the screen, with transitions on

**Status: 🟡 AC1 RED recorded; (b) built with AC2's runtime half and AC8 graded by reverted arms (2026-09-14, session 3, `82a7d3775`). A delayed colour publishing an RGBA array was found and is owed. (a)/AC3–AC7 not started (§8).** **Source:** [P78 D49](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) (replaces D43) · found by TPL-006 story engine, 2026-09-12 (TPL-005 pixel game, 2026-09-11, first) · **Side:** product (runtime, `States`)

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

### Session 3 (2026-09-14, HEAD `bb27086de`) — AC1: RED at HEAD, and the register's "or a number" is wrong

**The spec:** [`noodl-viewer-react/tests/gam-006-states-token-colour.test.ts`](../../../packages/noodl-viewer-react/tests/gam-006-states-token-colour.test.ts).
A real `States` node in `createCorpusGraph`, with the **viewer's own `Styles`** on `context.styles` (`viewer.jsx:144`),
where P18's A5 used a stub, carrying two legacy colour styles (`Grey`, `Primary`). One node carries every arm, so the
known-firing string sits beside the colour that does not arrive. The node settles into A (the first state jumps,
`jumpToState`), then `to-B` is pulsed and the clock runs at `graph.frame(16)`. The default transition is 300 ms. Log:
session `04c88900…` scratchpad, `gam006/ac1-run1.log` (`GAM006_AC1_EXIT=1`, 3 failed of 7 as predicted).

| value | A → B | transitions **on** (the default), 0 / 64 / 160 / 320 / 704 / 1504 ms | transitions **off** |
|---|---|---|---|
| `label` (string, known-firing) | `calm` → `hit` | `hit` at 0 ms, and after | `hit` |
| 🔴 **`tint`** (colour) | `var(--muted)` → `var(--primary)` | **`#0aNaNNaNNaN` at every sample, from 0 ms** | `var(--primary)` |
| `hex` (colour) | `#334455` → `#8a4f16` | `#334455ff`, `#4f4740ff`, `#714b27ff`, then `#8a4f16ff` from 320 ms | `#8a4f16` |
| `named` (colour style) | `Grey` → `Primary` | `#777777ff`, `#555b60ff`, `#2d3946ff`, then `#112233ff` from 320 ms | `Primary` |
| `size` (number) | `10` → `40` | `10`, `19.8…`, `31.6…`, then `40` from 320 ms | `40` |

**What it settles.**
- **The defect is a token colour, not colours and not numbers.** A `#rrggbb` colour and a named colour style both glide
  and arrive. A number glides and arrives. This confirms §2's ⚠️ and corrects D49's title and the register's "or a number".
- 🔴 **It is worse than D49 recorded.** Both endpoints are tokens in a real template (`var(--muted)` → `var(--primary)`),
  so the start value parses to garbage too. The output is an invalid colour **from the first frame**, not only at the
  end. A browser rejects every frame and keeps whatever it drew last, which is D49's "the ink stays the reading colour".
- **Transitions off lands every value**, the author's strings included. With transitions on, a colour that arrives ends
  as the tween's own 8-digit hex (`#8a4f16ff`), not the authored string. Design (b) makes both end in the same place.
- The three red rows are `tint`, `hex` and `named`. `hex` and `named` fail on the string's form, not its colour, and (b)
  turns them green along with `tint`.

### Session 3, continued — (b) built, AC2's runtime half graded, AC8 kept in step (`82a7d3775`)

**The change.** `states.ts` `onRunning`, the end-of-transition branch: a colour ends on
`stateParameters['value-<state>-<value>']`, the value its state names, instead of `rgbaToHex(targetValues)`. When the
state names no colour, it still ends on the tween's hex. Nothing else moves: numbers, strings, booleans and the frames in
between are as they were.

| reading | result | log (`gam006/`) |
|---|---|---|
| GAM-006 spec with (b) | **7/7**. `tint` ends on `var(--primary)`, `hex` on `#8a4f16`, `named` on `Primary`, which is where transitions off has always landed | `ac2-b-green.log`, `GAM006_B_EXIT=0` |
| 🔴 **Reverted arm:** only my hunk reverse-applied, which is `states.ts` at HEAD | **exactly `tint`, `hex` and `named` red**. `label`, `size` and transitions-off stay green. Restored, sha `0ff3a144…` before and after | `ac2-b-reverted.log`, `GAM006_B_REVERTED_EXIT=1` |
| The viewer's existing States specs (`nda-001-states-reactivity`, `nda-004-states-unknown-state`, `erg-001-states-outcomes`) | 3 suites, **42/42** | `states-regression.log`, `STATES_REGRESSION_EXIT=0` |

**AC8, in the same change (§4's collision).** `animation-pair.test.ts` boots the real `states.ts` as its interpreter and
compares it frame by frame with the emitted `statesLib`. After (b) alone, **7 A5 parity rows went red**, not just the token
row: every colour transition now ended on its authored string (`#334455`), while the export still ended on `#334455ff`.
So the export got the same change (`nodegx-export/src/emit/statesLib.ts`, `onTweenRunning`'s end branch lands on
`def.values[v].byState[m.state]`), and two literals that pinned the old end string moved with it: the token row now
expects `var(--primary)`, and the per-value-delay row expects `#ffcc00`. Its NaN mid-frame `toMatch` stays, because (a) is
not built.

| reading | result | log |
|---|---|---|
| HEAD baseline: both source files reverse-applied, test file as edited | 56/57. The one red is the token row, whose expectation I changed, so the test file edit is the only difference at HEAD | `a5-head-baseline.log`, `A5_HEAD_EXIT=1` |
| Both halves of (b) | **57/57** | `ac8-green2.log`, `AC8_GREEN2_EXIT=0` |
| 🔴 **Reverted arm on the export half only** (`states.ts` keeps (b)) | **7 A5 parity rows red**. Restored, sha `35209b8c…` | `ac8-reverted.log`, `AC8_REVERTED_EXIT=1` |

**The whole `nodegx-export` suite, with both halves in.** 100 of 101 suites, 3,490 tests passed
(`export-full.log`, `EXPORT_FULL_EXIT=1`). The one red was HLS-001's byte-identity gate
(`hls001-corpus-identity.test.ts`). It named exactly **1** differing file, `glow-desk/src/lib/states.ts`, and `glow-desk`
is the only one of the 46 fixture projects with a `States` node.
- **Attributed by a reverted arm:** with both source hunks reverse-applied, the gate is 4/4 (`hls001-head.log`,
  `HLS001_HEAD_EXIT=0`). Restored by hash.
- **Answered by counting, then regenerating** (the gate's own rule): `HLS001_REGENERATE=1` moved **1** hash line in
  `goldens/hls001-corpus.sha256.json` (`a5b628f8…` → `795c6bf2…`, the same file), and the gate is 4/4 after
  (`HLS001_AFTER_REGEN_EXIT=0`). The regeneration is recorded in that test's header, beside HLS-004's and CMP-005's.

**🔴 A second invalid colour, found by measuring and not yet fixed.** A colour with a per-value transition delay
publishes its **parsed RGBA array** for the whole delay. The spec's delayed row (`transition-B-hex` = 300 ms after a
200 ms delay) reads `[51,68,85,255]` at 0, 96 and 192 ms, then `#644a31ff` at 320 ms and `#8a4f16` at 704 ms
(`delay-row2.log`). The cause is the `ms < c.delay` branch, which publishes `this.startValues[v]`, and for a colour
`onStart` has replaced that with an array. `statesLib.ts`'s `onTweenRunning` has the same line. No A5 row sees it, because
A5's delayed value is `opacity`, a number. ⚠️ The first version of that row set the parameter on an unregistered input,
the delay never took, and it read as "no array". It graded nothing until the input was registered.

**What (b) does not do yet.**
- **AC3, (a):** the frames between the endpoints are still `#0aNaNNaNNaN` for a token, so in a browser a token colour
  holds and then **jumps** at the end instead of gliding. R7's warning belongs to (a)'s reader, and "no document" still
  owes its sentence.
- **The delay array above:** it belongs to this task's person sentence and needs the same treatment in both files.
- **AC4, AC5, AC6 and AC7:** not started. `node-transitions.ts` is unmeasured.
- Owed: the `nodegx-export` `dist` is gitignored build output and was not rebuilt, and the viewer bundles were not
  rebuilt, so a running editor or deployed app does not have (b) yet.
