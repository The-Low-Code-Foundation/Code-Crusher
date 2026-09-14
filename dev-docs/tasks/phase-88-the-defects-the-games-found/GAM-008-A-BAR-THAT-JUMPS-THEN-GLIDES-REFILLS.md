# GAM-008 — An animated value asked to jump and then glide does both

**Status: ⬜ not started.** **Source:** [P78 D67](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by P87 [RKT-006](../phase-87-the-first-play-test/RKT-006-RESTART-FROM-INSIDE-THE-RACE.md), 2026-09-13 · **Side:** product (runtime, `Animate To Value`)

Rocket School's Défi countdown bar has never refilled for a new question, in any build since TPL-007 session 1. The
bar read 0.50 and 0.63 as a fresh question appeared. The graph wrote "full", then "empty", in one pass, and the bar
just kept gliding down from where it was.

## 1. The person sentence

**Someone builds a countdown bar that jumps to full and then empties, and every new question starts with a full bar.**

## 2. What was measured

Readings are re-read at HEAD `eb12ebe99` (2026-09-14) unless marked. Template readings are from the working tree over that commit.

| reading | where |
|---|---|
| **Seen, as recorded 2026-09-13, not re-driven.** A question reached by Next showed the bar at 0.50 and 0.63 (session 6's deploy `rocket-p3`). The press-dated clause: *"bar 0.47 → 0.45 over 608 ms; last full 15691 ms before Next was pressed"* | RKT-006 §5 (build 1, build 4); RKT-007 §2 |
| RKT-006's explanation: *"its Animate saw one target, and a target equal to its end value is ignored"*. Its duration claim: *"a duration of 0 is not a jump"*, which it marks **inferred, not measured**. Build 2 changed both things at once (`cdKick`, a 40 ms Delay between full and empty; the jump takes 1 ms), so **which change was needed is not isolated** | RKT-006 §5; `packages/noodl-mcp/tests/tpl007Components.ts:1081-1084`, `:1145-1147` |
| The first target is adopted outright. A target equal to `_animation.endValue` returns early. Any other target sets `startValue = currentNumber`, `endValue`, then `start()` | `packages/noodl-viewer-react/src/nodes/std-library/animate-to-value.ts:111-116`, `:117-120`, `:122-124` |
| `start()` only **queues** the timer, once per frame (`scheduleTimer` dedups). It joins at the end of the next frame. `startValue`, `endValue` and `duration` are read when frames run, never when they are set | `packages/noodl-runtime/src/timerscheduler.ts:43-50`, `:87-95`, `:179-195`; `animate-to-value.ts:58-61`, `:133-135` |
| ⚠️ **"One target" does not hold by source outside a node's first update.** `queueInput` keeps every value, and consolidates last-wins only while `_isFirstUpdate`. The drain delivers each queued value in order through `setInputValue` | `packages/noodl-runtime/src/node.ts:1223-1270` (`:1239-1266`), `:675-737` |
| The chained writes do land in one pass. `Set Variable.do` stores through `Model.set(…, {forceChange})`. `notify` is synchronous. Variable2's listener `flagOutputDirty`s, `sendValue` queues on every connection, and `done` then fires the next Set Variable | `setvariablenode.ts:137-146`, `:204-210`; `model.ts:343-349`; `variablenode2.ts:60-66`; `node.ts:814-835`; `outputproperty.ts:151-165` |
| ⚠️ **"Duration 0 is not a jump" is not supported by source.** A zero-delay timer runs `onRunning(0)` (the start value) as it joins. The next frame, `duration 0` gives `t = 1` and the end value. That is the same two frames as 1 ms. **Not measured** | `timerscheduler.ts:139-143`, `:185-195` |
| **What source predicts for the pre-build-2 chain:** target 100 then 0, duration 0 then the limit, all in one pass. `set(100)` starts a run. `set(0)` differs from 100, so it restarts from `currentNumber`, which is still the old bar. The frame then reads duration = limit, and the result is a glide **from where the bar was**. Under this reading the cause is that a jump and a glide in one pass collapse to the glide, and neither of RKT-006's two causes is needed. **RKT-006's reading also fits every recorded drive number. Nothing yet excludes either** | the rows above |
| The P30 audit ruled the equal-target return **correct** (✅ A3). The export transcribes it, and a parity row pins it | [audit/animation.md](../phase-30-node-library-audit/audit/animation.md) `:33`; `packages/nodegx-export/tests/animation-pair.test.ts:322`, `:332`, `:351` |
| The deprecated `Transition` sibling has `setCurrentNumber`, a jump action. Animate To Value has none | audit/animation.md `:115` |
| Workaround gated: `cdSetFull.done → cdKick.restart → cdSetDur` and `cdIn.stop → cdKick.stop` | `tpl007Template.test.ts:624-631` (working tree) |

## 3. Where it bites a person

Every countdown, progress bar, meter or "reset then animate" built from Animate To Value: a quiz timer, a
loading bar restarting for the next file, a health bar refilled on respawn. The first run looks right, and every later
one starts wherever the previous run was. A Défi child had no true picture of their time for a whole play-test, and
the drives only saw it once a clause dated the refill.

## 4. Related work and collisions

- **No owner found.** Greps over `dev-docs/tasks`: `Animate To Value`, `animate-to-value`, `animatetovalue`, `cdKick`, `equal.*end value`, `one burst`.
- ⚠️ **[EXP-011 §49.1](../phase-18-code-export-v2/EXP-011-PICKER-COVERAGE.md)** transcribes the node's semantics into the export
  ("a target equal to the current end is ignored"), and `animation-pair.test.ts` A4 grades parity. Any runtime change owes that row.
- ⚠️ **[P30 NDA-012 Animation](../phase-30-node-library-audit/audit/animation.md)** A3 ruled the equal-target no-op correct. Its B3
  (the first target never fires At Target Value) is an adjacent open row, not this one.
- [REACTIVITY-CONTRACT](../../reference/REACTIVITY-CONTRACT.md) `:47-50`: *"Coalescing the animation is fine; coalescing the notification to nothing is not."*
  Collapsing a jump into a glide falls on the "animation" side, so the contract does not settle whether this is a defect.
- [TPL-007](../phase-78-the-templates/TPL-007-THE-MATHS-AND-TYPING-GAME.md) D40 (no ticker) is why the clock is built this way. RKT-007 reads its numeral off this same Animate.

## 5. Design

Order by dependency: AC1 decides which door is needed, and each door below answers a different cause.

- **(A) A jump action.** A `Jump To` input (or `Set Current Value` + signal): set `currentNumber`, stop the run, flag
  `currentValue`, all synchronously. It mirrors Transition's `setCurrentNumber`. Existing graphs do not change.
- **(B) Duration 0 settles now.** A target that arrives while duration is 0 lands synchronously. It is closer to what
  authors expect, but it changes every graph that uses 0 today (its value publishes a frame earlier), and the last duration
  in a pass would still win.
- **(C) Say it.** The node's description and `get_node_type`: a jump and a glide written in one pass become the glide, so
  separate them by a frame or use (A).
- 🔒 **Richard: A, B, or A plus C?** A adds a port; B changes a timing people may depend on.
  > 🔒 **Ruled, 2026-09-14 (session 1): A plus C.** Add a `Jump To` action, and describe the one-pass collapse in the node's
  > description. — Richard
  >
  > ⚠️ **The ruling picks the door, and AC1 still runs first.** If AC1 shows that the collapse is not the cause (RKT-006's
  > "one target" reading survives), `Jump To` may not refill the bar. Then come back to Richard with AC1's numbers
  > before building.
- **Do not** remove the equal-target return. The audit ruled it correct, and without it a re-sent target restarts a run in progress.
- **Do not** add coalescing or de-coalescing to `queueInput` for this. The drain's semantics are the reactivity contract's.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, and it isolates the cause** (recorded in §8). A runtime spec boots the real node with a real `TimerScheduler` driven frame by frame, as A4 does, fed through a real `Set Variable → Variable2` chain. Arm 1: 100 then 0 in one pass after the node's first update. Record how many times the `targetValue` setter ran and with what, then the value on the next three frames (RED: never reaches 100). Arm 2: the same writes a frame apart (known-firing: reaches 100 and glides). Arm 3: a lone jump with duration 0 against 1 ms, frames to land. **§8 states which of the three readings in §2 the arms exclude.** |
| AC2 | **RED drive:** a Rocket School copy with `cdKick` removed (the pre-build-2 chain) fails `drive-rkt006-restart.js`'s press-dated clock clause. The unchanged build passes it: the control. |
| AC3 | The fix per the ruling: arm 1 of AC1 now reaches 100 and then glides. Sabotage arm: revert and arm 1 goes RED again. |
| AC4 | **Blast radius before landing.** If B: every Animate To Value in `library/prefabs`, `templates/`, the embedded templates and the P86 corpus whose duration is or can be 0, listed with its change. If A: `animation-pair.test.ts` A4 passes unchanged, and a render drive over the corpus shows no difference. |
| AC5 | **Person, real browser:** Défi, FR 1366×768 and 390×844, three questions reached by Next. The bar is full within 150 ms of each question and then glides, dated from the press. Built with the product door, not `cdKick`. |
| AC6 | **Workaround:** remove `cdKick` and `cdOne` in a copy, using the door, and run RKT-006's 12 cells plus RKT-007's clock clauses. Record whether the template keeps or drops them. `tpl007Template.test.ts:624-631` is updated to match, or kept with the reason in the gate. |
| AC7 | The export's A4 gains the new behaviour's row, and the interpreter and export agree. |

## 7. Traps

- 🔴 **A reading that fits is not one that excludes.** Both "one target" and "collapsed into a glide" produce 0.50 at Next. Only a counted setter call separates them.
- 🔴 **The first update consolidates last-wins** (`node.ts:1239`). A spec that writes both targets while the node is booting measures a different path.
- 🔴 **Server render freezes the clock.** A render-server read never moves; use the frame-driven scheduler or a browser.
- ⚠️ A single bar reading against a threshold grades how late the probe looked (RKT-006 build 2). Date the refill from the press, as RKT-006 build 4 does.

## 8. Record

Not started.
