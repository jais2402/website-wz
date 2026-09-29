#!/usr/bin/env node
/**
 * Writes public/llms.txt from content/site.json.
 *
 * A plain-text summary for AI answer engines. Generated, never hand-written,
 * so it cannot drift from the page — every line here is copy that already
 * renders in the DOM. No business fact is added: the five null slots in
 * meta.TODO_business_facts stay out of it.
 *
 * Adoption by the engines is unconfirmed; this is cheap, not proven.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
const section = (id) => site.sections.find((s) => s.id === id);
const faq = section('faq');
const build = section('build');

const lines = [
  `# ${site.meta.name}`,
  '',
  `> ${site.meta.description}`,
  '',
  '## What we build',
  '',
  ...build.items.map((i) => `- ${i.title}: ${i.body}`),
  '',
  '## Questions',
  '',
  ...faq.items.flatMap((i) => [`### ${i.q}`, '', i.a, '']),
  '## Pages',
  '',
  '- /: what we build, how we work, pricing approach, questions, contact',
  '- /capabilities/: each kind of system in full',
  '- /work/: case studies with measured outcomes',
  '',
  '## Contact',
  '',
  `${site.meta.email} — "${site.nav.cta.label}"`,
  '',
];

writeFileSync(join(root, 'public/llms.txt'), lines.join('\n'));
console.log('Wrote public/llms.txt');
