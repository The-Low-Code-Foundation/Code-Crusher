/**
 * TPL-008 — what the todo list's two drives do to a page: find a button beside some
 * words, click words, wait for a reading. One copy, for the template's drive against a
 * backend and the demo's drive against the browser alone.
 *
 * @module nodegx-backend/tests/helpers/todo-drive
 */
import { clickAt } from './members-drive';
import type { RenderedPage } from './site-drive';

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Read until `ok`, or throw with the last reading — so a step that stops says what it last saw. */
export async function until<T>(label: string, read: () => Promise<T>, ok: (v: T) => boolean, ms = 20_000): Promise<T> {
  const deadline = Date.now() + ms;
  let last: T = await read();
  while (!ok(last)) {
    if (Date.now() > deadline) throw new Error(`${label}: gave up after ${ms}ms; last reading ${JSON.stringify(last)}`);
    await wait(300);
    last = await read();
  }
  return last;
}

export const text = async (page: RenderedPage): Promise<string> => String(await page.evaluate('document.body.innerText'));
export const pathname = async (page: RenderedPage): Promise<string> => String(await page.evaluate('location.pathname'));

/**
 * The Nth button in the smallest element around a piece of text that holds
 * exactly `count` buttons — a task row holds three (up, down, close), an open next
 * action's line holds three (tick, up, down), a ticked one holds one (tick). Scrolled
 * into view, then clicked as a real pointer press.
 */
export async function clickButtonBeside(page: RenderedPage, label: string, count: number, index: number): Promise<void> {
  const found = String(
    await page.evaluate(`(function () {
      var want = ${JSON.stringify(label)};
      var leaves = Array.prototype.filter.call(document.querySelectorAll('body *'), function (e) {
        return e.children.length === 0 && (e.textContent || '').trim() === want;
      });
      for (var i = 0; i < leaves.length; i++) {
        for (var el = leaves[i].parentElement; el; el = el.parentElement) {
          var bs = el.querySelectorAll('button');
          if (bs.length === 0) continue;
          if (bs.length !== ${count}) break;
          var b = bs[${index}];
          b.scrollIntoView({ block: 'center', behavior: 'instant' });
          var r = b.getBoundingClientRect();
          return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2, disabled: !!b.disabled });
        }
      }
      return 'absent:' + leaves.length;
    })()`)
  );
  if (found.startsWith('absent')) throw new Error(`no ${count}-button element around "${label}" (${found})`);
  const at = JSON.parse(found) as { x: number; y: number; disabled: boolean };
  if (at.disabled) throw new Error(`button ${index} beside "${label}" is disabled`);
  await clickAt(page, at.x, at.y);
}

/** Click the words themselves — a task title opens it, a next action's title folds out its description. */
export async function clickWords(page: RenderedPage, words: string): Promise<void> {
  const found = String(
    await page.evaluate(`(function () {
      var want = ${JSON.stringify(words)};
      var el = Array.prototype.filter.call(document.querySelectorAll('body *'), function (e) {
        return e.children.length === 0 && (e.textContent || '').trim() === want;
      })[0];
      if (!el) return 'absent';
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      var r = el.getBoundingClientRect();
      return JSON.stringify({ x: r.left + Math.min(20, r.width / 2), y: r.top + r.height / 2 });
    })()`)
  );
  if (found === 'absent') throw new Error(`no element reads "${words}"`);
  const at = JSON.parse(found) as { x: number; y: number };
  await clickAt(page, at.x, at.y);
}

/** The button inside the smallest element that also holds the field with this placeholder. */
export async function clickButtonByField(page: RenderedPage, buttonLabel: string, placeholder: string): Promise<void> {
  const found = String(
    await page.evaluate(`(function () {
      var field = Array.prototype.filter.call(document.querySelectorAll('input, textarea'), function (i) {
        return (i.getAttribute('placeholder') || '').indexOf(${JSON.stringify(placeholder)}) === 0;
      })[0];
      if (!field) return 'no field';
      for (var el = field.parentElement; el; el = el.parentElement) {
        var b = Array.prototype.filter.call(el.querySelectorAll('button'), function (x) {
          return (x.innerText || '').trim() === ${JSON.stringify(buttonLabel)};
        })[0];
        if (!b) continue;
        b.scrollIntoView({ block: 'center', behavior: 'instant' });
        var r = b.getBoundingClientRect();
        return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      return 'no button';
    })()`)
  );
  if (!found.startsWith('{')) throw new Error(`"${buttonLabel}" beside "${placeholder}": ${found}`);
  const at = JSON.parse(found) as { x: number; y: number };
  await clickAt(page, at.x, at.y);
}

export async function blur(page: RenderedPage): Promise<void> {
  await page.evaluate('(function () { if (document.activeElement) document.activeElement.blur(); return true; })()');
  await wait(800);
}

/** Whether the LAST button with this label is disabled — or `'absent'` when there is none. */
export const buttonDisabled = async (page: RenderedPage, label: string): Promise<unknown> =>
  page.evaluate(`(function () {
    var b = Array.prototype.filter.call(document.querySelectorAll('button'), function (x) {
      return (x.innerText || '').trim() === ${JSON.stringify(label)};
    });
    return b.length === 0 ? 'absent' : b[b.length - 1].disabled;
  })()`);
