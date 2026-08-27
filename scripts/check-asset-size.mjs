#!/usr/bin/env node
/**
 * Fails when any committed raster asset exceeds the size budget.
 *
 * Run with:  npm run check:assets  (also wired into `npm run build` and CI)
 *
 * The budget is defined in ASSET_POLICY.md. Bundled assets (`src/assets`) are
 * shipped inside the critical bundle, so oversized files there are the main
 * risk; `public/` assets are served on demand, but are still gated so the
 * repo cannot accumulate multi-MB images unnoticed.
 */
import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src/assets', 'public'];
const BUDGET_BYTES = 250 * 1024;
const RASTER_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const offenders = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (RASTER_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      const { size } = await stat(full);
      if (size > BUDGET_BYTES) offenders.push({ file: relative(ROOT, full), size });
    }
  }
}

for (const dir of SCAN_DIRS) await walk(join(ROOT, dir));

if (offenders.length > 0) {
  console.error(
    `Asset size budget exceeded — no file may exceed ${formatBytes(BUDGET_BYTES)} (see ASSET_POLICY.md):`,
  );
  for (const { file, size } of offenders) console.error(`  ${file}  (${formatBytes(size)})`);
  console.error('\nFix: run `npm run optimize:assets`, or move the asset to public/ if it is served on demand.');
  process.exit(1);
}

console.log(
  `Asset size check passed: no file in ${SCAN_DIRS.join(', ')} exceeds ${formatBytes(BUDGET_BYTES)}.`,
);
