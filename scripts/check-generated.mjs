import { readFileSync } from 'node:fs';
import { createTokenOutputs } from './generate-tokens.mjs';
let mismatch = false;
for (const [file, expected] of Object.entries(createTokenOutputs())) {
  let actual;
  try { actual = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'); } catch { actual = ''; }
  if (actual !== expected) { console.error(`生成物不同步：${file}`); mismatch = true; }
}
if (mismatch) process.exit(1);
console.log('三层 token 与四个生成物一致。');
