# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at localhost:4321
- `npm run build` — Build production site to `./dist/`
- `npm run preview` — Preview production build locally

## Architecture

This is a personal portfolio site for Daniel Grita (visual artist / graphic designer) built with **Astro 6** and deployed to **Vercel** via `@astrojs/vercel`.

- **GitHub:** `github.com/Daniel-Grita/daniel-grita-portfolio`
- **Node engine:** pinned to `22.x`

### Stack

- Astro 6 with strict TypeScript (`astro/tsconfigs/strict`)
- No UI framework (pure Astro components, no React/Vue/etc.)
- Plain CSS only — no Tailwind, no CSS-in-JS
- Font: Quantico (loaded via Google Fonts in Layout)

### Pages

- `/` — Main portfolio page (hero, about, work history, contact) with sticky side navigation
- `/work/[slug]` — Dedicated project pages (one per work entry, currently minimal layout)
- `/design-system` — Living design system reference showing tokens, typography, and component previews

### Layout

`src/layouts/Layout.astro` is the single shared layout. Pages use a two-column CSS grid: main content (`1fr`) + side nav (`90px`), collapsing to single column at 768px.

### Work entries

Work data is defined in `src/data/work.ts` (shared between index and project pages). Each entry has a `slug` field for URL routing. Current entries (most recent first):

1. **PayXpert** — Lead Designer, 2024–Present (`payxpert.jpg`)
2. **Oppressus** — Photoshoot & Video Production, 2024 (`oppressus.avif`)
3. **Signature Spa Consulting** — In-House Designer, 2023–2024 (`signature-spa.avif`)
4. **Adobe & Scopio** — Creative Art Direction & Photography, April 2024 (placeholder)
5. **Lash Paris** — Content Creator & Designer, 2021–2023 (`lash-paris.avif`)

Images are stored in `public/images/`. Entries with real images use `<img>` tags; placeholder entries use a grey `work__image-placeholder` div. The template switches based on whether the image path contains `work-`.

### Animations

- **On-load cascade:** Hero (0s) → About (0.3s) → Work label + first project (0.6s) → Side nav (0.9s). These use the `.fade-in` class (opacity only, no translate).
- **Scroll-triggered:** Remaining work entries and the Contact section fade-up (opacity + translateY 25px, 500ms) via `IntersectionObserver` with `threshold: 0.15`. Each element animates once.
- Animation classes: `.fade-in` (opacity only), `.animate` (opacity + slide-up), `.is-visible` (revealed state).

### Responsive behavior

- **Desktop:** Two-column grid with sticky side nav on the right
- **Mobile (≤768px):** Single column, side nav hidden, sticky top nav bar (`.mobile-nav`) appears with section links
- Contact links stack vertically on mobile

### Styling approach

- Global design tokens are defined as CSS custom properties in `src/styles/global.css` (colors, spacing, font, layout widths)
- Global styles are imported via `<style is:global>` in Layout.astro
- Component/page-specific styles use Astro scoped `<style>` blocks
- BEM-like class naming: `.block__element` pattern (e.g., `.hero__name`, `.work__entry`, `.side-nav__link`)
- Accent color: `--color-accent: #cff500` (chartreuse/lime green)
- Mobile breakpoint: 768px

### Key design tokens

| Token | Value |
|-------|-------|
| `--color-accent` | `#cff500` |
| `--color-bg` | `#ffffff` |
| `--color-title` | `#191d1a` |
| `--color-text` | `#3a3f3b` |
| `--color-text-secondary` | `#6b716c` |
| `--space-xs` through `--space-2xl` | `0.5rem` to `10rem` |
| `--max-width` | `1000px` |

When adding new styles, use existing CSS custom properties rather than hardcoded values.

### Dark mode

- Toggle via `data-theme="dark"` attribute on `<html>`
- Dark token overrides defined in `src/styles/global.css` under `[data-theme="dark"]`
- Anti-flash inline script in `<head>` (Layout.astro) reads `localStorage` / `prefers-color-scheme` before paint
- Toggle button placed in side nav, mobile nav, and project pages
- User preference persisted to `localStorage` under key `theme`

## Session Recap (2026-04-12)

### What landed this session

**Three new projects added** to the `projects` array in `src/data/work.ts`:
- **Chut** (2026), Brand Identity & Commercial Ad. Fictional fruit juice brand + AI generated ad. Has a 6-section narrative project page with bottles, labels+mockup, fridge+social gallery, the commercial video, the Webflow landing page, and a recap paragraph.
- **Oakley** (2025), first AI video exercise, Sensory Overload.
- **Cuerpo Habitable** (2026), fashion video filmed and edited for Bet.

**Video pipeline set up:**
- FFmpeg 8.1 confirmed working in shell.
- Source videos re-encoded (H.264 CRF 23, AAC 128k, faststart) to `public/videos/`:
  - `chut.mp4` (14 MB, from 89 MB)
  - `oakley.mp4` (18 MB, from 43 MB)
  - `cuerpo-habitable.mp4` (47 MB, from 148 MB, kept 1080p60)
- Poster JPGs extracted for each.
- Source files are in `C:/Users/Danie/Downloads/wetransfer_cuerpo-habitable-mp4_2026-04-08_2027/` (Chut images folder too).

**Data model changes (`src/data/work.ts`):**
- New `HeroVideo` interface; `WorkEntry.heroVideo?: HeroVideo` — used by Oakley and Cuerpo Habitable for their hero videos.
- `GallerySection` gained `video?: { src; poster }` for mixed-media sections.

**Template changes (`src/pages/work/[slug].astro`):**
- Renders inline `<video controls preload="metadata" playsinline poster=...>` (no lightbox for video, click the native play button to play in place).
- Supports `section.video` and `section.placeholder` in gallery sections.
- Captions (`section.title`) now render under both images and videos.
- Lightbox remains for images only.
- Styles: `.project__video`, `.project__placeholder`.

**Dimensions (`src/data/image-dimensions.ts`):** entries added for all new webp images and the three video posters (CLS-safe).

**Homepage:** `hasProjectPage` predicate extended to include `heroVideo` so new project cards link through.

### Copy rules (new)
- **No em dashes in any site copy.** Saved to memory as `feedback_no_em_dashes.md`. Year ranges now use en dash (`2024 – Present`), page titles use `|` or `·`. CSS comment headers still contain em dashes but are not user-facing.

### Outstanding work for next session

1. **Optimise all images added this session.** The Chut webp files (bottles, labels, fridge, social, hero, landing) were all scaled to 1920w at quality 82 straight from 8000×4500 JPGs, but have not been audited. Check file sizes vs. visual quality, and see if quality 75 or smaller widths hold up. Same for the video posters.
2. **Simplify the code of the last session.** The `[slug].astro` gallery section render now has three branches (`section.video` / `section.placeholder` / `section.images`) plus a caption check. Worth a pass to see if it can collapse cleanly. Also `heroVideo` support is still in the template but no entry currently uses it, so either wire it back in (Oakley / Cuerpo Habitable as hero video) or remove it.
3. **Loading animations for the new project pages.** The Chut page has six sections rendered via the `gallerySections` map, each using the existing `.animate` / scroll-spy pattern. Verify the on-load cascade and scroll-triggered fade-ups feel right with the longer flow, and that Oakley / Cuerpo Habitable (which currently have nothing but the hero video) don't feel static.

### Still to do after the above
- SEO pass (personalized meta, OG tags, sitemap via `@astrojs/sitemap`, robots.txt, canonical URLs).
- Chut: extract more images from the brand guidelines PDF if we want to flesh the page out further.
