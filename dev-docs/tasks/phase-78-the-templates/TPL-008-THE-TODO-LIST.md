# TPL-008 — The todo list

**Opened 2026-09-14**, at Richard's request — *"Can we make a new template please (for me this time)"*:

> *"It's the simplest todo list ever, because I HATE task management software with a vengeance."*
>
> - You add a task, it goes in at priority 1; another goes in at 2, but you can move it up or down.
> - The only way to organise tasks is *"what I need to do next"*, and the user decides.
> - You can open a task to add notes, a deadline, and next actions (subtasks), also in priority order only.
> - You can check things off, but you have to write what happened (like Pipedrive), even
>   *"nothing, I just need to delete this task"*, so there is ALWAYS a trace.
> - Traces are stored: priority changes, notes added, completed, uncompleted, etc.

**Status: 🟢 BUILT, GATED (20/20) AND DRIVEN (12/12) — s2, 2026-09-14. Committed (s1 `2ad64ccee` + `7b6f7c650`).**
`npm run template:todo` → `templates/todo-list/`. AC1–AC7 and AC9 green; **AC8 is Richard's look and his first real use;
AC10 (the browser-only demo, R9) is the next build.**

---

## 1. Rulings (2026-09-14, from the two mockups)

The mockups are Artifacts: v1, then v2 — the one he approved.

| # | Question | Ruling |
|---|---|---|
| R1 | Delete | **There is no delete.** Closing is the only way a task leaves the list, and it always asks *"What happened?"* — "Good call" |
| R2 | Where new things go | **The bottom.** New and reopened tasks join at the end; nothing jumps the queue unless you move it — "Good call" |
| R3 | Notes | **Notes are history entries**, append-only, not an editable box — "Good call" |
| R4 | Next actions | *"sub tasks could also have descriptions and close notes I think, better try it and then change my mind if it's too much?"* — a next action has a **description**, and **ticking or unticking one asks for a note**. Easy to relax if it grates. |
| R5 | Move noise | **A burst of moves collapses** into one line ("Moved #3 → #1"); only the task you moved gets a line — "Good call" |
| R6 | Row meta | The row shows the task's **next next-action** — "Yep" |
| R7 | Name | **"Todo list"**, not "Then." — "Nope, just Todo list is fine" |
| R8 | Look | v1 was *"trying too hard"*. **v2: one system font, three sizes, one accent, red only for overdue** — "Love it, build it please" |
| R9 | The nodegx.io demo (s2) | **A browser-only demo mode** — not a public backend on nexus-1, not screenshots. A second data layer, to be kept in step with the backend one |
| R4a | A note on every tick (s2) | **"Try it first, decide after use"** — unchanged until Richard has used it |

### 1a. Storage — decided by me, at Richard's request (*"you decide, my head hurts"*)

**Wanting the list on both phone and PC is what decides it: the list has to live on a server.** `localStorage` plus a download-a-backup
button protects against loss but syncs nothing; phone-key signing with a QR hand-off (the *nexus* shape) is a sync protocol,
the wrong project for "the simplest todo list ever". The NodeGX backend already has users, sessions, per-row ACLs and one
SQLite file, so the template connects to it and uses nothing else.

## 2. Data

| collection | fields | policy |
|---|---|---|
| `Task` | `title`, `position` (lower = sooner), `status` `open`/`done`, `deadline` `YYYY-MM-DD`, `closingNote`, `closedAt` | signed-in find/get/create/update, **delete `nobody`**, creator owns |
| `Action` | `taskId`, `title`, `position`, `done`, `note`, `description` | same |
| `Event` | `taskId`, `kind`, `summary`, `body`, `at` | same |

- **`position`, not `rank`.** Ranks are derived when read. Moving swaps two positions (two writes), "Move to #1" is `min − 1`,
  adding and reopening are `max + 1`. Closing a task rewrites nobody else's row.
- **`delete: nobody` everywhere**, so "nothing is lost" is enforced by the backend, not only by the missing button. Driven: the
  owner's own `DELETE` answers **403**.
- ⚠️ **`Event.update` is allowed** — R5's collapse updates the line it extends. A person can therefore edit their own history
  through the REST surface. Accepted: it is their own list.
- ⚠️ **`signup: public`** so a person can make their account. `START-HERE.md` tells them to set it to `nobody` afterwards.

## 3. How it is built

Through the plan door, like TPL-007. Sources: `packages/noodl-mcp/tests/tpl008{Components,Template,Theme}.ts`; policy
`templates/todo-list.security.json` (copied in last); generator `scripts/generate-todo-template.ts`.

**35 components** (s2): `App`, 15 in `Todo/` (what you see), 5 in `Logic/`, 12 in `Commands/`, 2 pages.

- **`Commands/*`** — one component per thing a person can do (add, move ×3 placements, close, reopen, rename, set deadline,
  add/tick/untick/move/describe a next action, add a note). Each: a guard `Function` → the record write → `Logic/Write history`.
- **`Logic/Write history`** — the only writer of `Event`; it decides create-or-extend for R5.
- **`Logic/Todo data`** (s2) — the four queries, the only reader. `refresh` loads everything; `loadHistory` the selected task's.
- **`Logic/Task rows` / `Selected task` / `Log rows`** — what the queries load, turned into what the screen draws.
- **`Todo/Dialog flow`** (s2) — "what happened?" for close, reopen, tick and untick: one input per producer, one confirm per question.
- **`Pages/Todo`** (51 nodes, was 71) holds the selection and places the rest; **`Pages/Sign in`** makes or opens an account.
- The deadline is **typed** (`YYYY-MM-DD`, `today`, `tomorrow`), because Text Input has no date type — **D73**.
- Icon buttons carry their name as a hidden label (`styleCss: 'font-size: 0;'`), because Button has no accessible-name port — **D72**.

## 4. Acceptance criteria

| AC | Criterion | Result |
|---|---|---|
| AC1 | Generates reproducibly with 0 refusals | ✅ two builds `diff -r` identical; gate §1 compares every byte; 0 warnings, 148 infos |
| AC2 | The policy validates, and denies delete on all three collections | ✅ gate §2 (with a control the validator rejects); drive §6: owner `DELETE` → 403 |
| AC3 | Sign up → three tasks list 1, 2, 3 in the order added | ✅ drive §1, account made on the page, each task has "Added at #n" |
| AC4 | Move #3 up twice → 3,1,2 and ONE line "Moved #3 → #1" | ✅ drive §2, read off the server |
| AC5 | Close needs a note; closed task leaves the list, shows under Done, has a `closed` line | ✅ drive §3: OK disabled until typed; "Closed from #2 \| note" |
| AC6 | Next actions: add, tick-with-note, describe; each leaves a line | ✅ drive §4–§5: history kinds are exactly the eight expected |
| AC7 | A second account sees none of the first account's rows | ✅ drive §6: Task/Action/Event 0/0/0 |
| AC8 | Richard's look, and a week of real use | ⬜ Richard |
| AC9 | Every icon button has a name a screen reader says; the icon shows and the words do not (D72) | ✅ s2 gate §4 (sabotaged: dropping one label reddens exactly it) + drive: Chrome's AX tree names all 9 list buttons, the tick box flips "Mark done" → "Mark not done", `font-size` 0px, words 0px wide |
| AC10 | A browser-only demo mode for nodegx.io (R9) | ⬜ next build |

Gates: `packages/noodl-mcp/tests/tpl008Template.test.ts` **20/20** · `packages/nodegx-backend/tests/tpl008-todo-drive.test.ts`
**12/12**, `devOpen: false`, **0 console errors** · `npm run typecheck:mcp` clean. Pictures: run the drive with
`TPL008_SHOTS=<dir>` (desktop list, the close dialog, desktop detail, phone detail, phone list).

## 5. Not in this build

- File uploads (Richard: *"maybe not file uploads yet (complicated)"*).
- The nodegx.io demo — ruled R9 (browser-only), not yet built (AC10).
- Paging: the queries cap at 1,000 tasks, 1,000 next actions and 1,000 history lines per task; the Log shows the latest 300.

## 6. Questions for Richard

1. ~~The public demo on nodegx.io~~ — **ruled R9 (s2): browser-only demo mode.**
2. **R4 in practice**: is a note on every tick of a next action too much? One parameter's worth of change either way.
   **Deferred by Richard (s2) until he has used it.**
3. **For AC10, my defaults unless Richard says otherwise:** the demo starts with a few example tasks (an empty list demos
   nothing), keeps the visitor's changes in their own browser (`localStorage`) with a visible "Reset the demo" button, and says
   on screen that it is a demo whose data never leaves the browser.

## 7. Session log

### s1 — 2026-09-14: mockups, rulings, built, gated, driven

**Built** in one pass through the plan door. The door refused four things while building, each fixed at the source:
`paddingTop` on a `Text` (a Text has no box) and `mounted` on three component instances (an instance has only the ports its
Component Inputs declare, so each view is gated on a wrapper Group). It warned once: `gate-only-turns-on` on the sign-in
error, fixed with a constant-false Condition fired by each new attempt.

**Driving found three things the gate and the door could not:**

1. 🔴 **D71 — a wired `run` does not make a Function signal-only**, although `get_node_type` says it does. `Commands/Move
   task` had one input (`in-itemId`) wired from outside its guard list with the box still ticked, so clicking ANY row moved
   that task. The first drive read **three `moved` lines where one was expected** and "Closed from #3" for a task at #2, all
   with 0 console errors. Fixed (`quietIns`), and gate §3 now fails on any run-wired Function with a ticked wired input.
   **Sabotaged:** removing the fix reddens exactly `Move task` and `Move action`; restored by `cp`, md5 matched.
2. 🟠 **A filter parameter has its own Run On Value Change box** (`dbcollectionnode2.ts:1145`), ticked by default and NOT
   covered by the `collectionName`/`querySettings` boxes. The history query's `qp-taskId` fetched at boot for a signed-out
   visitor, and the only trace was a 403 in the console (attributed to boot by the drive's per-step error log). Fixed: the
   box off, the filter fed straight from the selection variable, and history fetched only when a task is selected.
   ⚠️ **Candidate, UNMEASURED:** TPL-001's `NO_LOAD_TIME_FETCH` has the same gap on the meetings query's `qp-today`.
3. The deadline refusal, rename and note all worked first time.

**Looking found one thing no check could:** the page ground stopped under the content and the rest of the window was white
(body scroll makes the App's 100% height the content's height). Fixed with a `CSS Definition` on `App`.

**Filed:** D71 (catalog text), D72 (an icon-only Button has no accessible name — the up, down and tick buttons are silent to a
screen reader), D73 (Text Input has no date type). All three owner `NONE`.

**Open, deliberately not done:**
- ~~`Pages/Todo` is 70 nodes~~ — split in s2 (71 → 51).
- The page's selection and dialog use app-wide Variables (global by name). Correct for one page, and it would need revisiting
  if a second page placed them.

**Committed in s2** as `2ad64ccee` (every s1 path) and `7b6f7c650` (D71–D73), each from a private `GIT_INDEX_FILE` holding
only TPL-008's hunks, so the peer's TPL-007 and P88 edits in `package.json`, `NEXT-SESSION-PROMPT.md` and
`DEFECTS-THE-TEMPLATES-FOUND.md` stayed unstaged and theirs.

### s2 — 2026-09-14: Richard's rulings, D72 fixed in the template, `Pages/Todo` split, committed

**Rulings** (asked at the start): R9 — the demo is browser-only; R4a — the note on a tick stays until he has used it.

**D72, fixed in the template (AC9).** A Button writes its `label` inside the `<button>`, and the icon's size is set on the
glyph, so `label: 'Move up'` plus `styleCss: 'font-size: 0;'` gives the button a name and shows only the icon. The tick box's
name is wired from the row (`checkLabel`: "Mark done" / "Mark not done"). Names were chosen not to collide with the dialog's
"Close task" / "Tick off", which the drive clicks by exact text. **Measured, not assumed:** the drive reads Chrome's
accessibility tree (`Accessibility.getFullAXTree`, private-use icon glyphs stripped) — 9 named list buttons, 0 nameless, the
tick box renamed after a tick — and the first "Move up" computes `font-size: 0px`, its icon draws, its words are 0px wide.
Gate §4 rule sabotaged (one label removed → exactly that rule red, plus the byte-identical check); restored by `cp`, md5 matched.

**The split.** `Logic/Todo data` (9 nodes: the four queries, the has-a-task gate, the load-problem setter, and its own reader
of the selection variable, so the history filter still has the new id before `loadHistory` fires). `Todo/Dialog flow`
(18 nodes: the dialog, the mode States node, three variables, six setters, four gates) — each producer keeps its own input,
so the list's close and the detail pane's close still never share a value port. The refresh `Function` became the component's
`refresh` signal input. `Pages/Todo` **71 → 51 nodes**; the door still says `oversized-page` (the 15 command placements are
the page's job). Re-gated 20/20, re-driven 12/12 with 0 console errors; the drive closes from the list and ticks a next
action through the new flow. ⚠️ **Reopen and untick are not driven** — same wiring shape, unclicked.
