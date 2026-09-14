# GAM-007 — A data field called `on`, `get` or `data` reads as the data

**Status: ⬜ not started.** **Source:** [P78 D64](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by P87 [RKT-011](../phase-87-the-first-play-test/RKT-011-THE-HANGAR.md), 2026-09-13 · **Side:** product (runtime, `Model`)

Rocket School's hangar drew no tiles. A shelf row's `on` field came back as the record's event method, so the
script threw `Cannot read properties of undefined (reading 'part')`. All 252 gates passed, because every gate fed the
script plain JSON.

## 1. The person sentence

**Someone names a data field `on`, `set`, `get` or `data`, and reading it gives back what they wrote, or the editor
names the field before the app runs.**

## 2. What was measured

Readings are re-read at HEAD `eb12ebe99` (2026-09-14) unless marked.

| reading | where |
|---|---|
| Seen: the hangar had a header, a preview and tabs, and no tile; the console showed the throw above. Reproduced headlessly, where `Collection.get().set(HANGAR_SHELF)` throws the same message and a plain array gives 12 rows. *As recorded 2026-09-13, not re-run* | RKT-011 §5 session 10; register D64 |
| Static Data's `items` output is its Collection, filled by `Collection.get()` + `set(rows)` for both CSV and JSON | `packages/noodl-runtime/src/nodes/std-library/data/staticdata.ts:129-137`, `:203-204`, `:233-234` |
| `Collection.set` turns each plain row into a Model | `packages/noodl-runtime/src/collection.ts:531-535` (`Model.create(plain)` at `:534`) |
| 🔴 **The proxy's `get` trap** answers any name whose value on the record is a function with that function, bound. Then comes any name `in` the record. Only after both does it read the data | `packages/noodl-runtime/src/model.ts:105-111` |
| `ownKeys` and `getOwnPropertyDescriptor` report the **data's** keys, so `Object.keys(row)` lists `on`. The row looks like data to anyone who inspects it | `model.ts:123-128` |
| Prototype members that shadow data: `on` `:279`, `off` `:288`, `notify` `:295`, `setAll` `:305`, `fill` `:316`, `set` `:325`, `getId` `:352`, `get` `:356`, `toJSON` `:372`, plus `constructor`. Instance fields: `id`, `data` (`:97-98`). `id` reads back the row's own id, so it is safe | `model.ts` |
| ⚠️ **The register's list is incomplete, read from source.** `Object.prototype` functions (`toString`, `valueOf`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString`, `__defineGetter__`…) also answer `typeof === 'function'` through the chain, so they shadow too. `listeners` becomes an instance field the first time anything calls `on` (`:280`), and after that it shadows a data field of that name. `_class` behaves the same (`:114`). **Predicted, not measured** | `model.ts:108-109`, `:280`, `:114` |
| The Rocket School gate walks the Model's prototypes but **stops before `Object.prototype`**, so its reserved list omits those names | `packages/noodl-mcp/tests/tpl007Template.test.ts:931-936` (working tree) |
| Workaround: the field is `faces`. A gate refuses any `Data/*` row field on the list, with a sabotage arm, and the engine gate runs the scripts on a real Collection. *Working tree* | `tpl007Template.test.ts:926-957`; RKT-011 §5 |
| The code export hoists Static Data as a frozen literal, so exported rows are plain objects and `row.on` should read the data. **The interpreter and the export are predicted to disagree. Not measured** | `packages/nodegx-export/src/emit/component.ts:1610`, `:2026` |
| Runtime code calls members **through** the proxy, e.g. `item.getId()` inside `Collection.set`. A row field `getId` would therefore also break the collection itself under a "data wins" fix | `collection.ts:497` |

## 3. Where it bites a person

Any Static Data, Array, query result or Object whose fields happen to be named `on` (a calendar's "on" date), `set`
(a workout set), `get`, `fill` (a chart fill), `data` (a chart's data), `notify` or `off`. It is silent, it reads like a
script bug, `Object.keys` shows the field, and no plain-JS test can see it. An agent writing JSON for a chart will
produce a `data` field sooner or later.

## 4. Related work and collisions

- **No owner found.** Greps over `dev-docs/tasks`: `proxy.*member`, `Model member`, `typeof member`, `model.ts:10`,
  `reserved.*field`, `static data` combined with `reserved|field name|member`. The only hits are D64's own records (P87 README `:34`, RKT-011 `:210`).
- ⚠️ **[REACTIVITY-CONTRACT](../../reference/REACTIVITY-CONTRACT.md)** makes the Model Proxy the notification mechanism, and Collection
  adopts the same pattern. A change to the `get` trap sits under that contract and under NDA-002's compatibility notes.
- [FLD-015](../phase-84-the-defects-the-field-report-found/FLD-015-CHARTS-THAT-EXPORT.md) (Static Data in the export) is the export side for AC6.

## 5. Design

- **(A) Data wins.** In the `get` trap, an own key of `target.data` is returned before any member. Members stay reachable
  through `Noodl.Object` APIs and through internal code that holds the raw target. **Trade-off:** every internal call made
  through the proxy (`item.getId()`, `record.set(...)`) breaks on a row carrying that field. AC3 has to enumerate those
  call sites, and each one moves to the raw record first.
- **(B) The names are reserved, loudly.** Keep the trap. The door warns when a Static Data or Array literal row carries a
  reserved field (validate + plan tools), and `Collection.set` raises a runtime error naming the field and the row. It is cheap
  and it changes no existing behaviour, but the field name stays unusable.
- **(C)** B now, then A behind it.
- 🔒 **Richard: A, B or C?** Is `on` a name a person may use for their data, or a name NodeGX reserves and says so?
  > 🔒 **Ruled, 2026-09-14 (session 1): C. Reserve now, and data wins later.** B lands first: the door warns on a reserved
  > field and `Collection.set` raises a runtime error naming it. A follows once AC3's call-site sweep is done. — Richard
  >
  > So this task builds B, under AC4's B arms, and **registers A as a follow-up with an owner** rather than leaving it
  > as a sentence. The reserved list is AC2's derived output, not a typed one.
- **Do not** rename the Model's members. `get`/`set`/`on` are the published `Noodl.Object` API.
- **Do not** fix it in Static Data only. The trap belongs to the Model, and query records and Objects share it.

## 6. Acceptance criteria

| AC | Clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8.** A runtime spec with a real `Collection.get().set([{ on: { a: 1 }, faces: { a: 1 } }])`: `typeof rows[0].on === 'function'`. Beside it, the known-firing arm: `rows[0].faces.a === 1`. Then a browser page, a Static Data row with `on` → Function → For Each: no row draws and the console throws. Control: the same page with `faces` draws its rows. |
| AC2 | **The list is read off the runtime, not typed.** A spec derives every shadowing name, including the `Object.prototype` chain, `listeners` after an `on()`, and `_class`, and records it in §8. §2's register list is corrected from that output. |
| AC3 | **Blast radius before landing.** If A: every call site in `packages/noodl-runtime`, `noodl-viewer-react` and the prefab scripts that reaches a Model member through the proxy, listed and moved. If B: every Static Data, Array literal and `.content.json` row field in the shipped library, templates and the P86 corpus that is on AC2's list, listed. |
| AC4 | The fix per the ruling. If A: AC1's `on` arm reads the data, and a row with `getId` still sets into a Collection. If B: the door warning names `Data/X: on` on the fixture and is silent on `faces`. Sabotage arm either way: revert and the arm goes RED. |
| AC5 | **Person, real browser:** the D64 shape (a shelf whose rows carry `on`, read by a Function, drawn by a For Each) either draws its tiles (A), or is refused in the editor or at `validate_component` with the field named before it runs (B). |
| AC6 | **Export parity:** the same project run interpreted and exported. Under A both read the data. Under B both refuse or warn. Measured, not assumed. |
| AC7 | **Workaround:** Rocket School's `faces` rename stays either way, since it is a clearer name. Its template gate either follows AC2's list (Object.prototype names included) or, under A, is retired with the reason written in the gate. Checked by that gate's own sabotage arm. |

## 7. Traps

- 🔴 **A gate that feeds a script plain JSON cannot see this.** Every fixture must build its rows with `Collection.get().set(...)`, the way the runtime does.
- 🔴 **`Object.keys(row)` includes the field.** A clause that inspects keys passes on the broken record. Read the value.
- ⚠️ `id` is safe and is not on the list; a list that includes it would refuse every row.
- ⚠️ The Model registry is process-wide (`model.ts:101`). A spec that leaves records behind can change the next spec's reading.

## 8. Record

Not started.
