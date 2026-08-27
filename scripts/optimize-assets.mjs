#!/usr/bin/env node
/**
 * Optimizes oversized raster images in `src/assets` to WebP.
 *
 * Run with:  npm run optimize:assets
 *
 * The manifest below maps each source image to the target max dimension
 * (longest edge, in px) — approximately 2× the rendered CSS size so icons
 * stay crisp on retina displays without shipping full-resolution source art.
 *
 * After a successful conversion the original file is deleted, so any imports
 * of the replaced file must be updated (e.g. `coins.png` -> `coins.webp`).
 * Re-running the script on already-converted files is a safe no-op.
 */
import sharp from 'sharp';
import { rm, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const BUDGET_BYTES = 250 * 1024;
const QUALITY = 80;

/**
 * [input path (relative to project root), target max dimension in px]
 * Targets match ~2× the rendered size in the components that use them.
 */
const MANIFEST = [
  // GameHeader icons — rendered at 40×40px (w-10 h-10)
  ['src/assets/images/pngs/coins.png', 80],
  ['src/assets/images/pngs/call_a_friend.png', 80],
  ['src/assets/images/pngs/fifty_fifty.png', 80],
  ['src/assets/images/pngs/door.png', 80],
  ['src/assets/images/pngs/mindmint_logo.png', 80],
  ['src/assets/images/pngs/audience.png', 80],
  ['src/assets/images/pngs/bell.png', 80],
  // Avatar — rendered at 32×32px (w-8 h-8)
  ['src/assets/images/pngs/avatar.png', 64],
  // Timer icon — rendered at 24×24px (w-6 h-6)
  ['src/assets/images/pngs/clock.png', 48],
  // Hero image — rendered ~665px wide on desktop; 2× ≈ 1400px
  ['src/assets/hero-image.png', 1400],
];

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

let failed = false;

for (const [input, maxSize] of MANIFEST) {
  const src = join(ROOT, input);
  const output = src.replace(/\.(png|jpe?g)$/i, '.webp');

  let before;
  try {
    before = (await stat(src)).size;
  } catch {
    console.log(`SKIP  ${input} (not found — already optimized?)`);
    continue;
  }

  await sharp(src)
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);

  const after = (await stat(output)).size;
  const status = after <= BUDGET_BYTES ? 'OK' : 'OVER BUDGET';

  console.log(
    `${status}  ${relative(ROOT, output)}  ${formatBytes(before)} -> ${formatBytes(after)}`,
  );

  if (after > BUDGET_BYTES) {
    failed = true;
  } else {
    // Only remove the original once the WebP has been written successfully.
    await rm(src);
    console.log(`      removed original ${input}`);
  }
}

if (failed) {
  console.error(
    `\nOne or more outputs exceed the ${formatBytes(BUDGET_BYTES)} budget. ` +
      'Lower the quality or max dimension, or move the asset to public/ (served on demand, not bundled).',
  );
  process.exit(1);
}

console.log('\nDone. Update any imports that referenced the replaced files (.png -> .webp).');
