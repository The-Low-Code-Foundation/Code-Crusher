/**
 * GAM-012 — a field focused as its row appears has the cursor, every time.
 *
 * AC1 (a browser, keyboard only, and RKT-003's own build 4) found the viewer's focus tracker wrong
 * in three ways at once. A Focus that did nothing was recorded, a recorded node was never focused
 * again, and Blur was inverted and spliced the list's last entry. See GAM-012 §8.
 *
 * 🔒 R13 decides what "right" is: a Focus to a mounted field focuses it every time, and a Focus to
 * one that is not mounted fails, is not held, and is told to the builder in the editor only.
 *
 * ## Real tracker, fake nodes, and every refusal beside an acceptance
 *
 * The corpus harness (`erg-001-visual-outcomes.test.ts`) stubs `setNodeFocused` to a no-op, which is
 * why nothing caught this. Here the tracker is the shipped class. Nodes are small fakes that record
 * what the tracker asked of them, because the question is what the tracker asks. The browser half,
 * `document.activeElement`, is graded by the AC2 drive.
 *
 * @module noodl-viewer-react/tests/gam-012-focus-tracker
 */

// `node-shared-port-definitions` reads the viewer's `Noodl` global at import time.
(globalThis as unknown as Record<string, unknown>).Noodl = { deployed: false };

import { FocusTracker, FocusTrackedNode } from '../src/focus-tracker';
import TextInputModule from '../src/nodes/controls/text-input';

interface Fake extends FocusTrackedNode {
  name: string;
  calls: string[];
  mounted: boolean;
  hasFocus: boolean;
  parent?: Fake;
}

/** A field: backed by an element, so it can say whether it is mounted and whether it holds focus. */
function field(name: string, parent?: Fake): Fake {
  const f: Fake = {
    name,
    calls: [],
    mounted: true,
    hasFocus: false,
    parent,
    _focus() {
      f.calls.push('focus');
      if (f.mounted) f.hasFocus = true;
    },
    _blur() {
      f.calls.push('blur');
      f.hasFocus = false;
    },
    contains: (node) => (node as Fake).parent === f,
    _canFocus: () => f.mounted,
    _hasFocus: () => f.hasFocus
  };
  return f;
}

/** A Group: no element focus of its own, so it declares neither hook. */
function group(name: string): Fake {
  const g: Fake = {
    name,
    calls: [],
    mounted: true,
    hasFocus: false,
    _focus: () => g.calls.push('focus'),
    _blur: () => g.calls.push('blur'),
    contains: (node) => (node as Fake).parent === g
  };
  return g;
}

describe('GAM-012 fault 1 — a Focus to a field that is not mounted fails and is not recorded (R13)', () => {
  it('returns false, asks nothing of the field, blurs nobody and lists nothing', () => {
    const t = new FocusTracker();
    const other = field('other');
    t.setNodeFocused(other, true);
    const f = field('answer');
    f.mounted = false;

    expect(t.setNodeFocused(f, true)).toBe(false);
    expect(f.calls).toEqual([]);
    expect(other.calls).toEqual(['focus']);
    expect(t.nodes).toEqual([other]);
  });

  it('the same field, mounted, is focused and listed (the acceptance beside the refusal)', () => {
    const t = new FocusTracker();
    const f = field('answer');
    expect(t.setNodeFocused(f, true)).toBe(true);
    expect(f.calls).toEqual(['focus']);
    expect(t.nodes).toEqual([f]);
  });

  it("build 4's shape: a Focus before mount, then one on didMount, puts the cursor in the field", () => {
    const t = new FocusTracker();
    const f = field('qbInput');
    f.mounted = false;
    expect(t.setNodeFocused(f, true)).toBe(false); // qbNew.valueChanged, before the row mounts
    f.mounted = true;
    expect(t.setNodeFocused(f, true)).toBe(true); // qbTyped.didMount
    expect(f.hasFocus).toBe(true);
  });
});

describe('GAM-012 fault 2 — a listed field that no longer holds focus is focused again', () => {
  it('after a remount, a second Focus reaches the field', () => {
    const t = new FocusTracker();
    const f = field('answer');
    t.setNodeFocused(f, true);
    f.hasFocus = false; // the row remounted: a new element, and focus went to body
    t.setNodeFocused(f, true);
    expect(f.calls).toEqual(['focus', 'focus']);
    expect(f.hasFocus).toBe(true);
    expect(t.nodes).toEqual([f]);
  });

  it('a field that still holds focus is not focused twice', () => {
    const t = new FocusTracker();
    const f = field('answer');
    t.setNodeFocused(f, true);
    t.setNodeFocused(f, true);
    expect(f.calls).toEqual(['focus']);
  });

  it("a Group, which cannot say, keeps today's behaviour: a repeated Focus does not re-send Focused", () => {
    const t = new FocusTracker();
    const g = group('panel');
    t.setNodeFocused(g, true);
    t.setNodeFocused(g, true);
    expect(g.calls).toEqual(['focus']);
  });
});

describe("GAM-012 fault 3 — Blur is HEAD's, because multi-select's Dropdown leans on it (§8, AC5)", () => {
  /**
   * The Dropdown's opening click lands on its "Border neutral" overlay, so the click lists the
   * overlay and the root around it. The state change unmounts the overlay, whose `Group.tsx` unmount
   * sends a Blur. A correction that blurred the tracked overlay's containers fired the root's
   * `Focus Lost`, and the sheet closed 20ms after it opened, in a browser. This pins what keeps it
   * open. It does not pin HEAD's other Blur behaviour as correct; see the todo below.
   */
  it('a clicked child Group that unmounts does not blur the Group around it', () => {
    const t = new FocusTracker();
    const root = group('root');
    const border = group('borderNeutral');
    border.parent = root;
    t.onClickCapture({ noodlNode: border, parentNode: { noodlNode: root, parentNode: null } });
    expect(root.calls).toEqual(['focus']); // the click reached the root: the known-firing half

    t.setNodeFocused(border, false); // the overlay unmounts as the sheet opens

    expect(root.calls).toEqual(['focus']);
  });

  it.todo(
    'fault 3 proper: an unmount drops the node and fires nothing, and an explicit Blur acts only on the node it names (split the two first)'
  );

  it('a field focused outside the tracker (Tab) is still blurred by its Blur', () => {
    const t = new FocusTracker();
    const f = field('answer');
    f.hasFocus = true;
    t.setNodeFocused(f, false);
    expect(f.calls).toEqual(['blur']);
    expect(f.hasFocus).toBe(false);
  });

  it("arm K's order: after rowB's unmount Blur, fieldB's next Focus still lands", () => {
    const t = new FocusTracker();
    const fieldB = field('fieldB');
    const fieldD = field('fieldD');
    t.setNodeFocused(fieldB, true);
    t.setNodeFocused(fieldD, true); // fieldD last, as at boot in AC1's page
    fieldB.hasFocus = false;
    t.setNodeFocused(group('rowB'), false);
    t.setNodeFocused(fieldB, true);
    expect(fieldB.hasFocus).toBe(true);
  });
});

describe('GAM-012 — a click still rebuilds the list (unchanged)', () => {
  it('focuses the clicked ancestors that were not listed and blurs the rest', () => {
    const t = new FocusTracker();
    const stale = group('stale');
    t.setNodeFocused(stale, true);
    const outer = group('outer');
    const target = { noodlNode: undefined, parentNode: { noodlNode: outer, parentNode: null } };
    t.onClickCapture(target);
    expect(stale.calls).toEqual(['focus', 'blur']);
    expect(outer.calls).toEqual(['focus']);
    expect(t.nodes).toEqual([outer]);
  });
});

describe("GAM-012 — Text Input's own Focus, through the real tracker (R13: the builder is told in the editor)", () => {
  const def = TextInputModule.node as never as {
    inputs: Record<string, { valueChangedToTrue(this: unknown): void }>;
    outputs: Record<string, { description?: string }>;
    methods: Record<string, (this: unknown) => unknown>;
  };

  function textInput(ref: { focus(): void; blur(): void; hasFocus(): boolean } | null) {
    const tracker = new FocusTracker();
    const reported: string[] = [];
    const diagnostics: Array<[string, string | null | undefined]> = [];
    const node: Record<string, unknown> = {
      innerReactComponentRef: ref,
      contains: () => false,
      context: { setNodeFocused: (n: FocusTrackedNode, focused: boolean) => tracker.setNodeFocused(n, focused) },
      beginOutcome: () => ({}),
      reportOutcome: (_token: unknown, outcome: string) => reported.push(outcome),
      setDiagnostic: (key: string, message?: string | null) => diagnostics.push([key, message])
    };
    for (const [name, fn] of Object.entries(def.methods)) node[name] = fn.bind(node);
    return { node, tracker, reported, diagnostics };
  }

  it('not mounted: reports Unchanged, sets a diagnostic, records nothing', () => {
    const { node, tracker, reported, diagnostics } = textInput(null);
    def.inputs.focus.valueChangedToTrue.call(node);
    expect(reported).toEqual(['unchanged']);
    expect(tracker.nodes).toEqual([]);
    const [key, message] = diagnostics[diagnostics.length - 1];
    expect(key).toBe('focus/not-mounted');
    expect(message).toMatch(/not on the page/);
  });

  it('mounted: reports Done, focuses the element, and clears the diagnostic', () => {
    let focused = false;
    const ref = { focus: () => (focused = true), blur: () => (focused = false), hasFocus: () => focused };
    const { node, reported, diagnostics } = textInput(ref);
    def.inputs.focus.valueChangedToTrue.call(node);
    expect(reported).toEqual(['done']);
    expect(focused).toBe(true);
    expect(diagnostics[diagnostics.length - 1]).toEqual(['focus/not-mounted', null]);
  });

  it('Unchanged says a Focus can land there', () => {
    expect(def.outputs.unchanged.description).toMatch(/Focus/);
  });
});
