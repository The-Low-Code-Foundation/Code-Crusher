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

**Status: 🟢 BUILT, GATED (19/19) AND DRIVEN (11/11) — s1, 2026-09-14. Nothing committed (Richard did not ask).**
`npm run template:todo` → `templates/todo-list/`. AC1–AC7 green; **AC8 is Richard's look and his first real use.**

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

**33 components**: `App`, 14 in `Todo/` (what you see), 4 in `Logic/`, 12 in `Commands/`, 2 pages.

- **`Commands/*`** — one component per thing a person can do (add, move ×3 placements, close, reopen, rename, set deadline,
  add/tick/untick/move/describe a next action, add a note). Each: a guard `Function` → the record write → `Logic/Write history`.
- **`Logic/Write history`** — the only writer of `Event`; it decides create-or-extend for R5.
- **`Logic/Task rows` / `Selected task` / `Log rows`** — the queries turned into what the screen draws.
- **`Pages/Todo`** holds the queries, the selection and the one dialog; **`Pages/Sign in`** makes or opens an account.
- The deadline is **typed** (`YYYY-MM-DD`, `today`, `tomorrow`), because Text Input has no date type — **D73**.

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

Gates: `packages/noodl-mcp/tests/tpl008Template.test.ts` **19/19** · `packages/nodegx-backend/tests/tpl008-todo-drive.test.ts`
**11/11**, `devOpen: false`, **0 console errors** · `npm run typecheck:mcp` clean. Pictures: run the drive with
`TPL008_SHOTS=<dir>` (desktop list, the close dialog, desktop detail, phone detail, phone list).

## 5. Not in this build

- File uploads (Richard: *"maybe not file uploads yet (complicated)"*).
- The nodegx.io demo (§6, question 1).
- Paging: the queries cap at 1,000 tasks, 1,000 next actions and 1,000 history lines per task; the Log shows the latest 300.

## 6. Questions for Richard

1. **The public demo on nodegx.io**: (a) host a real backend for it (public sign-ups on nexus-1, which serves two live sites),
   (b) a browser-only demo mode (a second data layer to maintain), or (c) no live demo, just screenshots?
2. **R4 in practice**: is a note on every tick of a next action too much? One parameter's worth of change either way.

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
- ⚠️ **`Pages/Todo` is 70 nodes** (the door's `oversized-page` info; its guideline is about 40). The candidates are the dialog
  flow (the `States` node, four gates, three variables and five setters) as `Todo/Dialog flow`, and the four queries with the
  refresh as `Logic/Todo data`. Each move re-wires the page, so it wants a re-drive; left for Richard to decide it matters.
- The page's selection and dialog use app-wide Variables (global by name). Correct for one page, and it would need revisiting
  if a second page placed them.

**Hand-off — every TPL-008 path, none committed** (commit by pathspec, `git add` the untracked ones first):
- new: `templates/todo-list/`, `templates/todo-list.security.json`, `scripts/generate-todo-template.ts`,
  `packages/noodl-mcp/tests/tpl008{Components,Template,Theme}.ts`, `packages/noodl-mcp/tests/tpl008Template.test.ts`,
  `packages/nodegx-backend/tests/tpl008-todo-drive.test.ts`, this file;
- edited: `package.json` (one line, `template:todo`), and in this folder `README.md` (the TPL-008 roster line),
  `NEXT-SESSION-PROMPT.md` (the top section) and `DEFECTS-THE-TEMPLATES-FOUND.md` (D71–D73). 🔴 **The last two also carry a
  peer's unstaged TPL-007 edits** — a pathspec commit of either takes theirs too.
