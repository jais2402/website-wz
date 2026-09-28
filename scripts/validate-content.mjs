#!/usr/bin/env node
/**
 * Fails the build on a bad content file.
 * Runs in CI and in `pnpm verify`. See .claude/standards.md §6.
 */
import { readFileSync } from 'node:fs';

const content = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));

const PLACEHOLDER = /(\[[^\]]{3,}\]|Lorem ipsum|TODO:|TBD\b)/;
const problems = [];

function walk(node, path) {
  if (typeof node === 'string') {
    if (PLACEHOLDER.test(node)) problems.push(`placeholder text at ${path}: ${JSON.stringify(node.slice(0, 80))}`);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      // The TODO_business_facts block is the one place nulls are expected.
      if (k === 'TODO_business_facts' || k === 'note') continue;
      walk(v, `${path}.${k}`);
    }
  }
}

walk(content, 'site');

// Anchors are public URLs.
const ids = new Set();
for (const section of content.sections ?? []) {
  if (!/^[a-z][a-z0-9-]*$/.test(section.id)) problems.push(`section id not URL-safe: ${section.id}`);
  if (ids.has(section.id)) problems.push(`duplicate section id: ${section.id}`);
  ids.add(section.id);
}

// Testimonials must not be enabled while empty.
if (content.testimonials?.enabled && !(content.testimonials.items ?? []).length) {
  problems.push('testimonials.enabled is true but items is empty — this is exactly the failure the study found');
}

if (problems.length) {
  console.error('Content validation failed:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`Content OK: ${content.sections.length} sections, ${content.cases.length} cases.`);
