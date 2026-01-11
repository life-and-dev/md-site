# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MD-Site is a file-based Markdown Static Site Generator (SSG) with strict separation between content (Markdown files) and renderer (Nuxt framework). Multiple websites can share the same codebase by pointing to different content directories through configuration files.

The architecture uses a pre-build pipeline that transforms Markdown content into JSON indices for navigation and search, rather than processing Markdown at runtime.

## Common Commands

### Development
```bash
# Start dev server with default content (content.config.yml)
npm start

# Start dev server with specific domain config
npm start <domain>

# Start dev server with cached content (skip initial sync)
npm run dev:cached
```

### Build & Deploy
```bash
# Generate static site
npm run generate

# Build without generating static files
npm run build

# Preview generated static site
npm run preview
```

### Testing
```bash
# Run unit tests (Vitest)
npm test

# Run E2E tests (Playwright)
npx playwright test
```

### Utilities
```bash
# Generate favicons from logo.svg
npm run favicon
```

## Configuration Architecture

The project uses YAML configuration files to define content sources and theming:

- **Global config**: `content.config.yml` (default configuration)
- **Domain-specific config**: `<domain>.config.yml` (overrides global config)

Configuration files specify:
- `contentPath`: Directory containing Markdown files (default: `./docs`)
- `siteName`: Site title for metadata
- `features.bibleTooltips`: Enable/disable Bible verse tooltip feature
- `themes`: Light and dark theme color tokens (Vuetify theme system)
- `githubRepo` and `githubBranch`: For "Edit on GitHub" links

The `scripts/start.ts` file orchestrates configuration loading and passes settings via environment variables (`CONTENT`, `CONTENT_DIR`, `CMS_CONFIG`).

## Content Processing Pipeline

Content flows through a multi-stage pipeline from Markdown to rendered HTML:

### 1. Content Sync (`scripts/sync-content.ts`)
- Copies images and static assets from content directory to `public/`
- Watches for file changes in development mode
- Copies favicon files from content's `favicon/` directory
- Syncs `_menu.yml` files for navigation structure

### 2. Index Generation (`scripts/generate-indices.ts`)
Pre-generates JSON files consumed by the client:

- **`_navigation.json`**: Complete navigation tree built from:
  - `_menu.yml` files (manual menu structure)
  - Markdown file headers (H1 titles)
  - Frontmatter metadata (descriptions)

- **`_search-index.json`**: Searchable content index containing:
  - Page titles and descriptions
  - Keywords from frontmatter
  - Content snippets for search results

These indices are generated during `build:before` hook and on file changes during development (with 5-second debouncing).

### 3. Markdown Transformation (`nuxt.config.ts` hooks)
The `content:file:beforeParse` hook transforms Markdown before AST parsing:

- **GFM Alerts**: Converts `> [!NOTE]` syntax to custom `::markdown-alert` components
- **Bible References**: Wraps Bible verse references (e.g., "John 3:16") in `<span class="bible-ref">` for tooltip activation (only if `features.bibleTooltips` is enabled)

This pre-processing prevents hydration mismatches by ensuring server and client render identically.

### 4. Client-Side Rendering
Vue components fetch pre-generated JSON files rather than processing Markdown at runtime:
- Navigation tree loaded via `useNavigationTree()` composable
- Search index loaded via `useSearchIndex()` composable
- Content rendering handled by `@nuxt/content` module

## Key Architecture Patterns

### Multi-Domain Support
The same codebase serves multiple sites by:
1. Using `CONTENT` env var to select configuration (domain identifier)
2. Resolving content directory via `CONTENT_DIR` or config's `contentPath`
3. Loading domain-specific themes from `app/config/themes.ts` via `getDomainThemes()`

### Static-First Approach
- Uses Nitro's `preset: 'static'` for pure static generation (no SPA fallbacks)
- SSR enabled during build to generate full HTML files
- All dynamic data (navigation, search) pre-calculated at build time

### Component Organization
- **Layouts**: `app/layouts/default.vue` provides the main site structure (AppBar, AppNavigation, content area, AppFooter)
- **Pages**: Catch-all route `[...slug].vue` renders any Markdown content path
- **Components**: Organized in `app/components/` with custom content renderers in `components/content/`
- **Composables**: Business logic extracted to `app/composables/` (navigation, search, theming, Bible tooltips, etc.)

### Theming System
Themes defined in YAML configs are transformed to Vuetify theme objects via `getDomainThemes()`. Color tokens follow Material Design 3 naming:
- Surface variants: `surface-rail`, `surface-appbar`
- State colors: `primary`, `secondary`, `selected`, `error`, `warning`, `info`, `success`
- Contrast colors: `on-*` variants for text/icons on colored backgrounds

## Directory Structure

```
app/
├── assets/css/           # Global stylesheets (markdown.css, bible-tooltips.css)
├── components/           # Vue components
│   └── content/         # Custom markdown renderers
├── composables/         # Reusable composition functions
├── config/              # Configuration utilities (themes.ts)
├── layouts/             # Page layouts (default.vue)
├── pages/               # Route pages (index.vue, [...slug].vue)
├── plugins/             # Nuxt plugins
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (bible-verse-utils.ts, etc.)

scripts/
├── generate-favicons.ts # Favicon generation from logo.svg
├── generate-indices.ts  # Navigation and search index generation
├── start.ts             # Main entry point for dev/build
└── sync-content.ts      # Content directory sync and file watching

public/                  # Static assets (generated at build/dev time)
.data/                   # Temporary build data
.output/                 # Nuxt build output
```

## Development Workflow

1. **Starting Development**:
   - Run `npm start` which invokes `scripts/start.ts`
   - Start script loads YAML config, sets env vars, starts content watcher
   - Content sync copies assets to `public/`
   - Nuxt dev server starts with hot reload

2. **File Watching**:
   - `chokidar` watches content directory for changes
   - Image/asset changes trigger immediate copy to `public/`
   - Markdown/menu changes trigger debounced JSON regeneration (5-second delay)

3. **Adding New Content**:
   - Create `.md` files in the content directory
   - Add `_menu.yml` files to define custom navigation structure
   - System automatically picks up changes and regenerates indices

4. **Testing Changes**:
   - Unit tests: `npm test` (tests in `*.test.ts` files)
   - E2E tests: `npx playwright test`
   - Manual testing: View changes at `http://localhost:3000`

## Special Features

### Bible Verse Tooltips
When `features.bibleTooltips: true` in config:
- `bible-book-names.ts` defines regex patterns for scripture references
- `content:file:beforeParse` hook wraps references in spans
- Client-side `useBibleTooltips()` composable activates tooltips
- Verse text fetched from external API and cached

### Favicon Generation
- Run `npm run favicon` to generate all favicon formats from `logo.svg`
- Generates: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, PWA icons
- Creates `site.webmanifest` with site name from config
- Automatically runs during build process

### GitHub Integration
If `githubRepo` and `githubBranch` are set in config:
- "Edit on GitHub" links appear on content pages
- Generated via `useGitHubEdit()` composable

## TypeScript Configuration

Project uses strict TypeScript (`typescript.strict: true` in `nuxt.config.ts`):
- Type checking disabled during build (`typeCheck: false`) for performance
- Types available in `app/types/` directory
- Auto-generated Nuxt types in `.nuxt/types/`

## Testing Notes

- **Unit Tests**: Located alongside source files as `*.test.ts`
- **E2E Tests**: Configured in `playwright.config.js`
- Search relevance logic has comprehensive test coverage (`useSearchRelevance.test.ts`)
- Bible verse parsing utilities tested in `bible-verse-utils.test.ts`
