# Asset Policy

This document defines how raster assets are shipped in Mindmint so the app
never regresses to multi-MB bundles. It applies to every contributor adding or
changing images.

## Budget

- **Maximum size: 250 KB per raster asset.** This is enforced automatically:
  - `npm run check:assets` scans `src/assets/` (bundled into the app) and
    `public/` (served on demand) and fails if any raster file exceeds the
    budget.
  - The check runs in CI (`.github/workflows/ci.yml`) and as part of
    `npm run build`, so an oversized asset cannot be merged or built.
- **Target: keep icons ≤ ~20 KB.** The icons in the gameplay header are
  currently 1–2 KB after optimization.

## Formats

- **Raster images: WebP.** Use WebP instead of PNG/JPG for all new raster
  assets. WebP offers much better compression at the same quality.
- **Vector artwork: SVG** where the asset is simple shapes or icons.
- **Animations: WebP/AVIF** — avoid GIF.

## Sizing

- **Never ship images at a larger resolution than ~2× their rendered CSS
  size.** A 40×40 px icon needs at most an 80 px source (crisp on 2× DPI
  displays); a 1000×1000 px source for a 40 px icon is 150× the required
  payload.
- Re-encode oversized assets with:

  ```bash
  npm run optimize:assets
  ```

  This converts the images listed in `scripts/optimize-assets.mjs` to WebP at
  the target dimensions and deletes the originals. After running it, update
  any imports of the replaced files (`.png` → `.webp`).

## Loading

- **Never lazy-load images in the initial viewport** (header icons, hero
  imagery that drives LCP) — keep them eager so they render immediately.
- **Offscreen or large images** (e.g. the hero laptop mockup) get
  `loading="lazy"` and `decoding="async"` so they are not fetched until
  needed. Browsers still fetch lazy images that are in the initial viewport
  immediately, so this is safe for the hero.

## Adding a new image — checklist

1. Export it at ~2× its rendered size (not at source resolution).
2. Save as `.webp` (or `.svg` for vector art).
3. Keep it under 250 KB — run `npm run check:assets` locally.
4. Reference it from `src/assets/` (bundled) or `public/` (served on demand)
   and add `loading="lazy"`/`decoding="async"` when it is offscreen.

## Why

Previously the gameplay header bundled ~10 MB of uncompressed PNGs (each icon
~1 MB, rendered at 40 px) plus a 2 MB hero image, dwarfing the ~116 KB gzipped
JS bundle. Optimized, the same images total ~90 KB — a >99% reduction.
