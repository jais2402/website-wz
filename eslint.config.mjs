import next from 'eslint-config-next';

/** Atomic design is enforced here: imports only ever travel upward. */
const atomicBoundaries = (level, forbidden) => ({
  files: [`src/components/${level}/**`],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: forbidden.map((f) => ({
        group: [`**/components/${f}/**`, `@/components/${f}/*`],
        message: `${level} may not import ${f}. Content and composition flow downward only — see .claude/architecture.md §2.`,
      })),
    }],
  },
});

const config = [
  { ignores: ['out/**', '.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...next,
  atomicBoundaries('atoms', ['molecules', 'organisms', 'templates']),
  atomicBoundaries('molecules', ['organisms', 'templates']),
  atomicBoundaries('organisms', ['templates']),
  {
    // Only pages and templates may read the content file.
    files: ['src/components/{atoms,molecules,organisms}/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@content/*', '**/content/site.json'],
          message: 'Content enters at the page and flows down as props.' }],
      }],
    },
  },
  {
    // eslint-config-next registers @typescript-eslint for TS files only, so
    // this rule is scoped to match — applying it repo-wide fails on .mjs.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    rules: {
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Build scripts are CLIs: stdout is how they report. 
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
