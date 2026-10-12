import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

import {
  compilePaletteCss,
  compileRoleCss,
  compileSemanticCss,
  createTokenCatalogModule,
  validatePalette,
  validateRoles,
  validateSemanticTokens,
} from './token-tools.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readJson(fileName) {
  return JSON.parse(readFileSync(resolve(projectRoot, fileName), 'utf8'));
}

export function createTokenOutputs() {
  const palette = readJson('design-system/tokens/palette.json');
  const roles = readJson('design-system/tokens/roles.json');
  const tokens = readJson('design-system/tokens/tokens.json');

  validatePalette(palette);
  validateRoles(palette, roles);
  validateSemanticTokens(palette, roles, tokens);

  return {
    'src/styles/palette.css': compilePaletteCss(palette),
    'src/styles/roles.css': compileRoleCss(palette, roles),
    'src/styles/tokens.css': compileSemanticCss(roles, tokens),
    'src/handoff/token-catalog.generated.ts': createTokenCatalogModule(palette, roles, tokens),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [fileName, content] of Object.entries(createTokenOutputs())) {
    const outputPath = resolve(projectRoot, fileName);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, content, 'utf8');
    console.log(`已生成 ${outputPath}`);
  }
}
