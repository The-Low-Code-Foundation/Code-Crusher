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

**Status: 🟢 BUILT, GATED AND DRIVEN — template (gate 20/20, drive 14/14) and demo (gate 18/18, drive 10/10). s3, 2026-09-14.**
`npm run template:todo` → `templates/todo-list/` **and** `templates/todo-list-demo/`. AC1–AC7, AC9 and **AC10's build** green;
**AC8 is Richard's look and first real use; publishing the demo on nodegx.io is Richard's call.**

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
- The two app-wide Variables in components drawn more than once (`todoLastHistory`, `todoProblem`) carry a node comment
  **"Shared on purpose: …"** — GAM-005's escape (s3).

### 3a. The demo (AC10, R9) — `packages/noodl-mcp/tests/tpl008Demo.ts`

**Derived, never written twice.** `TPL008_DEMO_COMPONENTS` is computed from `TPL008_COMPONENTS` on every generation, so a change
to a command, a row or a script reaches the demo with no one remembering. The generator writes both projects in one run.

- **Every record write** (15: 13 in `Commands/`, 2 in `Write history`) becomes a `Function` **at the same node id**: `prop-<f>` →
  `in-<f>`, `store` → `run`, `modelId` → `in-modelId`, `done`/`id`/`failure` → `out-*`, every input Run On Value Change off.
  It writes the whole list as one JSON string to `localStorage['nodegx-todo-list-demo-v1']`, with a copy on `window` so a
  blocked storage still works for the visit.
- **`Logic/Todo data`** keeps its interface plus `reset`: one reader whose collections, sort orders, filter and limits are
  **read off the backend queries** at build time, and which puts the example list in the store the first time it finds none.
  Reset forgets the list **and `todoLastHistory`** (see §7 s3 — without that a move after reset does not save).
- **`Pages/Sign in` is gone**; `Pages/Todo` loses its four sign-in nodes and six wires and loads on mount. **Sign out is
  Reset demo.** A line above the header: *"This is a demo. Nothing you type leaves this browser, and Reset demo puts the
  example list back."*
- The example list: four tasks added four days ago, one moved to #1, one overdue (red), one closed with a note, three next
  actions (one ticked with what happened), 13 history lines — each worded as the command that makes it would word it.
- 🔴 Anything the transform does not recognise (an unmapped record port, a query outside `Todo data`, a page wire count
  that drifted) **throws** at generation, rather than shipping a backend node that loads clean and saves nothing.

## 4. Acceptance criteria

| AC | Criterion | Result |
|---|---|---|
| AC1 | Generates reproducibly with 0 refusals | ✅ gate §1 compares every byte; 0 warnings, 148 infos (s3: after the GAM-005 comments) |
| AC2 | The policy validates, and denies delete on all three collections | ✅ gate §2 (with a control the validator rejects); drive §6: owner `DELETE` → 403 |
| AC3 | Sign up → three tasks list 1, 2, 3 in the order added | ✅ drive §1, account made on the page, each task has "Added at #n" |
| AC4 | Move #3 up twice → 3,1,2 and ONE line "Moved #3 → #1" | ✅ drive §2, read off the server |
| AC5 | Close needs a note; closed task leaves the list, shows under Done, has a `closed` line | ✅ drive §3: OK disabled until typed; "Closed from #2 \| note" |
| AC6 | Next actions: add, tick-with-note, describe; each leaves a line | ✅ drive §4–§5; **s3: untick driven** ("Unticked “…” \| note", position to the bottom) and **reopen driven** (§5b: "Reopened at #3 \| note", closing note and date cleared) |
| AC7 | A second account sees none of the first account's rows | ✅ drive §6: Task/Action/Event 0/0/0 |
| AC8 | Richard's look, and a week of real use | ⬜ Richard |
| AC9 | Every icon button has a name a screen reader says; the icon shows and the words do not (D72) | ✅ s2 gate §4 (sabotaged) + drive: Chrome's AX tree |
| AC10 | A browser-only demo mode for nodegx.io (R9) | 🟢 **built, gated 18/18, driven 10/10** (s3). ⬜ Not yet deployed with the shipped `nodegx deploy` and driven from the deployed folder; ⬜ publishing is Richard's |

Gates: `packages/noodl-mcp/tests/tpl008Template.test.ts` **20/20** · `tpl008Demo.test.ts` **18/18** ·
`packages/nodegx-backend/tests/tpl008-todo-drive.test.ts` **14/14** · `tpl008-todo-demo-drive.test.ts` **10/10**, both drives
**0 console errors** · `tsc -p packages/noodl-mcp --noEmit` exit 0. Pictures: run either drive with `TPL008_SHOTS=<dir>`.

## 5. Not in this build

- File uploads (Richard: *"maybe not file uploads yet (complicated)"*).
- Paging: the queries cap at 1,000 tasks, 1,000 next actions and 1,000 history lines per task; the Log shows the latest 300.
- The demo on nodegx.io: built (AC10), not deployed or published.

## 6. Questions for Richard

1. ~~The public demo on nodegx.io~~ — **ruled R9 (s2): browser-only demo mode.** Built in s3.
2. **R4 in practice**: is a note on every tick of a next action too much? **Deferred by Richard (s2) until he has used it.**
3. ~~AC10 defaults~~ — built as proposed (example list, `localStorage`, Reset demo, an on-screen line saying it is a demo).
   He has not seen it yet: **the two s3 pictures are his to look at**.
4. **Publish the demo at `nodegx.io/templates/todo-list/`?** Like TPL-006: shipped `nodegx deploy` on the production viewer with
   `--base-url /templates/<slug>/`, then `ops/deploy.sh`. Outward-facing, so not done without him. The slug is a guess.

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

**Set up for Richard to use (his ask), localhost only:**
- Project copy: `~/vscode_projects/NodeGX test projects/Todo list` (starter assets placed, `cloudservices` →
  `{appId: todo-list, endpoint: http://localhost:8690, type: nodegx}`).
- Backend: `~/.noodl/todo-list/data`, the todo-list policy installed before first start, **ENFORCED**, persistent. Started from
  the repo with `node packages/nodegx-backend/bin/nodegx-backend.js serve --data-dir ~/.noodl/todo-list/data --port 8690
  --backend-id todo-list --backend-name "Todo list"`. Outside `~/.noodl/backends/`, so the editor's supervisor never starts a
  second copy. It is a process of the session that started it — re-run the command after a reboot.
- 🔴 **The phone half was NOT done.** Binding the backend to `0.0.0.0` (the backend's own LAN mode: sessions for data, the
  admin credential for admin) was **denied by the auto-mode classifier as "Expose Local Services"**. That is Richard's call.

**🔴 Found while deploying it: the deploy devtool gutted the list — D44, two more port families.** `deploy-from-disk.cjs`
(rebuilt from source first: the gitignored copy was 09-12, its entry 09-14) exited 0 with **24 of 628 wires dropped by the
health filter**, and the diff against the project names every one: all 18 `For Each` `itemOutput-*` / `itemOutputSignal-*`
wires into a list's `Component Outputs` (row open, up, down, close, tick, untick, describe — the whole list is inert) and 6
into `DbCollection2` (`storageFetch` ×5, `qp-taskId`). Neither family is in D44's table. The site was **not** served to
Richard and was deleted. The editor's **Run** is unaffected (it renders, it does not export); the editor's Deploy button is
still D44's unmeasured hypothesis. Recorded on D44 (owner GAM-024, P88). Also: the devtool must run with cwd
`packages/noodl-editor` (it reads `src/external/deploy/index.json` from the cwd), and it copies `nodegx.security.json` into
the site while excluding `components/` and `docs/`.

### s3 — 2026-09-14: AC10 built — the browser-only demo, derived from the template — and reopen/untick driven

**Built** as §3a: `tpl008Demo.ts` (the transform), `tpl008Template.ts` (`variant: 'demo'`, `prepareTodoDemoArtefact`, its own
START-HERE, no policy), the generator writing both. The door took the demo first time: 0 refusals, 0 warnings, 138 infos,
34 components, only `Pages/Todo` routed.

**Gate `tpl008Demo.test.ts` 18/18.** §1 byte-identical build; §2 no backend node type in the demo — **with the same rule run over
the template as its control** (it finds query, create, update and the four user nodes there); §3 **in step**: exactly the 16
declared components change, only two interfaces change (Todo data `+reset`, Header `signOut → reset`), every template record
write is a Function at the same id **with the same wires in and out** (counted against the sources' 15), every other template
node is in the demo at the same id and type less a named list of 10; §4 the store scripts against a fake browser (seed once,
changes survive, filter/order/limit, update writes only wired fields, unknown id fails and writes nothing, **storage that
throws still works**, reset) and the example list read through the template's own `Task rows`/`Selected task` scripts; §5 D71.
- 🔴 **My own count was wrong first**: I typed 16 record writes; the sources have 15. Fixed by counting the sources, not by
  changing the literal.
- **Sabotaged:** leaving `Close task`'s write unconverted reddens exactly byte-identity, the backend-type rule and the
  record-write rule (naming `ClosetaskWrite`); restored by `cp`, md5 matched.

**Drive `tpl008-todo-demo-drive.test.ts` 10/10, first run, 0 console errors**, no backend port at all, consequences read from
`localStorage`: opens on `/` with the example list in order and the notice; add → "Added at #4"; up twice → ONE "Moved #4 → #2";
close → "Closed from #3 | note"; **reopen** → bottom, "Reopened at #4 | note", note and date cleared; **untick** a seeded action →
position 3, "Unticked “List what shipped” | note"; **a reload keeps the store byte-for-byte**; Reset demo → the example list
(4/3/13); no request to `/classes|users|login|functions|__backend`, **beside a control fetch the same reading sees**.
- 🔴 **Reset had a bug the design would have shipped, and the drive is built to catch it.** The example list's ids are
  constant, and Write history remembers the last line it wrote (`todoLastHistory`) to extend it. Move an example task, reset,
  and move it again inside two minutes: the move tries to extend a line that no longer exists, `update` fails, and **no history
  line is written**. So reset also clears `todoLastHistory`. **Sabotaged:** without that step the drive reads
  `postResetMoveLines []` where `["Moved #3 → #2"]` is expected — only §7 red; restored (md5 matched), regenerated, byte-identity
  green.

**The template's own drive, 14/14 (was 12/12): reopen and untick are driven.** Untick from a ticked line (one button in it) →
`done: false`, note cleared, position 2, "Unticked “List what shipped” | note"; reopen from Done → "Reopened at #3 | note",
`closingNote` and `closedAt` cleared, back at the bottom. The helpers both drives use moved to `tests/helpers/todo-drive.ts`.

**🔴 Found on regeneration: 54 new warnings — GAM-005's rule, a peer's work in progress.** `variable-in-repeated-component`
(uncommitted, `validation/repeatedComponentVariable.ts`, 19:55 today) warned on both builds, which would have reddened gate §1's
"no warning". Measured before acting: **108 lines, 4 holder/name pairs** — `todoLastHistory` and `todoProblem` in `Logic/Write
history` (every command places it), `todoProblem` in `Move task` (×3) and `Move action` (×2). All four are app-wide on purpose:
R5's collapse *needs* the up and down placements to share the last line, and the problem banner shows one sentence. Fixed with
the rule's escape, a node comment beginning "Shared on purpose:" (constants `SHARED_LAST_LINE`, `SHARED_PROBLEM`). The template
artefact changed by exactly 14 `metadata.comment` blocks; 0 warnings on both builds again. **Not a defect** — the rule did what
it says; recorded here so GAM-005 knows a real template met it.

**Not done:** the demo was not deployed with the shipped `nodegx deploy` (production viewer, `--base-url`) nor driven from a
deployed folder; nothing published. `test:ci` / `test:main` not run.
