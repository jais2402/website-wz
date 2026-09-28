import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Join class names, resolving Tailwind conflicts so the LAST one wins.
 *
 * Every component here takes a `className` prop as the supported way to adjust
 * it. A plain join makes that prop unreliable: `cn('inline-flex', 'hidden')`
 * emits both, and CSS source order — not intent — decides which applies. That
 * is a silent failure, and it was one: the header CTA stayed visible at 390px
 * despite `hidden sm:inline-flex`.
 *
 * The custom groups below teach tailwind-merge this project's tokens, so
 * `text-d1` (a size) and `text-ink` (a colour) are not mistaken for each other
 * — see .claude/design.md §1.4.
 */
export const cn = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['d1', 'd2', 'statement', 'fig', 'lead', 'meta', 'callout'] },
      ],
      'text-color': [
        {
          text: [
            'ink',
            'ink-2',
            'ink-3',
            'ground',
            'blueprint',
            'blueprint-t',
            'pine',
            'pine-t',
            'ochre',
            'ochre-t',
            'plum',
            'plum-t',
            'rose',
            'rose-t',
            'signal',
            'signal-t',
            'wordmark',
            'on-brand',
            'act-d',
          ],
        },
      ],
    },
  },
});
