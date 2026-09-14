/**
 * The viewer's focus tracker: which Noodl nodes hold focus, for the ones the browser cannot say.
 *
 * A Group is not natively focusable, so its `Focused` / `Focus Lost` signals come from here. A
 * click walks the clicked element's ancestors ({@link FocusTracker.onClickCapture}), and a `Focus`
 * / `Blur` action reaches {@link FocusTracker.setNodeFocused}.
 *
 * ## GAM-012 — three faults, and the ruling that shaped the fix
 *
 * This lived inline in `viewer.jsx`, and P87's play test found a Text Input that took the cursor
 * on the first question and never again. AC1 measured three faults acting together:
 *
 * 1. A Focus that did nothing was recorded as done. A Text Input's `_focus` returns silently
 *    before the field has mounted, and the node was pushed onto the list anyway.
 * 2. A recorded node was never focused again. The later Focus, sent once the field existed, was
 *    skipped because the node was already listed, and nothing ever checked whether it still had
 *    focus.
 * 3. The Blur branch was inverted. It returned early for a node it tracked. For one it did not, it
 *    called `_blur()` and then `splice(-1, 1)`, removing the list's LAST entry, some other node. A
 *    Group sends a Blur on every unmount (`Group.tsx`), so this fired constantly. On a simple page
 *    it happened to remove the stale field and hide fault 2, and on others it removed the wrong node.
 *
 * Faults 1 and 2 are fixed here. Fault 3 is kept, with the reason, at the Blur branch below.
 *
 * 🔒 R13 (Richard, 2026-09-14): *"if the input is mounted, you focus, it focusses, otherwise it's
 * not mounted and the focus signal fails and that's the end of the story"*. So a Focus is **not
 * held** until the node mounts, because that would take focus later, after the person has moved on.
 * The caller learns it failed from the return value and tells the builder in the editor.
 *
 * @module noodl-viewer-react/focus-tracker
 */

/** What the tracker needs from a node. The two optional hooks are for nodes backed by a real element. */
export interface FocusTrackedNode {
  _focus(): void;
  _blur(): void;
  contains(node: FocusTrackedNode): boolean;
  /** False when there is nothing on the page to focus. Absent means the node can always "focus" (a Group). */
  _canFocus?(): boolean;
  /** Whether the node's element really holds focus. Absent means the tracker's list is the only truth. */
  _hasFocus?(): boolean;
}

export class FocusTracker {
  nodes: FocusTrackedNode[] = [];

  reset(): void {
    this.nodes = [];
  }

  /**
   * @returns `false` only when a Focus could not act because the node is not mounted (R13). Every
   * other call returns `true`.
   */
  setNodeFocused(node: FocusTrackedNode, focused: boolean): boolean {
    const index = this.nodes.indexOf(node);

    if (focused) {
      // Fault 1: check before touching anything. A failed Focus blurs nobody and records nothing.
      if (node._canFocus && !node._canFocus()) return false;

      if (index !== -1) {
        // Fault 2: listed is not the same as focused. A remounted field is a new element, and the
        // person may have tabbed away. A node that can say so is focused again. A Group cannot, and
        // keeps today's behaviour of not re-sending `Focused`.
        if (node._hasFocus && !node._hasFocus()) node._focus();
        return true;
      }

      // Blur nodes that don't contain this new node
      this.nodes.filter((focusedNode) => !focusedNode.contains(node)).forEach((blurredNode) => blurredNode._blur());
      node._focus();
      this.nodes.push(node);
      return true;
    }

    // ⚠️ Fault 3 is NOT fixed, deliberately: this is HEAD's Blur, unchanged, because a shipped prefab
    // leans on it. Measured, not preferred (GAM-012 §8, AC5). A first correction ("blur the tracked
    // node and its containers, splice its own index") broke multi-select's Dropdown. Its opening
    // click lists the "Border neutral" overlay and every ancestor. The state change unmounts that
    // overlay, and `Group.tsx`'s unmount Blur then blurred the Dropdown's root, whose `Focus Lost`
    // closed the sheet 20ms after it opened. HEAD's early return for a tracked node is what keeps
    // it open.
    //
    // The real fault is that an unmount and an explicit Blur arrive through the same call and need
    // different answers. An unmount should drop the node and fire nothing; a Blur should blur the
    // node it names. Split those first, then fix this branch. Faults 1 and 2 carry the person
    // sentence without it: a listed field is re-focused whatever this branch left in the list.
    if (index !== -1) return true;

    node._blur();

    //also blur nodes that contain this node
    this.nodes.filter((focusedNode) => focusedNode.contains(node)).forEach((blurredNode) => blurredNode._blur());

    this.nodes.splice(index, 1);
    return true;
  }

  /** A click focuses the Noodl nodes it landed inside and blurs the rest. Unchanged by GAM-012. */
  onClickCapture(target: unknown): void {
    const clicked: FocusTrackedNode[] = [];

    // Walk up the DOM tree and collect all Noodl nodes
    let elem = target as { noodlNode?: FocusTrackedNode; parentNode?: unknown } | null;
    while (elem) {
      if (elem.noodlNode && elem.noodlNode._focus) clicked.push(elem.noodlNode);
      elem = elem.parentNode as typeof elem;
    }

    // Blur nodes that weren't part of this click
    this.nodes.filter((node) => clicked.indexOf(node) === -1).forEach((node) => node._blur());

    // Focus all new focused nodes
    clicked.filter((node) => this.nodes.indexOf(node) === -1).forEach((node) => node._focus());

    this.nodes = clicked;
  }
}
