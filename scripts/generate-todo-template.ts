/**
 * TPL-008 — prepare the todo list as a project directory.
 *
 *     npm run template:todo
 *
 * Authored through the plan door (`create_plan` → `stage_plan_operation` →
 * `apply_plan`), the route TPL-007 took. The security policy is hand-authored
 * beside the artefact (`templates/todo-list.security.json`) and copied in last,
 * for the reason `generate-members-template.ts` gives: this script clears the
 * output directory wholesale.
 *
 * `prepareTodoArtefact` lives in `tpl008Template.ts` so the gate runs the same
 * code as this script and not a twin of it.
 */
import * as path from 'path';

import { buildTodoTemplateProject, POLICY_FILE, prepareTodoArtefact, TEMPLATE_ID } from '../packages/noodl-mcp/tests/tpl008Template';

const OUTPUT = path.join(__dirname, '..', 'templates', TEMPLATE_ID);
const POLICY_SOURCE = path.join(__dirname, '..', 'templates', `${TEMPLATE_ID}.security.json`);

(async () => {
  const built = await buildTodoTemplateProject();
  prepareTodoArtefact(built, OUTPUT, POLICY_SOURCE);

  const pages = Object.values(built.registrations).flatMap((r) => r.added);
  const start = Object.values(built.registrations).find((r) => r.startPage)?.startPage ?? '(none)';
  console.log(`wrote ${OUTPUT}`);
  console.log(`  ${built.order.length} components, pages ${pages.join(', ') || '(none)'}, start page ${start}`);
  console.log(`  policy ${POLICY_SOURCE} copied in as ${POLICY_FILE}`);

  // Printed rather than counted: a warning that never reaches `isError` is a check
  // that fired and was dropped by the caller.
  const byCode = new Map<string, number>();
  for (const d of built.diagnostics) {
    const key = `${d.severity} ${d.code}`;
    byCode.set(key, (byCode.get(key) ?? 0) + 1);
  }
  if (byCode.size === 0) {
    console.log('  no diagnostics raised on any write');
  } else {
    console.log(`  ${built.diagnostics.length} diagnostics the door raised and did not refuse over:`);
    for (const [key, count] of [...byCode.entries()].sort()) console.log(`    ${count.toString().padStart(3)} × ${key}`);
    if (process.env.TPL008_DIAG_DETAIL) {
      for (const d of built.diagnostics) console.log(`    DETAIL ${d.code} | ${d.component} | ${d.message}`);
    }
  }
})().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
