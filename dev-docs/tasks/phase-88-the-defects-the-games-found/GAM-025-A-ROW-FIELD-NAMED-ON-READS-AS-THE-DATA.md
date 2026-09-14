# GAM-025 — A row field named `on` reads as the data

**Status: ⬜ not started.** **Source:** [GAM-007](GAM-007-A-DATA-FIELD-CALLED-ON-READS-AS-DATA.md) §5, the second half of 🔒 R8 · registered 2026-09-14 (P88 session 8) · **Side:** product (runtime, `Model`)

## 1. The person sentence

**Someone names a data field `on`, `set`, `get` or `data`, and reading it gives back what they wrote.**

GAM-007 built the first half of R8. The names are reserved loudly: the door warns (`reserved-row-field`), and
`Collection.set` raises `collection/reserved-field-name`. This task is the second half, "data wins later".

> 🔒 **R8, Richard 2026-09-14: C. Reserve now, and data wins later.** B lands first. A follows once AC3's call-site
> sweep is done.

## 2. Why it is owed

- **The interpreter and the export disagree today.** The export hoists Static Data as `Object.freeze([...])` of plain
  objects, so an exported `row.on` already reads the data. The interpreter reads the member (GAM-007 §8, AC6, read from source).
  A makes the interpreter agree with the export.
- GAM-007's census found **0** reserved fields in shipped graphs, but it cannot see rows built by scripts or records that
  arrive from a backend. A backend record with a `data` field is ordinary JSON.
- The reserved list is 24 names. Ten of them (`toString`, `valueOf`, `constructor`…) come from `Object.prototype`, not from NodeGX.

## 3. What A is

In `_modelProxyHandler.get` (`noodl-runtime/src/model.ts`), return an own key of `target.data` before any member.

**Trade-off, from GAM-007 §2:** every internal call made **through the proxy** to a member (`item.getId()` inside
`Collection.set`, `record.set(...)`, `record.on('change', …)`) breaks on a row whose data carries that name. Each call
site has to move to the raw record first.

## 4. Collisions

- **REACTIVITY-CONTRACT:** the Model proxy is the notification mechanism. A trap change sits under that contract and
  under NDA-002's compatibility notes.
- **GAM-007:** once A lands, `Model.isReservedFieldName`, `reserved-row-field`, `collection/reserved-field-name` and their
  specs either shrink to the names A still cannot free (for example `id`), or are retired with the reason written where they were.
- ⚠️ `Model.instanceOf` reads `value.target` through the proxy, so a row field named `target` already reaches it today.
- `noodl-mcp/tests/tpl007Template.test.ts` (Rocket School's D64 gate) retires under A, with the reason written in the gate.

## 5. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD:** GAM-007's AC1 arm, inverted, so `rows[0].on` reads the data. It is red until A lands. |
| AC2 | **The call-site sweep, before the trap changes.** Every place in `noodl-runtime`, `noodl-viewer-react`, `noodl-viewer-cloud` and the prefab scripts that reaches a Model member through a proxy, listed with file and line, and each moved to the raw record. A spec per moved site feeds a row carrying that member's name. |
| AC3 | The trap reads data first. A row with `getId`, `set` and `on` fields sets into a Collection, diffs on a second `set`, and notifies a Repeater. Reverted arm: restore the old trap, and exactly those specs go red. |
| AC4 | **Person, real browser:** the D64 shape (a shelf whose rows carry `on`, read by a Function, drawn by a For Each) draws its tiles, with no console error. |
| AC5 | **Export parity, measured:** the same project run interpreted and exported reads the same row values. |
| AC6 | GAM-007's warnings and runtime error shrink or retire, per §4, with their specs. |

## 6. Traps

- 🔴 A fixture that feeds plain JSON cannot see this. Build rows with `Collection.get().set(...)`.
- 🔴 `Object.keys(row)` already lists the field, both before and after. Read the value.
- ⚠️ The Model registry is process-wide. A spec that leaves named records behind can change the next spec's reading.

## 7. Record

Not started.
