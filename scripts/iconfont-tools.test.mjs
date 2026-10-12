import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSprite, readIconfontArchive, buildIconNameModule } from './iconfont-tools.mjs';

const archive = new URL('../design-assets/iconfont/ssx-design-5242145-2026-10-12-180.zip', import.meta.url);
test('uploaded SSX archive imports all 180 symbols and normalizes uppercase names', () => {
  const { metadata, symbolSource } = readIconfontArchive(archive);
  assert.equal(metadata.glyphs.length, 180);
  for (const name of ['export', 'launch', 'fire', 'qrcode-line', 'money-collect-filled', 'chat-1-line']) assert.ok(metadata.glyphs.some((g) => g.font_class === name));
  const sprite = buildSprite(symbolSource, metadata);
  assert.equal([...sprite.matchAll(/<symbol\b/g)].length, 180);
  assert.ok(sprite.includes('id="SSX-export"'));
  assert.ok(sprite.includes('fill="currentColor"'));
  assert.ok(!sprite.includes('#4E5969'));
  assert.ok(buildIconNameModule(metadata).includes('"question-circle"'));
});

const metadata = { glyphs: [{ font_class: 'check' }], css_prefix_text: 'sss-' };
test('active SVG nodes and event attributes are rejected', () => {
  assert.throws(() => buildSprite('<svg><symbol id="sss-check" viewBox="0 0 1024 1024"><script /></symbol></svg>', metadata), /不允许节点/);
  assert.throws(() => buildSprite('<svg><symbol id="sss-check" onload="alert(1)"></symbol></svg>', metadata), /不允许属性/);
});
test('duplicate and missing symbols fail instead of creating broken names', () => {
  assert.throws(() => buildSprite('<svg></svg>', metadata), /缺少/);
  assert.throws(() => buildSprite('<svg><symbol id="sss-check"></symbol><symbol id="sss-check"></symbol></svg>', metadata), /不一致/);
});

 test('multicolor icons retain original fills while monochrome icons inherit color', () => {
  const { metadata, symbolSource } = readIconfontArchive(archive);
  const sprite = buildSprite(symbolSource, metadata);
  const qrcode = sprite.match(/<symbol id="SSX-qrcode-line"[\s\S]*?<\/symbol>/)[0];
  assert.ok(qrcode.includes('fill="#3F454E"'));
  assert.ok(qrcode.includes('fill="#296CFF"'));
  const check = sprite.match(/<symbol id="SSX-check"[\s\S]*?<\/symbol>/)[0];
  assert.ok(check.includes('fill="currentColor"'));
  assert.ok(!check.includes('#4E5969'));
 });
