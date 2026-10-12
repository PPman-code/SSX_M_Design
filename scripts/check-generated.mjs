import { readFileSync } from 'node:fs';
import { createTokenOutputs } from './generate-tokens.mjs';
import { createIconfontOutputs } from './generate-iconfont.mjs';
let mismatch = false;
for (const [file, expected] of Object.entries({ ...createTokenOutputs(), ...createIconfontOutputs() })) {
  let actual;
  try { actual = readFileSync(new URL(`../${file}`, import.meta.url)); } catch { actual = Buffer.alloc(0); }
  const expectedBytes = typeof expected === 'string' ? Buffer.from(expected) : expected;
  if (!actual.equals(expectedBytes)) { console.error(`生成物不同步：${file}`); mismatch = true; }
}
if (mismatch) process.exit(1);
console.log('Token、SVG 图标、名称清单与下载包均已同步。');
