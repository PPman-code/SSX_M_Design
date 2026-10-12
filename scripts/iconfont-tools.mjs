import { readFileSync } from 'node:fs';

import { strFromU8, unzipSync } from 'fflate';

export const PUBLIC_ICON_PREFIX = 'SSX-';

const ICON_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const PREFIX_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*-$/;

// 导出包中的大小写或 camelCase 名称统一为 kebab-case。
function normalizeIconName(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
}
const ALLOWED_ATTRIBUTES = {
  symbol: new Set(['id', 'viewBox', 'fill', 'stroke']),
  g: new Set(['fill', 'stroke', 'fill-opacity', 'stroke-opacity', 'transform', 'opacity']),
  path: new Set([
    'd', 'fill', 'stroke', 'fill-opacity', 'stroke-opacity', 'fill-rule', 'clip-rule',
    'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
    'vector-effect', 'transform', 'opacity',
  ]),
};

function findEntry(entries, suffix) {
  const matches = Object.keys(entries).filter((name) => name.endsWith(suffix));
  if (matches.length !== 1) throw new Error(`Iconfont ZIP 必须且只能包含一个 ${suffix}`);
  return entries[matches[0]];
}

function extractSvg(source) {
  const match = source.match(/_iconfont_svg_string_\d+='(<svg>[\s\S]*?<\/svg>)'/);
  if (!match) throw new Error('无法从 iconfont.js 提取 SVG Symbol');
  return match[1];
}

function validateMetadata(metadata, expected) {
  if (!metadata || typeof metadata !== 'object') throw new Error('Iconfont 元数据格式无效');
  if (expected?.id && String(metadata.id) !== expected.id) {
    throw new Error(`Iconfont 项目 ID 不符: ${String(metadata.id)}`);
  }
  if (expected?.name && metadata.name !== expected.name) {
    throw new Error(`Iconfont 项目名不符: ${String(metadata.name)}`);
  }
  if (!Array.isArray(metadata.glyphs) || metadata.glyphs.length === 0) {
    throw new Error('Iconfont glyphs 不能为空');
  }
  const prefix = metadata.css_prefix_text ?? PUBLIC_ICON_PREFIX;
  if (typeof prefix !== 'string' || !PREFIX_PATTERN.test(prefix)) {
    throw new Error('Iconfont css_prefix_text 格式无效');
  }
  const names = metadata.glyphs.map((glyph) => glyph?.font_class);
  for (const name of names) {
    if (typeof name !== 'string' || !ICON_NAME_PATTERN.test(name)) {
      throw new Error(`Iconfont font_class 格式无效: ${String(name)}`);
    }
  }
  if (new Set(names).size !== names.length) throw new Error('Iconfont font_class 存在重复');
  return { names, prefix };
}

function parseAttributes(source, element) {
  const attributes = new Map();
  let remaining = source.trim();
  while (remaining) {
    const match = remaining.match(/^([A-Za-z][A-Za-z0-9-]*)\s*=\s*(["'])([\s\S]*?)\2/);
    if (!match) throw new Error(`SVG <${element}> 属性语法无效`);
    const [, name, , value] = match;
    if (!ALLOWED_ATTRIBUTES[element].has(name)) {
      throw new Error(`SVG <${element}> 不允许属性 ${name}`);
    }
    if (attributes.has(name)) throw new Error(`SVG <${element}> 属性 ${name} 重复`);
    attributes.set(name, value);
    remaining = remaining.slice(match[0].length).trimStart();
  }
  return attributes;
}

function serializeTag(element, attributes, selfClosing) {
  const serialized = [...attributes].map(([name, value]) => `${name}="${value}"`).join(' ');
  return `<${element}${serialized ? ` ${serialized}` : ''}${selfClosing ? ' /' : ''}>`;
}

function sanitizeSymbols(symbolSource, metadata) {
  const { names, prefix } = validateMetadata(metadata);
  const outer = symbolSource.match(/^<svg>([\s\S]*)<\/svg>$/);
  if (!outer) throw new Error('SVG Symbol 必须使用受控的 <svg> 根节点');
  const expectedIds = new Map(names.map((name) => [`${prefix}${name}`, name]));
  const coloredIds = new Set([...outer[1].matchAll(/<symbol\b[^>]*id="([^"]+)"[\s\S]*?<\/symbol>/g)]
    .filter((match) => new Set([...match[0].matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{3,8})"/g)].map((color) => color[1].toLowerCase())).size > 1)
    .map((match) => match[1]));
  let preserveColors = false;
  const seen = new Set();
  const stack = [];
  const output = [];
  const tags = outer[1].matchAll(/<[^>]*>/g);
  let cursor = 0;

  for (const match of tags) {
    if (outer[1].slice(cursor, match.index).trim()) throw new Error('SVG 不允许文本或主动内容');
    const tag = match[0];
    cursor = (match.index ?? 0) + tag.length;
    const closing = tag.match(/^<\/([A-Za-z][A-Za-z0-9-]*)\s*>$/);
    if (closing) {
      if (stack.pop() !== closing[1]) throw new Error('SVG 节点嵌套无效');
      output.push(`</${closing[1]}>`);
      continue;
    }
    const opening = tag.match(/^<([A-Za-z][A-Za-z0-9-]*)([\s\S]*?)(\/?)>$/);
    if (!opening || !Object.hasOwn(ALLOWED_ATTRIBUTES, opening[1])) {
      throw new Error(`SVG 不允许节点: ${tag.slice(0, 40)}`);
    }
    const [, element, attributeSource, slash] = opening;
    const selfClosing = slash === '/';
    const attributes = parseAttributes(attributeSource, element);
    if (element === 'symbol') {
      if (stack.length !== 0 || selfClosing) throw new Error('SVG symbol 嵌套无效');
      const originalId = attributes.get('id');
      preserveColors = coloredIds.has(originalId);
      const name = originalId && expectedIds.get(originalId);
      if (!name || seen.has(name)) throw new Error(`Symbol 与元数据不一致: ${String(originalId)}`);
      seen.add(name);
      attributes.set('id', `${PUBLIC_ICON_PREFIX}${name}`);
      if (!attributes.has('fill')) attributes.set('fill', 'currentColor');
    } else if (!stack.includes('symbol')) {
      throw new Error(`SVG <${element}> 必须位于 symbol 内`);
    }
    for (const colorAttribute of ['fill', 'stroke']) {
      const value = attributes.get(colorAttribute);
      if (value && value.toLowerCase() !== 'none') {
        if (preserveColors && !/^(?:#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?|#[0-9a-fA-F]{8}|currentColor)$/.test(value)) {
          throw new Error(`SVG 不允许颜色值: ${value}`);
        }
        if (!preserveColors) attributes.set(colorAttribute, 'currentColor');
      }
    }
    output.push(serializeTag(element, attributes, selfClosing));
    if (!selfClosing) stack.push(element);
  }
  if (outer[1].slice(cursor).trim() || stack.length > 0) throw new Error('SVG 结构不完整');
  if (seen.size !== names.length) throw new Error('Sprite 缺少元数据中的 Symbol');
  return output.join('');
}

export function readIconfontArchive(archivePath) {
  const entries = unzipSync(new Uint8Array(readFileSync(archivePath)));
  const metadata = JSON.parse(strFromU8(findEntry(entries, '/iconfont.json')));
  let symbolSource = extractSvg(strFromU8(findEntry(entries, '/iconfont.js')));
  // 归一化 font_class 并同步改写 symbol id，保证下游（sprite/名称清单）只见 kebab-case。
  const sourcePrefix = metadata.css_prefix_text ?? PUBLIC_ICON_PREFIX;
  for (const glyph of metadata.glyphs) {
    const normalized = normalizeIconName(glyph.font_class);
    if (normalized === glyph.font_class) continue;
    symbolSource = symbolSource.replaceAll(
      `id="${sourcePrefix}${glyph.font_class}"`,
      `id="${sourcePrefix}${normalized}"`,
    );
    glyph.font_class = normalized;
  }
  validateMetadata(metadata, { id: '5242145', name: 'ssx-design' });
  return { metadata, symbolSource };
}

export function buildSprite(symbolSource, metadata) {
  const symbols = sanitizeSymbols(symbolSource, metadata);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg">',
    symbols,
    '</svg>',
    '',
  ].join('\n');
}

export function buildIconNameModule(metadata) {
  const { names } = validateMetadata(metadata);
  const lines = names.map((name) => `  ${JSON.stringify(name)},`).join('\n');
  return [
    '/* 此文件由 scripts/generate-iconfont.mjs 自动生成，请勿手工修改。 */',
    `export const iconSpritePrefix = ${JSON.stringify(PUBLIC_ICON_PREFIX)};`,
    'export const iconNames = [',
    lines,
    '] as const;',
    '',
    'export type IconName = (typeof iconNames)[number];',
    '',
  ].join('\n');
}
