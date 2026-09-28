#!/usr/bin/env node
/**
 * Bundle budget check. Budgets: .claude/architecture.md §8.
 *
 * Why this exists rather than a size-limit glob: Turbopack names chunks with
 * opaque content hashes. A glob like `3d_*.js` matched the 3D chunk exactly
 * once, by coincidence, and silently stopped matching on the next build — which
 * made the "initial route" budget swallow the 3D chunk and fail at 366 kB.
 *
 * The 3D chunk is therefore identified by what is IN it, not by its name.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { brotliCompressSync, constants } from 'node:zlib';
import { join } from 'node:path';

const CHUNKS = 'out/_next/static/chunks';
const BUDGET_INITIAL_KB = 180;
const BUDGET_3D_KB = 320;

/** Markers that only appear in the three.js / R3F bundle. */
const THREE_MARKERS = ['InstancedMesh', 'WebGLRenderer', 'BufferGeometry'];

function brotli(buffer) {
  return brotliCompressSync(buffer, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (entry.endsWith('.js')) out.push(path);
  }
  return out;
}

const files = walk(CHUNKS);
if (!files.length) {
  console.error(`No chunks found in ${CHUNKS}. Run \`pnpm build\` first.`);
  process.exit(1);
}

let initial = 0;
let threeD = 0;
const threeDFiles = [];

for (const file of files) {
  const buffer = readFileSync(file);
  const text = buffer.toString('utf8');
  const isThree = THREE_MARKERS.every((m) => text.includes(m));
  const size = brotli(buffer);
  if (isThree) {
    threeD += size;
    threeDFiles.push(file);
  } else {
    initial += size;
  }
}

const kb = (n) => (n / 1024).toFixed(1);
const initialKb = initial / 1024;
const threeDKb = threeD / 1024;

console.log('Bundle budget (brotli)\n');
console.log(`  initial route JS   ${kb(initial).padStart(7)} KB / ${BUDGET_INITIAL_KB} KB`);
console.log(`  3D chunk (lazy)    ${kb(threeD).padStart(7)} KB / ${BUDGET_3D_KB} KB`);
if (threeDFiles.length) {
  console.log(`\n  3D chunk identified by content: ${threeDFiles.map((f) => f.split('/').pop()).join(', ')}`);
} else {
  console.log('\n  No 3D chunk found — the scene is not in this build.');
}

const failures = [];
if (initialKb > BUDGET_INITIAL_KB) {
  failures.push(`initial route JS is ${kb(initial)} KB, over the ${BUDGET_INITIAL_KB} KB budget`);
}
if (threeDKb > BUDGET_3D_KB) {
  failures.push(`3D chunk is ${kb(threeD)} KB, over the ${BUDGET_3D_KB} KB budget`);
}

if (failures.length) {
  console.error('\nFAIL');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\nOK');
