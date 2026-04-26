#!/usr/bin/env tsx
/**
 * Asset ingest pipeline.
 * - Scans apps/mobile/assets/figma/screens/ and apps/mobile/assets/brand/
 * - Writes apps/mobile/assets/_manifest.json with file metadata
 *
 * Usage: pnpm assets:ingest
 *
 * Note: Full image optimisation and @2x/@3x generation requires `sharp`
 * (optional dep). The script works without it — it just skips optimisation.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve(__dirname, '..');
const ASSETS_ROOT = path.join(ROOT, 'apps/mobile/assets');
const MANIFEST_PATH = path.join(ASSETS_ROOT, '_manifest.json');

interface ManifestEntry {
  path: string;
  category: 'screen' | 'component' | 'brand';
  name: string;
  hash: string;
  sizeBytes: number;
  variants: string[];
  ingestedAt: string;
}

const SCAN_DIRS: Array<{ dir: string; category: ManifestEntry['category'] }> = [
  { dir: path.join(ASSETS_ROOT, 'figma/screens'), category: 'screen' },
  { dir: path.join(ASSETS_ROOT, 'figma/components'), category: 'component' },
  { dir: path.join(ASSETS_ROOT, 'brand'), category: 'brand' },
];

const IMAGE_EXTS = new Set(['.png', '.svg', '.jpg', '.webp']);

function fileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function findVariants(filePath: string): string[] {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const variants: string[] = [];
  for (const suffix of ['@2x', '@3x']) {
    const candidate = path.join(dir, `${base}${suffix}${ext}`);
    if (fs.existsSync(candidate)) {
      variants.push(path.relative(ASSETS_ROOT, candidate));
    }
  }
  return variants;
}

function main() {
  const manifest: Record<string, ManifestEntry> = {};
  let total = 0;

  for (const { dir, category } of SCAN_DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      continue;
    }
    for (const file of fs.readdirSync(dir)) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;
      if (file.includes('@2x') || file.includes('@3x')) continue;

      const abs = path.join(dir, file);
      const rel = path.relative(ASSETS_ROOT, abs);
      const name = path.basename(file, ext);
      const stat = fs.statSync(abs);

      manifest[name] = {
        path: rel,
        category,
        name,
        hash: fileHash(abs),
        sizeBytes: stat.size,
        variants: findVariants(abs),
        ingestedAt: new Date().toISOString(),
      };
      total++;
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✅  Manifest written to apps/mobile/assets/_manifest.json (${total} assets)`);
}

main();
