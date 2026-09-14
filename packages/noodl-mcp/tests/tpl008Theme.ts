/**
 * TPL-008 — the look of the todo list, and nothing else.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * ## Plain on purpose
 *
 * Richard, reviewing the first mockup (2026-09-14): *"The style looks like it's
 * trying too hard for what the app actually is, can you clean and simplify it
 * please? Less font sizes, colours, distracting elements."* The second mockup is
 * what he approved, and this file is that mockup's palette, token for token:
 *
 * - one faintly warm grey ground, white surfaces, near-black text, one grey for
 *   everything secondary;
 * - **one** accent (a calm blue) for the primary button and a ticked box;
 * - red **only** for an overdue deadline and a write that did not save.
 *
 * 🔴 **Three type sizes and no more**: `--text-sm` for meta, `--text-base` for
 * everything a person reads, `--text-xl` for the two titles. `tpl008Template.test.ts`
 * counts the distinct `fontSize` values in the artefact and fails on a fourth.
 *
 * ⚠️ Starts from `minimal` — the shipped preset `tpl001Theme.ts` measured as
 * passing AA on its own primary button — and overrides the grounds, so every
 * ratio the preset was measured at is re-measured by the gate from these tokens.
 *
 * @module noodl-mcp/tests/tpl008Theme
 */
import { buildStyleVocabulary } from '../src/editor-deps';

export const TPL008_PRESET = 'minimal';

export const TPL008_TOKENS: ReadonlyArray<{ name: string; value: string }> = [
  { name: '--background', value: '#f5f5f3' },
  { name: '--foreground', value: '#1d1f21' },
  { name: '--surface', value: '#ffffff' },
  { name: '--surface-raised', value: '#ffffff' },
  { name: '--muted', value: '#ecedea' },
  { name: '--muted-foreground', value: '#5f6469' },
  { name: '--primary', value: '#2f5bc8' },
  { name: '--primary-hover', value: '#2749a3' },
  { name: '--primary-foreground', value: '#ffffff' },
  { name: '--ring', value: '#2f5bc8' },
  { name: '--destructive', value: '#b3261e' },
  { name: '--destructive-hover', value: '#8f1e18' },
  { name: '--destructive-foreground', value: '#ffffff' },
  { name: '--secondary', value: '#ecedea' },
  { name: '--secondary-hover', value: '#e2e3df' },
  { name: '--secondary-foreground', value: '#1d1f21' },
  { name: '--accent', value: '#e8eefb' },
  { name: '--accent-foreground', value: '#2749a3' },
  { name: '--border', value: '#e1e2df' },
  { name: '--border-subtle', value: '#e9eae7' },
  { name: '--border-strong', value: '#c9cbc6' },
  { name: '--border-control', value: '#7b8085' },
  { name: '--radius-sm', value: '4px' },
  { name: '--radius-md', value: '6px' },
  { name: '--radius-lg', value: '8px' },
  { name: '--radius-xl', value: '8px' },
  { name: '--radius-2xl', value: '10px' },
  { name: '--font-sans', value: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }
];

/**
 * The pairs this template actually draws, recomputed by the gate from
 * {@link TPL008_TOKENS}. `floor` is WCAG AA: 4.5 for text, 3 for a control's edge.
 */
export const CONTRAST_PAIRS: ReadonlyArray<{ fg: string; bg: string; floor: number }> = [
  { fg: '--foreground', bg: '--background', floor: 4.5 },
  { fg: '--foreground', bg: '--surface', floor: 4.5 },
  { fg: '--muted-foreground', bg: '--background', floor: 4.5 },
  { fg: '--muted-foreground', bg: '--surface', floor: 4.5 },
  { fg: '--muted-foreground', bg: '--muted', floor: 4.5 },
  { fg: '--primary-foreground', bg: '--primary', floor: 4.5 },
  { fg: '--primary', bg: '--surface', floor: 4.5 },
  { fg: '--destructive', bg: '--background', floor: 4.5 },
  { fg: '--destructive', bg: '--surface', floor: 4.5 },
  { fg: '--border-control', bg: '--background', floor: 3 },
  { fg: '--border-control', bg: '--surface', floor: 3 }
];

export const VOCABULARY = buildStyleVocabulary({ getMetaData: () => undefined });

const requested = new Set<string>();

/** Every composition id this template asked for — recorded, not listed. */
export function requestedCompositions(): string[] {
  return [...requested].sort();
}

/** One composition's parameters, by id. Throws on an unknown id, naming the ones that exist. */
export function composition(id: string): Record<string, unknown> {
  requested.add(id);
  const found = (VOCABULARY.compositions as Array<{ id: string; parameters: Record<string, unknown> }>).find(
    (c) => c.id === id
  );
  if (!found) {
    const known = (VOCABULARY.compositions as Array<{ id: string }>).map((c) => c.id).join(', ');
    throw new Error(`No style composition "${id}". The vocabulary has: ${known}`);
  }
  return { ...found.parameters };
}
