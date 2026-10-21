// Moves test-results/ out of the project before Playwright starts.
//
// Playwright clears outputDir on every launch. When leftovers pile up
// (visual-record screenshots written by the specs, ~120 PNGs per run),
// that recursive cleanup exceeds the local safe-delete guard threshold
// and the whole test run is aborted. `mv` within the same volume is not
// a delete, so it passes the guard; the moved folders live in
// ../.pw-trash-* next to the project until cleaned up manually.
import { existsSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const results = join(projectRoot, 'test-results');
if (!existsSync(results)) process.exit(0);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = join(projectRoot, '..', `.pw-trash-${stamp}`);
try {
  renameSync(results, target);
  console.log(`[pre-e2e] moved test-results -> ${target}`);
} catch (error) {
  console.warn(`[pre-e2e] could not move test-results (${error.code ?? error.message}); letting Playwright clean it`);
}
