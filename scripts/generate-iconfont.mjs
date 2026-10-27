import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIconNameModule, buildSprite, readIconfontArchive } from './iconfont-tools.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const iconfontArchiveName = 'design-assets/iconfont/ssx-design-5242145-2026-10-26-193.zip';

export function createIconfontOutputs() {
  const archive = resolve(root, iconfontArchiveName);
  const { metadata, symbolSource } = readIconfontArchive(archive);
  return {
    'public/iconfont/ssx-design.symbol.svg': buildSprite(symbolSource, metadata),
    'public/iconfont/iconfont.json': `${JSON.stringify(metadata, null, 2)}\n`,
    'src/components/ui/Icon/icon-names.generated.ts': buildIconNameModule(metadata),
    'public/downloads/ssx-design-5242145.zip': readFileSync(archive),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [name, content] of Object.entries(createIconfontOutputs())) {
    const path = resolve(root, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log(`已生成 ${name}`);
  }
}
