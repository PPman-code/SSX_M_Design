import valueParser from 'postcss-value-parser';

const referencePattern = /\{([^{}]+)\}/g;

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withoutMeta(value) {
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'meta'));
}

function getPath(root, path) {
  return path.split('.').reduce((current, segment) => {
    if (!isObject(current) || !(segment in current)) return undefined;
    return current[segment];
  }, root);
}

export function resolveTokenTree(palette, tokens) {
  const cleanPalette = withoutMeta(palette);
  const cleanTokens = withoutMeta(tokens);
  const root = { ...cleanPalette, ...cleanTokens };
  const cache = new Map();

  function resolveReference(path, stack) {
    if (stack.includes(path)) {
      throw new Error(`循环 token 引用: ${[...stack, path].join(' -> ')}`);
    }
    if (cache.has(path)) return cache.get(path);

    const referencedValue = getPath(root, path);
    if (referencedValue === undefined) {
      throw new Error(`未知 token 引用: ${path}`);
    }
    if (isObject(referencedValue)) {
      throw new Error(`token 引用必须指向具体值: ${path}`);
    }

    const resolved = resolveValue(referencedValue, [...stack, path]);
    cache.set(path, resolved);
    return resolved;
  }

  function resolveValue(value, stack) {
    if (typeof value !== 'string') return value;

    const matches = [...value.matchAll(referencePattern)];
    if (matches.length === 0) return value;
    if (matches.length === 1 && matches[0][0] === value) {
      return resolveReference(matches[0][1], stack);
    }

    return value.replace(referencePattern, (_, path) => String(resolveReference(path, stack)));
  }

  function resolveNode(node, path = []) {
    if (!isObject(node)) return resolveValue(node, path);
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, resolveNode(value, [...path, key])]),
    );
  }

  return resolveNode(cleanTokens);
}

function kebabCase(value) {
  if (/^-\d+$/.test(value)) return `negative-${value.slice(1)}`;
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}(?:[0-9A-F]{2})?$/;
const CJK_UNIFIED_IDEOGRAPH_PATTERN = /\p{Unified_Ideograph}/u;
const PALETTE_FAMILY_NAME_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
const PALETTE_PURPOSE_WORDS = new Set([
  'background',
  'border',
  'brand',
  'button',
  'component',
  'danger',
  'icon',
  'info',
  'information',
  'light',
  'navigation',
  'overlay',
  'primary',
  'shadow',
  'success',
  'text',
  'theme',
  'warning',
]);
const PALETTE_PURPOSE_SEQUENCES = [
  ['neutral', 'alpha'],
];
const COMPOUND_COLOR_TOKEN_TYPES = new Set(['gradient', 'shadow']);
const COMPOUND_NON_COLOR_WORDS = new Set([
  'at',
  'bottom',
  'circle',
  'closest-corner',
  'closest-side',
  'decreasing',
  'ellipse',
  'farthest-corner',
  'farthest-side',
  'from',
  'hue',
  'in',
  'increasing',
  'inset',
  'lab',
  'left',
  'longer',
  'oklab',
  'right',
  'shorter',
  'srgb',
  'srgb-linear',
  'to',
  'top',
  'xyz',
  'xyz-d50',
  'xyz-d65',
]);
const COMPOUND_STRUCTURE_FUNCTIONS = new Set([
  'calc',
  'clamp',
  'conic-gradient',
  'linear-gradient',
  'max',
  'min',
  'radial-gradient',
  'repeating-conic-gradient',
  'repeating-linear-gradient',
  'repeating-radial-gradient',
]);
const CSS_NUMERIC_WORD_PATTERN = /^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(?:[a-z]+|%)?$/i;
const LIGHT_SELECTOR = ':root';
const DARK_SELECTOR = ':root[data-color-mode="dark"]';

function sortedEntries(value) {
  return Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
}

function isTokenLeaf(value) {
  if (!isObject(value)) return false;
  const hasTokenChildren = Object.keys(value).some((key) => !key.startsWith('$'));
  return !hasTokenChildren && (
    Object.hasOwn(value, '$value') ||
    Object.hasOwn(value, '$light') ||
    Object.hasOwn(value, '$dark')
  );
}

function referenceToCss(value) {
  if (typeof value !== 'string') return String(value);
  return value.replace(/\{([^{}]+)\}/g, (_match, path) =>
    `var(--${path.split('.').filter((part) => part !== 'DEFAULT').map(kebabCase).join('-')})`,
  );
}

function cssBlock(selector, declarations) {
  return `${selector} {\n${declarations.map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`;
}

function cssVariableName(path) {
  return `--${path.filter((part) => part !== 'DEFAULT').map(kebabCase).join('-')}`;
}

function paletteVariableName(family, step) {
  return `--palette-${kebabCase(family)}-${kebabCase(step)}`;
}

function roleVariableName(role, step) {
  return `--role-${kebabCase(role)}-${kebabCase(step)}`;
}

function requireObject(value, path) {
  if (!isObject(value)) throw new Error(`${path} 必须是对象`);
}

function assertExactFields(value, path, fields) {
  for (const key of Object.keys(value)) {
    if (!fields.includes(key)) throw new Error(`${path} 包含未知字段: ${key}`);
  }
}

function identifierWords(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ');
}

function includesWordSequence(words, sequence) {
  if (sequence.length === 0 || sequence.length > words.length) return false;
  return words.some((_word, start) =>
    sequence.every((expected, offset) => words[start + offset] === expected));
}

function isReservedPaletteFamilyName(familyName, roleNames) {
  if (!PALETTE_FAMILY_NAME_PATTERN.test(familyName) || familyName === 'dark') return true;
  const words = identifierWords(familyName);
  const purposeWords = words[0] === 'dark' && words.length > 1 ? words.slice(1) : words;
  if (purposeWords.some((word) => PALETTE_PURPOSE_WORDS.has(word))) return true;
  if (PALETTE_PURPOSE_SEQUENCES.some((sequence) => includesWordSequence(words, sequence))) {
    return true;
  }

  // `neutral` / `darkNeutral` 是既有的物理中性色 family；除此之外，Role 名只要作为
  // 完整驼峰词序列出现在 family 前缀、后缀或中部，就属于用途命名而不是 hue 命名。
  if (familyName === 'neutral' || familyName === 'darkNeutral') return false;
  return roleNames
    .map(identifierWords)
    .some((roleWords) => includesWordSequence(words, roleWords));
}

export function validatePalette(palette, roleNames = []) {
  requireObject(palette, 'palette');
  assertExactFields(palette, 'palette', ['$schema', '$description', 'families']);
  for (const field of ['$schema', '$description', 'families']) {
    if (!Object.hasOwn(palette, field)) throw new Error(`palette 缺少 ${field}`);
  }
  if (palette.$schema !== 'wone.palette.v1') {
    throw new Error('palette.$schema 必须是 wone.palette.v1');
  }
  if (
    typeof palette.$description !== 'string'
    || !CJK_UNIFIED_IDEOGRAPH_PATTERN.test(palette.$description)
  ) {
    throw new Error('palette.$description 必须包含中文');
  }
  requireObject(palette.families, 'palette.families');
  if (Object.keys(palette.families).length === 0) throw new Error('palette.families 不能为空');

  for (const [familyName, family] of sortedEntries(palette.families)) {
    if (isReservedPaletteFamilyName(familyName, roleNames)) {
      throw new Error(`palette family 必须是物理颜色名称: ${familyName}`);
    }
    requireObject(family, `palette.${familyName}`);
    assertExactFields(family, `palette.${familyName}`, ['$label', '$alpha', 'values']);
    for (const field of ['$label', 'values']) {
      if (!Object.hasOwn(family, field)) throw new Error(`palette.${familyName} 缺少 ${field}`);
    }
    if (
      typeof family.$label !== 'string'
      || !CJK_UNIFIED_IDEOGRAPH_PATTERN.test(family.$label)
    ) {
      throw new Error(`palette.${familyName}.$label 必须包含中文`);
    }
    if (Object.hasOwn(family, '$alpha') && family.$alpha !== true) {
      throw new Error(`palette.${familyName}.$alpha 只能为 true`);
    }
    requireObject(family.values, `palette.${familyName}.values`);
    if (Object.keys(family.values).length === 0) {
      throw new Error(`palette.${familyName}.values 不能为空`);
    }
    const isAlpha = family.$alpha === true;

    for (const [step, color] of sortedEntries(family.values)) {
      const numericStep = Number(step);
      const validStep = /^(0|[1-9]\d*)$/.test(step)
        && Number.isInteger(numericStep)
        && (isAlpha ? numericStep >= 0 && numericStep <= 100 : numericStep >= 100 && numericStep <= 900);
      if (!validStep) throw new Error(`palette.${familyName}.${step} 必须是有效色阶`);
      if (typeof color !== 'string' || !HEX_COLOR_PATTERN.test(color)) {
        throw new Error(`palette.${familyName}.${step} 必须是大写六位或八位 HEX`);
      }
    }
  }
}

function getRoleEntries(roles) {
  requireObject(roles, 'roles');
  requireObject(roles.roles, 'roles.roles');
  return roles.roles;
}

export function validateRoles(palette, roles) {
  const roleEntries = getRoleEntries(roles);
  validatePalette(palette, Object.keys(roleEntries));
  const families = palette.families;

  for (const [roleName, role] of sortedEntries(roleEntries)) {
    requireObject(role, `role.${roleName}`);
    for (const [mode, field] of [['light', '$light'], ['dark', '$dark']]) {
      const familyName = role[field];
      if (typeof familyName !== 'string' || !Object.hasOwn(families, familyName)) {
        throw new Error(`role.${roleName}.${mode} 引用了不存在的 family: ${familyName}`);
      }
    }
  }
}

function collectSemanticLeaves(tokens) {
  const leaves = new Map();

  function visit(node, path) {
    if (!isObject(node)) throw new Error(`${path.join('.')} 必须是 token 对象`);
    const childEntries = sortedEntries(node).filter(([key]) => !key.startsWith('$'));
    if (childEntries.length > 0) {
      for (const [key, value] of childEntries) visit(value, [...path, key]);
      return;
    }
    if (isTokenLeaf(node) || Object.hasOwn(node, '$type')) {
      leaves.set(path.join('.'), { path, token: node });
      return;
    }
    throw new Error(`${path.join('.')} 必须包含 token 值或子节点`);
  }

  requireObject(tokens, 'tokens');
  for (const [key, value] of sortedEntries(tokens)) {
    if (key.startsWith('$')) continue;
    visit(value, [key]);
  }
  return leaves;
}

function referencesIn(value) {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(referencePattern)].map((match) => match[1]);
}

function semanticLeafValue(token, mode) {
  return token.$type === 'color' ? token[mode === 'dark' ? '$dark' : '$light'] : token.$value;
}

function compoundValueContainsLiteralColor(value) {
  let invalid = false;
  valueParser(value).walk((node) => {
    if (invalid) return false;
    if (node.type === 'function') {
      if (!COMPOUND_STRUCTURE_FUNCTIONS.has(node.value.toLowerCase())) {
        invalid = true;
        return false;
      }
      return undefined;
    }
    if (node.type !== 'word') return undefined;
    const word = node.value.toLowerCase();
    const isReference = /^\{[^{}]+\}$/.test(node.value);
    if (
      !isReference
      && !CSS_NUMERIC_WORD_PATTERN.test(word)
      && !COMPOUND_NON_COLOR_WORDS.has(word)
    ) {
      invalid = true;
      return false;
    }
    return undefined;
  });
  return invalid;
}

function validateSemanticLeaf(path, token) {
  const isColor = token.$type === 'color';
  const expectedFields = isColor
    ? ['$type', '$description', '$light', '$dark']
    : ['$type', '$description', '$value'];
  assertExactFields(token, path, expectedFields);

  for (const field of expectedFields) {
    if (!Object.hasOwn(token, field)) throw new Error(`${path} 缺少 ${field}`);
  }
  if (typeof token.$type !== 'string' || typeof token.$description !== 'string') {
    throw new Error(`${path} 的 $type 和 $description 必须是字符串`);
  }
  if (isColor && !CJK_UNIFIED_IDEOGRAPH_PATTERN.test(token.$description)) {
    throw new Error(`${path} 的 $description 必须包含中文`);
  }
}

function assertRoleReference(roles, palette, reference, mode, path) {
  const [, roleName, step, ...rest] = reference.split('.');
  if (!roleName || !step || rest.length > 0 || !Object.hasOwn(roles.roles, roleName)) {
    throw new Error(`${path} 引用了不存在的 Role: ${reference}`);
  }
  if (!palette) return;
  const familyName = roles.roles[roleName][mode === 'dark' ? '$dark' : '$light'];
  if (!Object.hasOwn(palette.families[familyName].values, step)) {
    throw new Error(`${path} 引用了不存在的 Role 色阶: ${reference}`);
  }
}

function validateSemanticReferences(palette, roles, leaves) {
  const dependencies = new Map([...leaves.keys()].map((path) => [path, []]));

  for (const [path, { token }] of leaves) {
    const modes = token.$type === 'color' ? ['light', 'dark'] : ['light'];
    for (const mode of modes) {
      const value = semanticLeafValue(token, mode);
      if (token.$type === 'color') {
        if (referencesIn(value).some((reference) => reference.startsWith('palette.'))) {
          throw new Error(`${path} 不得越级引用 Palette`);
        }
        const match = typeof value === 'string'
          ? value.match(/^\{(role\.[^.{}]+\.[^.{}]+)\}$/)
          : null;
        if (!match) {
          throw new Error(`${path} 的 $${mode} 必须是完整 Role 引用`);
        }
        assertRoleReference(roles, palette, match[1], mode, path);
        continue;
      }
      for (const reference of referencesIn(value)) {
        if (reference.startsWith('palette.')) {
          throw new Error(`${path} 不得越级引用 Palette`);
        }
        if (reference.startsWith('role.')) {
          throw new Error(`${path} 不得越级引用 Role`);
        }
        if (!leaves.has(reference)) {
          throw new Error(`${path} 引用了不存在的 semantic token: ${reference}`);
        }
        dependencies.get(path).push(reference);
      }
      if (COMPOUND_COLOR_TOKEN_TYPES.has(token.$type) && value !== 'none') {
        const colorReferences = referencesIn(value).filter(
          (reference) => leaves.get(reference)?.token.$type === 'color',
        );
        if (
          typeof value !== 'string'
          || compoundValueContainsLiteralColor(value)
          || colorReferences.length === 0
        ) {
          throw new Error(`${path} 的颜色必须引用 Semantic color token`);
        }
      }
    }
  }

  const visited = new Set();
  const visiting = new Set();
  function visit(path, stack) {
    if (visiting.has(path)) {
      throw new Error(`循环 semantic token 引用: ${[...stack, path].join(' -> ')}`);
    }
    if (visited.has(path)) return;
    visiting.add(path);
    for (const dependency of dependencies.get(path)) visit(dependency, [...stack, path]);
    visiting.delete(path);
    visited.add(path);
  }
  for (const path of dependencies.keys()) visit(path, []);
}

function validateSemanticTree(palette, roles, tokens) {
  getRoleEntries(roles);
  const leaves = collectSemanticLeaves(tokens);
  for (const [path, { token }] of leaves) validateSemanticLeaf(path, token);
  validateSemanticReferences(palette, roles, leaves);
  return leaves;
}

export function validateSemanticTokens(palette, roles, tokens) {
  validateRoles(palette, roles);
  validateSemanticTree(palette, roles, tokens);
}

export function compilePaletteCss(palette) {
  validatePalette(palette);
  const declarations = [];
  for (const [familyName, family] of sortedEntries(palette.families)) {
    for (const [step, color] of sortedEntries(family.values)) {
      declarations.push([paletteVariableName(familyName, step), color]);
    }
  }
  return `${cssBlock(LIGHT_SELECTOR, declarations)}\n`;
}

export function compileRoleCss(palette, roles) {
  validateRoles(palette, roles);
  const declarationsByMode = { light: [], dark: [] };
  for (const [roleName, role] of sortedEntries(roles.roles)) {
    for (const mode of ['light', 'dark']) {
      const familyName = role[mode === 'light' ? '$light' : '$dark'];
      for (const [step] of sortedEntries(palette.families[familyName].values)) {
        declarationsByMode[mode].push([
          roleVariableName(roleName, step),
          `var(${paletteVariableName(familyName, step)})`,
        ]);
      }
    }
  }
  return `${cssBlock(LIGHT_SELECTOR, declarationsByMode.light)}\n\n${cssBlock(DARK_SELECTOR, declarationsByMode.dark)}\n`;
}

export function compileSemanticCss(roles, tokens) {
  const leaves = validateSemanticTree(null, roles, tokens);
  const light = [];
  const dark = [];
  for (const { path, token } of leaves.values()) {
    const name = cssVariableName(path);
    light.push([name, referenceToCss(semanticLeafValue(token, 'light'))]);
    if (token.$type === 'color') {
      dark.push([name, referenceToCss(semanticLeafValue(token, 'dark'))]);
    }
  }
  light.sort(([left], [right]) => left.localeCompare(right));
  dark.sort(([left], [right]) => left.localeCompare(right));
  return `${cssBlock(LIGHT_SELECTOR, light)}\n\n${cssBlock(DARK_SELECTOR, dark)}\n`;
}

function tsString(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function resolveCatalogValue(palette, roles, leaves, value, mode, stack = []) {
  if (typeof value !== 'string') return String(value);
  return value.replace(referencePattern, (_match, reference) => {
    if (reference.startsWith('role.')) {
      const [, roleName, step] = reference.split('.');
      const role = roles.roles[roleName];
      const familyName = role[mode === 'dark' ? '$dark' : '$light'];
      return palette.families[familyName].values[step];
    }
    if (stack.includes(reference)) {
      throw new Error(`循环 semantic token 引用: ${[...stack, reference].join(' -> ')}`);
    }
    const semantic = leaves.get(reference);
    return resolveCatalogValue(
      palette,
      roles,
      leaves,
      semanticLeafValue(semantic.token, mode),
      mode,
      [...stack, reference],
    );
  });
}

export function createTokenCatalogModule(palette, roles, tokens) {
  validateSemanticTokens(palette, roles, tokens);
  const leaves = collectSemanticLeaves(tokens);
  const entries = [...leaves.values()].filter(({ token }) => token.$type === 'color').sort((left, right) =>
    left.path.join('.').localeCompare(right.path.join('.')),
  );
  const paletteBody = sortedEntries(palette.families).map(([name, family]) => [
    '  {',
    `    name: ${tsString(name)},`,
    `    label: ${tsString(family.$label)},`,
    '    swatches: [',
    ...sortedEntries(family.values).map(([step, value]) =>
      `      { step: ${tsString(step)}, cssVariable: ${tsString(paletteVariableName(name, step))}, value: ${tsString(value)} },`,
    ),
    '    ],',
    '  },',
  ].join('\n')).join('\n');
  const roleBody = sortedEntries(roles.roles).map(([name, role]) => [
    '  {',
    `    name: ${tsString(name)},`,
    `    label: ${tsString(role.$label)},`,
    `    lightFamily: ${tsString(role.$light)},`,
    `    darkFamily: ${tsString(role.$dark)},`,
    '  },',
  ].join('\n')).join('\n');
  const semanticBody = entries.map(({ path, token }) => {
    const pathName = path.filter((part) => part !== 'DEFAULT').join('.');
    const lightValue = semanticLeafValue(token, 'light');
    const darkValue = semanticLeafValue(token, 'dark');
    return [
      '  {',
      `    name: ${tsString(pathName)},`,
      `    cssVariable: ${tsString(cssVariableName(path))},`,
      `    description: ${tsString(token.$description)},`,
      `    lightReference: ${tsString(lightValue)},`,
      `    darkReference: ${tsString(darkValue)},`,
      `    lightResolved: ${tsString(resolveCatalogValue(palette, roles, leaves, lightValue, 'light'))},`,
      `    darkResolved: ${tsString(resolveCatalogValue(palette, roles, leaves, darkValue, 'dark'))},`,
      '  },',
    ].join('\n');
  }).join('\n');
  return [
    `export const paletteCatalog = [\n${paletteBody}\n] as const;`,
    `export const roleCatalog = [\n${roleBody}\n] as const;`,
    `export const semanticColorCatalog = [\n${semanticBody}\n] as const;`,
  ].join('\n\n') + '\n';
}

export function flattenTokenTree(tree) {
  const result = {};

  function visit(node, path) {
    if (isObject(node)) {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'meta') continue;
        visit(value, key === 'DEFAULT' ? path : [...path, kebabCase(key)]);
      }
      return;
    }

    result[`--${path.join('-')}`] = String(node);
  }

  visit(tree, []);
  return result;
}

function figmaCssName(path) {
  return `--${path.split('/').map((segment) => kebabCase(segment.trim())).join('-')}`;
}

function getSlashPath(root, path) {
  return path.split('/').reduce((current, segment) => {
    if (!isObject(current) || !(segment in current)) return undefined;
    return current[segment];
  }, root);
}

function resolveFigmaAlias(palette, tokens, alias, mode, stack = []) {
  if (stack.includes(alias)) {
    throw new Error(`循环 Figma token 引用: ${[...stack, alias].join(' -> ')}`);
  }

  const themeToken = tokens.theme?.[alias];
  if (themeToken) {
    const modeValue = themeToken.values?.[mode];
    if (!modeValue) throw new Error(`Figma token 缺少 ${mode} 模式: ${alias}`);
    return isObject(modeValue) && typeof modeValue.alias === 'string'
      ? resolveFigmaAlias(palette, tokens, modeValue.alias, mode, [...stack, alias])
      : modeValue;
  }

  const numberToken = tokens.number?.[alias]?.values?.['Mode 1'];
  if (numberToken !== undefined) return numberToken;

  const paletteValue = getSlashPath(palette.color, alias);
  if (paletteValue !== undefined && !isObject(paletteValue)) return paletteValue;

  throw new Error(`未知 Figma token 引用: ${alias}`);
}

function resolveFigmaModeValue(palette, tokens, entry, mode, path) {
  const modeValue = entry.values?.[mode];
  if (modeValue === undefined) throw new Error(`Figma token 缺少 ${mode} 模式: ${path}`);
  const value = isObject(modeValue) && typeof modeValue.alias === 'string'
    ? resolveFigmaAlias(palette, tokens, modeValue.alias, mode, [path])
    : modeValue;
  if (entry.type === 'FLOAT') return `${value}px`;
  return String(value);
}

export function compileFigmaThemeTokens(palette, tokens, mode) {
  return Object.fromEntries(Object.entries(tokens.theme).map(([path, entry]) => [
    figmaCssName(path),
    resolveFigmaModeValue(palette, tokens, entry, mode, path),
  ]));
}

export function compileFigmaFontTokens(tokens, mode) {
  return Object.fromEntries(Object.entries(tokens.font).map(([path, entry]) => {
    const modeValue = entry.values?.[mode];
    if (modeValue === undefined) throw new Error(`Figma 字体 token 缺少 ${mode} 模式: ${path}`);
    const value = isObject(modeValue) && typeof modeValue.alias === 'string'
      ? tokens.number?.[modeValue.alias]?.values?.['Mode 1']
      : modeValue;
    if (value === undefined) throw new Error(`未知 Figma 字体 token 引用: ${path}`);
    const needsPixels = entry.type === 'FLOAT' && !path.startsWith('Font Weight/');
    return [figmaCssName(path), needsPixels ? `${value}px` : String(value)];
  }));
}

export function toCssVariables(flatTokens) {
  const declarations = Object.entries(flatTokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `/* 此文件由 scripts/generate-tokens.mjs 自动生成，请勿手工修改。 */\n:root {\n${declarations}\n}\n`;
}

export function toThemeCssVariables(themes) {
  return `/* 此文件由 scripts/generate-tokens.mjs 自动生成，请勿手工修改。 */\n${Object.entries(themes)
    .map(([selector, flatTokens]) => {
      const declarations = Object.entries(flatTokens)
        .map(([name, value]) => `  ${name}: ${value};`)
        .join('\n');
      return `${selector} {\n${declarations}\n}`;
    })
    .join('\n\n')}\n`;
}
