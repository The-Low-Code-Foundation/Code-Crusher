# GAM-002 — `String(n)` and `Number(s)` work inside an Expression

**Status: ⬜ not started.** **Source:** [P78 D54](../phase-78-the-templates/DEFECTS-THE-TEMPLATES-FOUND.md) · found by TPL-007 Rocket School's first drive, 2026-09-12 · **Side:** product (runtime, `Expression`)

Someone types the JavaScript they already know, `String(n)`, and the node says *"The expression threw: String is not a function"*. The node turned `String` into an input port, so `String` was `undefined` when the expression ran.

## 1. The person sentence

**Someone writes `String(n)`, `Number(s)` or `JSON.stringify(o)` in an Expression. They get the answer, and the node shows one input port for each piece of data the expression uses, and no port for anything else.**

## 2. What was measured

HEAD `eb12ebe99`.

| reading | where |
|---|---|
| `parsePorts` strips `"…"` and `'…'` strings, then treats every `[a-zA-Z_$][\w.$]*` match as an identifier. A dotted path contributes only its root. Re-read at HEAD | [`expression.ts:742-772`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L742-L772) |
| `portsToIgnore` has **30 names**: the 15 preamble maths names (`min` … `exp`), `Math`, `window`, `document`, `undefined`, `Vars`, `Variables`, `Objects`, `Arrays`, `Noodl`, `NoodlContext`, `true`, `false`, `null`, `Boolean`. **Not** `String`, `Number`, `JSON`, `Date`, `parseInt`, `parseFloat`, `isNaN`, `Array`, `Object`, `NaN`, `Infinity`, or any keyword. Re-read at HEAD | [`expression.ts:702-732`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L702-L732) |
| The compiled function takes `Object.keys(scope)` plus `Noodl` as parameters, so a name that became a port shadows the global of the same name. Every discovered input is seeded `undefined`. Re-read at HEAD | [`:384-406`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L384-L406), [`:184`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L184), [`:461`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L461) |
| 🔴 **The register's `Math` claim does not hold at HEAD.** D54 says `Math` becomes an input port. `Math` is on the ignore list (`:718`), and `Math.min` contributes only its root. So `Math.min(a, b)` mints no `Math` port and should work. That is predicted from source and not run. D54's measured error was `String(n)` alone | as above |
| Predicted from source, not run: `typeof x` mints a port named `typeof`, and a `Function` parameter named `typeof` is a SyntaxError, so the whole node reports `expression/compile-failed`. A `)` before a `.` mints the method name as a port: `(a + b).toFixed(2)` mints `toFixed`. So do identifiers inside a comment or a template literal | `:758-766`; [P85 parts-source README:40-49](../phase-85-the-component-is-the-backbone/parts-source/README.md) |
| The port description says *"every identifier in it becomes an input port"*. The catalog's parameter doc says *"standard Math functions are available (e.g. round(), abs())"*. Its two `antiPatterns` do not mention shadowing. Re-read at HEAD | [`expression.ts:429`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L429); `node-catalog-enriched.json` Expression entry, `antiPatterns` at `:9095-9098` |
| The editor gets the same scan through `updatePorts`, so it shows `String` as a port. Re-read at HEAD | [`expression.ts:774-793`](../../../packages/noodl-runtime/src/nodes/std-library/expression.ts#L774-L793) |
| Shipped surface, crude grep: 120 `"expression": "…"` strings under `library/` and `templates/`. One names a JS global, `Math.round(val)`, and `Math` is ignored. Escaped quotes can truncate a match, so this is not a census | `grep -aroh '"expression": *"[^"]*"' library templates` |
| The template's workaround: `'' + n`, bare `round(…)`. At HEAD the countdown numeral is `'' + ceil(v * limit / 100000)`, and a gate pins that exact string. Re-read at HEAD | [`tpl007Components.ts:1110`](../../../packages/noodl-mcp/tests/tpl007Components.ts), [`tpl007Template.test.ts:727`](../../../packages/noodl-mcp/tests/tpl007Template.test.ts) |

## 3. Where it bites a person

Anyone who writes ordinary JavaScript in the node sold as *"the cheapest correct answer to `price * quantity`"*: formatting a number, parsing a field, `JSON.stringify` for a debug caption, `Date.now()`. The error names the global, not the port that shadowed it, so it reads like a broken browser. Agents are hit harder, because `String(x)` is what a model writes by default.

## 4. Related work and collisions

- **P30 NDA-012 audit, row D1** ([`audit/customcode.md:66`](../phase-30-node-library-audit/audit/customcode.md), [`NODE-REGISTER.md:52`](../phase-30-node-library-audit/NODE-REGISTER.md)). The same defect, filed 2026 and **explicitly not fixed**: *"widening `portsToIgnore` changes the port set of every existing Expression node in every project, which is a migration decision, not a bug fix"*. The audit predates NDA-017, which is why it says the seed is `0`; at HEAD it is `undefined`. **No task owns the fix.** This task is that owner.
- **P85 parts-source README:40-49.** The method-chain half of the same text scan (`.trim()` after `)` mints `trim`). P85 avoided it by using a Function node. This task's scan change should close it or say why not.
- **P61 FUN-009** (built, `ace5232f3`). The editor's `codenotation: 'expression'`, and the note that Expression's scoping rule is the inverse of Function's. Adjacent. A new ignore list must stay in step with what FUN-009's completion offers.
- Grep run: `grep -anl "portsToIgnore" -r dev-docs/tasks` and `grep -anl "String is not a function\|every identifier" -r dev-docs/tasks`. Other hits (P73 TUT-004, P42, P57) are about different errors.

## 5. Design

| option | what it does | trade |
|---|---|---|
| **A. Widen the list** | add the JS globals (`String`, `Number`, `JSON`, `Date`, `parseInt`, `parseFloat`, `isNaN`, `isFinite`, `Array`, `Object`, `NaN`, `Infinity`, `encodeURIComponent`, …) and the operator keywords (`typeof`, `instanceof`, `new`, `in`, `void`) | smallest change. 🔴 Any saved project with a **wired** port named, say, `Date` loses that port and its connection dangles. That is the migration the audit refused |
| **B. Parse for free variables** | a real parse instead of the regex: strings, template literals, comments, member names after `)` and keywords all fall out | closes P85's half too. Needs a parser in the runtime bundle (check what `expression-evaluator` already uses before adding one). The same migration question as A for globals |
| **C. Pass a global-named port only when it has a value** | keep minting ports, but compile a port named like a global as a parameter only when something is wired to it | no migration. 🔴 A name means different things depending on wiring, invisibly |
| **D. Say so** | node docs, port description and catalog `antiPatterns` name what is shadowed, plus an editor diagnostic for an identifier that shadows a JS global | changes no behaviour, and leaves `String(n)` broken |

🔒 **Richard: may an Expression stop offering a port whose name is a JavaScript global (A or B), given that a saved project wired to such a port would lose the wire? Or must existing ports survive (C, or D only)?** Nothing is built until this is answered. The blast-radius AC below gives him the count.

> 🔒 **Ruled, 2026-09-14 (session 1): yes.** Expressions stop minting ports for JavaScript globals and keywords. Any
> saved project wired to such a port is migrated. — Richard, choosing that over "only if the census counts zero", C, and D
>
> The build: B (a real free-variable parse) if the runtime bundle already carries a parser, otherwise A. AC3's census still
> runs first. A non-zero count means a migration is written for every hit, not a return to Richard.

**Do not** make the port set depend on the environment (`typeof globalThis[name]`). The browser, the cloud runtime and the editor would disagree about which ports a node has.

## 6. Acceptance criteria

| AC | clause |
|---|---|
| AC1 | **RED at HEAD, recorded in §8.** A runtime spec: `String(n)` with `n = 5` raises `expression/threw` "String is not a function". Known-firing control in the same file: `'' + n` gives `"5"`. Also recorded, pass or fail: `Math.min(a, b)` (predicted to work at HEAD, which is the register correction) and `typeof n` (predicted `compile-failed`) |
| AC2 | After the ruled change, `String(n)`, `Number(s)`, `JSON.stringify(o)`, `parseInt(s)` and `Date.now() - t` evaluate, and each node's registered inputs are exactly its data identifiers (`[n]`, `[s]`, `[o]`, `[s]`, `[t]`). **Sabotage arm:** restore the old list or scan, and AC2 goes RED |
| AC3 | **Blast radius, measured before landing.** For every Expression in `library/`, `templates/`, `project-examples/` and both render corpora: the port set before and after, and **every connection whose target port disappears**. The count goes to Richard with the 🔒. Zero, or each one migrated as ruled |
| AC4 | **Editor, driven.** Type `String(n)` into an Expression. The port panel shows only `n` and the preview shows the value. Wiring `n` updates it. A console listener attached before the drive has a known-firing signal and records no `expression/threw` |
| AC5 | Whatever the ruling leaves unavailable is named in the port description and the catalog `antiPatterns`, and a spec asserts each is present (the text, not only that the field exists) |
| AC6 | **Workaround.** Say whether Rocket School's `'' + …` sites can return to `String(…)`. If they are changed, regenerate, run the template gate (`tpl007Template.test.ts:727` pins the string) and drive `drive-rkt007-boost.js`. If they are kept, write why in the gate's comment |
| AC7 | If option A or B lands, P85's method-chain case (`(first + ' ' + last).trim()`) mints only `first` and `last`, or §8 records why it was left |

## 7. Traps

- 🔴 **`compiledFunctionsCache` is module-level** (`expression.ts:700`), keyed by expression plus parameter names. A sabotage arm in the same jest module can pass on a cached function from the previous arm. Isolate the module per arm.
- `Math.min` was never broken (§2). A fix graded on it grades nothing.
- The editor's port list comes from `updatePorts`, which runs only when `isRunningLocally()` (`:839`). A runtime-only spec cannot see what the editor shows, which is why AC4 exists.
- The cloud runtime is a second host for this node. Run AC2's arms there too, or record that it was not run.
- Do not bump a literal count in any port-count gate. Count the artefact.

## 8. Record

Not started.
