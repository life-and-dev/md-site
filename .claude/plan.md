# Implementation Plan: Convert MD-Site to Dual-Purpose npm Package

## Overview

Convert the MD-Site Nuxt project into a **dual-purpose package** that supports:

1. **CLI Tool Usage** (npm install): Users install globally/locally and run `md-site dev` commands
2. **Template Usage** (git clone): Developers clone the repo and customize it as a Nuxt project

**Critical Requirement:** The existing `npm start` and convenience scripts will remain intact for template users. No breaking changes to existing workflow.

## Architecture Strategy

### Dual-Purpose Package Structure

```
md-site/
├── cli/                         # NEW: CLI sub-project
│   ├── bin/
│   │   └── md-site.js          # CLI entry point
│   ├── src/
│   │   └── index.ts            # CLI implementation
│   ├── lib/
│   │   └── config-loader.ts    # Config utilities
│   ├── tsconfig.json           # CLI-specific TypeScript config
│   └── dist/                   # Compiled CLI output (gitignored)
├── scripts/                     # EXISTING: Keep as-is
│   ├── start.ts                # Template mode entry point
│   ├── sync-content.ts
│   ├── generate-indices.ts
│   └── generate-favicons.ts
├── app/                         # EXISTING: Nuxt app (keep as-is)
├── nuxt.config.ts              # EXISTING: Keep as-is
├── package.json                # UPDATE: Add bin, keep existing scripts
├── tsconfig.json               # EXISTING: Keep as-is
└── README.md                   # UPDATE: Document both workflows
```

### Usage Patterns

**Pattern 1: CLI Tool (npm package)**
```bash
# Install globally
npm install -g md-site

# Or install locally
npm install --save-dev md-site

# Use in any project with content.config.yml
cd my-docs-project/
md-site dev
md-site generate
```

**Pattern 2: Custom Template (git clone)**
```bash
# Clone and customize
git clone https://github.com/your-org/md-site.git my-custom-site
cd my-custom-site
npm install

# Use existing workflow
npm start
npm run generate
npm test
```

## Critical Design Decisions

### 1. Preserve Existing Workflow

**No Breaking Changes to Template Mode:**
- All existing `package.json` scripts remain functional
- `scripts/start.ts` continues to work exactly as before
- Developers cloning the repo have the same experience
- All paths and imports in existing code stay the same

### 2. Add CLI Alongside Existing Code

**New CLI Implementation:**
- Lives in `cli/` directory as a sub-project (doesn't interfere with `scripts/`)
- Compiled to `cli/dist/` (gitignored, only in npm package)
- Reuses logic from existing scripts where possible
- Points to user's CWD for config/content, not package location

### 3. Path Resolution Strategy

**Template Mode (git clone):**
```typescript
// In scripts/start.ts (unchanged)
const rootDir = path.resolve(__dirname, '..')  // Project root
const contentPath = path.resolve(rootDir, config.contentPath)
```

**CLI Mode (npm install):**
```typescript
// In cli/src/index.ts
const USER_CWD = process.cwd()                 // User's project root
const PACKAGE_ROOT = path.resolve(__dirname, '../../..')  // node_modules/md-site
const contentPath = path.resolve(USER_CWD, config.contentPath)

// CLI spawns Nuxt in USER_CWD, not PACKAGE_ROOT
spawn('npx', ['nuxt', 'dev'], {
  cwd: USER_CWD,  // Build in user's directory
  env: {
    ...process.env,
    CONTENT_DIR: contentPath,
    CMS_CONFIG: JSON.stringify(config)
  }
})
```

### 4. Dependency Management

**Main package.json:**
- Keep all existing dependencies (Nuxt, Vue, Vuetify, etc.)
- Add new CLI dependencies (commander, only needed for CLI)
- Remove `"private": true` to allow publishing
- Add `"bin"` field for CLI entry point

**Why keep Nuxt as dependency (not peer dependency)?**
- Template users need Nuxt installed
- CLI users will get Nuxt when they `npm install md-site`
- Simpler for users (no manual dependency installation)

## Implementation Steps

### Phase 1: Add CLI Infrastructure (No Breaking Changes)

#### Step 1.1: Create CLI Entry Point

**File: `cli/bin/md-site.js`**
```javascript
#!/usr/bin/env node

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import compiled CLI from dist/
const cliPath = path.join(__dirname, '../dist/index.js')
await import(cliPath)
```

**File: `cli/src/index.ts`**
```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import path from 'path'
import { spawn } from 'child_process'
import fs from 'fs-extra'
import { loadConfig } from '../lib/config-loader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// User's project root (where they run the command)
const USER_CWD = process.cwd()

// Package root when installed in node_modules
const PACKAGE_ROOT = path.resolve(__dirname, '../../..')  // node_modules/md-site

const program = new Command()

program
  .name('md-site')
  .description('Markdown Static Site Generator')
  .version('1.0.0')

program
  .command('dev')
  .description('Start development server')
  .option('--cached', 'Skip initial content sync')
  .action(async (options) => {
    await runCommand('dev', options)
  })

program
  .command('build')
  .description('Build site for production')
  .action(async () => {
    await runCommand('build', {})
  })

program
  .command('generate')
  .description('Generate static site')
  .action(async () => {
    await runCommand('generate', {})
  })

async function runCommand(
  mode: 'dev' | 'build' | 'generate',
  options: { cached?: boolean }
) {
  try {
    // 1. Load config from user's project root
    const config = await loadConfig(USER_CWD)

    // 2. Resolve content directory relative to user's CWD
    const contentDir = path.resolve(USER_CWD, config.contentPath || './docs')

    // 3. Ensure required directories exist in user's project
    await fs.ensureDir(path.join(USER_CWD, 'public'))

    // 4. Set environment variables for Nuxt
    process.env.CONTENT = config.domain || 'cms'
    process.env.CONTENT_DIR = contentDir
    process.env.CMS_CONFIG = JSON.stringify(config)

    // 5. Run content sync (from package scripts directory)
    const scriptsPath = path.join(PACKAGE_ROOT, 'scripts')
    if (mode === 'dev' && !options.cached) {
      const { startWatcher } = await import(path.join(scriptsPath, 'sync-content.js'))
      await startWatcher()
    } else if (mode === 'build' || mode === 'generate') {
      const { syncContent } = await import(path.join(scriptsPath, 'sync-content.js'))
      await syncContent()
    }

    // 6. Spawn Nuxt in user's directory
    console.log(`✨ Starting Nuxt ${mode.toUpperCase()}...`)
    const nuxtCommand = mode
    const nuxtProcess = spawn('npx', ['nuxt', nuxtCommand], {
      cwd: USER_CWD,  // Run in user's directory, not package directory
      stdio: 'inherit',
      env: process.env
    })

    nuxtProcess.on('close', (code) => {
      process.exit(code ?? 0)
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

program.parse()
```

#### Step 1.2: Create Config Loader

**File: `cli/lib/config-loader.ts`**
```typescript
import fs from 'fs-extra'
import path from 'path'
import YAML from 'yaml'

export interface SiteConfig {
  contentPath?: string
  domain?: string
  siteName?: string
  features?: {
    bibleTooltips?: boolean
  }
  themes?: {
    light?: { colors: Record<string, string> }
    dark?: { colors: Record<string, string> }
  }
  githubRepo?: string
  githubBranch?: string
  canonicalBase?: string
}

function findConfig(dir: string, basename: string): string | null {
  const yamlPath = path.join(dir, `${basename}.yaml`)
  const ymlPath = path.join(dir, `${basename}.yml`)

  if (fs.existsSync(yamlPath)) return yamlPath
  if (fs.existsSync(ymlPath)) return ymlPath
  return null
}

export async function loadConfig(
  userCwd: string,
  domain?: string
): Promise<SiteConfig> {
  // Try domain-specific config first
  let configPath = domain ? findConfig(userCwd, `${domain}.config`) : null

  // Fallback to content.config
  if (!configPath) {
    configPath = findConfig(userCwd, 'content.config')
  }

  if (!configPath) {
    throw new Error(
      'No configuration file found. Please create content.config.yml in your project root.\n' +
      'Example:\n' +
      '  contentPath: ./docs\n' +
      '  siteName: My Documentation Site'
    )
  }

  const configContent = await fs.readFile(configPath, 'utf8')
  const config = YAML.parse(configContent) as SiteConfig

  console.log(`📝 Using config: ${path.basename(configPath)}`)
  console.log(`📂 Content path: ${config.contentPath || './docs'}`)

  return config
}
```

#### Step 1.3: Create TypeScript Build Config

**File: `cli/tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "lib/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Phase 2: Update Package Configuration

#### Step 2.1: Update package.json

**Modify `/home/gizbar/git/md-site/package.json`:**

Make the following changes:

1. Change `"private": true` to `"private": false`
2. Add `"bin"` field:
   ```json
   "bin": {
     "md-site": "./cli/bin/md-site.js"
   }
   ```
3. Add `"files"` field:
   ```json
   "files": [
     "cli/bin/",
     "cli/dist/",
     "app/",
     "scripts/",
     "nuxt.config.ts",
     "tsconfig.json",
     "README.md"
   ]
   ```
4. Add CLI build scripts (keep all existing scripts):
   ```json
   "build:cli": "cd cli && tsc",
   "prepublishOnly": "npm run build:cli"
   ```
5. Add to dependencies (keep all existing deps):
   ```json
   "commander": "^12.0.0",
   "fs-extra": "^11.3.2"
   ```
6. Add to devDependencies (if not already there):
   ```json
   "@types/fs-extra": "^11.0.4"
   ```
7. Add metadata fields:
   ```json
   "description": "File-based Markdown Static Site Generator built with Nuxt",
   "keywords": [
     "markdown",
     "static-site-generator",
     "ssg",
     "nuxt",
     "documentation",
     "cms"
   ],
   "author": "Your Name",
   "license": "MIT",
   "repository": {
     "type": "git",
     "url": "https://github.com/your-org/md-site.git"
   },
   "engines": {
     "node": ">=18.0.0"
   }
   ```

**Key Changes:**
- ✅ `"private": false` - Allow publishing to npm
- ✅ `"bin"` field - Register CLI command
- ✅ `"files"` - Specify what gets published
- ✅ `"build:cli"` script - Compile TypeScript CLI
- ✅ `"prepublishOnly"` - Auto-build CLI before publishing
- ✅ Keep all existing scripts unchanged
- ✅ Add `commander` and `fs-extra` to dependencies

#### Step 2.2: Update .gitignore

**Add to `/home/gizbar/git/md-site/.gitignore`:**

```gitignore
# CLI build output
/cli/dist/
```

### Phase 3: Documentation

#### Step 3.1: Update README.md

**Replace `/home/gizbar/git/md-site/README.md` with:**

```markdown
# MD-Site

File-based Markdown Static Site Generator built with Nuxt.

## Two Ways to Use MD-Site

### Option 1: CLI Tool (Recommended for Most Users)

Install MD-Site as an npm package and use it in any project.

#### Installation

```bash
# Global installation
npm install -g md-site

# Or local installation
npm install --save-dev md-site
```

#### Quick Start

1. Create a new project directory:
```bash
mkdir my-docs
cd my-docs
```

2. Create a `content.config.yml`:
```yaml
contentPath: ./docs
siteName: My Documentation
features:
  bibleTooltips: false
themes:
  light:
    colors:
      primary: '#0969da'
```

3. Create markdown content:
```bash
mkdir docs
echo "# Hello World" > docs/index.md
```

4. Start the dev server:
```bash
md-site dev
```

5. Generate static site:
```bash
md-site generate
```

Your site will be in `.output/public/`.

#### CLI Commands

- `md-site dev` - Start development server with hot reload
- `md-site dev --cached` - Start dev server without re-syncing content
- `md-site build` - Build for production
- `md-site generate` - Generate static HTML site

#### Configuration

Place `content.config.yml` in your project root:

```yaml
contentPath: ./docs              # Path to markdown files
siteName: My Site                # Site name (used in metadata)
githubRepo: username/repo        # Optional: Enable "Edit on GitHub"
githubBranch: main               # Optional: Branch for edit links
features:
  bibleTooltips: true            # Enable Bible verse tooltips
themes:
  light:
    colors:
      primary: '#color'          # Customize theme colors
  dark:
    colors:
      primary: '#color'
```

Multi-domain support: Create `example.config.yml` and run `md-site dev example`.

---

### Option 2: Custom Template (For Full Customization)

Clone the repository and customize the Nuxt application directly.

#### Installation

```bash
git clone https://github.com/your-org/md-site.git my-custom-site
cd my-custom-site
npm install
```

#### Development

```bash
# Start dev server
npm start

# Build for production
npm run build

# Generate static site
npm run generate

# Run tests
npm test
```

#### Customization

When cloning the repository, you have full access to:

- **Components**: Modify `app/components/` to customize UI
- **Layouts**: Edit `app/layouts/default.vue` for structure
- **Composables**: Extend `app/composables/` for custom logic
- **Nuxt Config**: Modify `nuxt.config.ts` for build settings
- **Scripts**: Customize `scripts/` for build pipeline

This mode is recommended if you need:
- Custom Vue components in markdown
- Modified build pipeline
- Different Nuxt modules
- Complete control over the application

---

## Features

- 📝 Write content in Markdown (GFM supported)
- 🎨 Customizable themes (light/dark mode)
- 🔍 Built-in search
- 📱 Responsive navigation
- 🖼️ Image optimization
- 📖 Table of contents
- ⚡ Static generation (no runtime overhead)
- 🌐 Multi-domain support
- 📚 Bible verse tooltips (optional)

## Documentation

For detailed documentation, see the full documentation site.

## License

MIT
```

### Phase 4: Testing Strategy

#### Test 4.1: CLI Package Testing

**Local Testing with npm link:**

```bash
# In md-site repo
npm run build:cli
npm link

# In test project
cd /tmp/test-md-site
mkdir docs
echo "# Test" > docs/index.md
cat > content.config.yml << EOF
contentPath: ./docs
siteName: Test Site
EOF

md-site dev
# Verify: Server starts, serves content

md-site generate
# Verify: .output/public/ contains static files
```

#### Test 4.2: Template Mode Testing

```bash
# Clone repo
git clone <repo-url> test-template
cd test-template
npm install

# Test existing workflow
npm start
# Verify: Works exactly as before

npm run generate
# Verify: Generates static site
```

#### Test 4.3: Verify No Breaking Changes

**Checklist:**
- [ ] `npm start` works in cloned repo
- [ ] `npm run build` works in cloned repo
- [ ] `npm run generate` works in cloned repo
- [ ] `npm test` works in cloned repo
- [ ] Multi-domain configs still work (e.g., `npm start example`)
- [ ] All existing scripts function correctly

### Phase 5: Publishing

#### Step 5.1: Pre-publish Checklist

- [ ] Update version in package.json
- [ ] Run `npm run build:cli` successfully
- [ ] Test CLI with `npm link`
- [ ] Test template mode with `npm start`
- [ ] Update CHANGELOG.md with changes
- [ ] Verify `package.json` fields (author, repository, keywords)
- [ ] Check `README.md` has both usage patterns documented

#### Step 5.2: Publish to npm

```bash
# Dry run to verify package contents
npm publish --dry-run

# Check what files will be included
npm pack
tar -xvzf md-site-1.0.0.tgz
ls -la package/

# Publish to npm
npm publish
```

#### Step 5.3: Post-publish Testing

```bash
# Test fresh installation
npm uninstall -g md-site
npm install -g md-site

# Verify CLI works
md-site --version
md-site --help
```

## Critical Files to Create/Modify

### New Files to Create

| File | Purpose |
|------|---------|
| `cli/bin/md-site.js` | CLI entry point (thin wrapper) |
| `cli/src/index.ts` | Main CLI implementation with Commander |
| `cli/lib/config-loader.ts` | Reusable config loading utilities |
| `cli/tsconfig.json` | TypeScript config for CLI compilation |

### Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add bin, files, build:cli script; remove private; add metadata |
| `.gitignore` | Add /cli/dist/ to ignore list |
| `README.md` | Document both CLI and template usage |

### Files to Keep Unchanged

- `scripts/start.ts` - Template mode entry point
- `scripts/sync-content.ts` - Content sync logic
- `scripts/generate-indices.ts` - Index generation
- `scripts/generate-favicons.ts` - Favicon generation
- `app/` - Entire Nuxt application
- `nuxt.config.ts` - Nuxt configuration
- All Vue components, composables, layouts, pages

## Architecture Decisions

### Why Not Refactor Existing Scripts?

**Decision:** Keep existing scripts unchanged, create new CLI as separate sub-project in `cli/` directory.

**Rationale:**
- Preserves template mode workflow (no breaking changes)
- Clear isolation of CLI concerns in dedicated directory
- Could be extracted to separate package later if needed
- Simpler to maintain two entry points than one complex entry
- Reduces risk of breaking existing functionality
- Makes it clear which mode is being used

### Why Include Nuxt in Dependencies?

**Decision:** Keep Nuxt as a regular dependency, not peer dependency.

**Rationale:**
- Template users need Nuxt installed
- CLI users get everything in one install
- Simpler user experience
- Avoids peer dependency warnings

### Why Compile CLI but Not Nuxt App?

**Decision:** Compile TypeScript CLI to `cli/dist/`, ship Nuxt app as source.

**Rationale:**
- CLI needs to be executable immediately
- Nuxt compiles itself at runtime (`nuxt prepare`, `nuxt dev`)
- TypeScript source works fine for Nuxt (it has built-in TS support)
- Smaller package size (no double compilation)
- CLI isolated in own directory with own build config

## Verification Checklist

### CLI Mode Verification

- [ ] `npm install -g md-site` works
- [ ] `md-site --version` shows version
- [ ] `md-site dev` starts dev server in user's project
- [ ] `md-site generate` creates `.output/public/` in user's CWD
- [ ] Config loaded from user's `content.config.yml`
- [ ] Content loaded from user's content directory
- [ ] Multi-domain configs work: `md-site dev example`

### Template Mode Verification

- [ ] `git clone` + `npm install` works
- [ ] `npm start` runs dev server
- [ ] `npm run generate` creates static site
- [ ] `npm test` runs tests
- [ ] Custom components in `app/` can be modified
- [ ] Nuxt config can be customized
- [ ] All existing workflows preserved

### Package Integrity

- [ ] Published package contains: cli/bin/, cli/dist/, app/, scripts/
- [ ] Package doesn't contain: node_modules/, .nuxt/, .output/, cli/src/, cli/lib/ (source)
- [ ] CLI binary is executable
- [ ] README documents both usage patterns
- [ ] package.json has correct metadata

## User Experience Flows

### Flow 1: CLI User Installing Package

```bash
# Install package
npm install -g md-site

# Set up new project
mkdir my-docs && cd my-docs
cat > content.config.yml << EOF
contentPath: ./docs
siteName: My Docs
EOF

mkdir docs
echo "# Welcome" > docs/index.md

# Use it
md-site dev         # Development
md-site generate    # Production build
```

**Expected Result:**
- Dev server at localhost:3000
- Static site in `.output/public/`
- No Nuxt files in user's project (clean)

### Flow 2: Developer Cloning for Customization

```bash
# Clone repository
git clone https://github.com/your-org/md-site.git my-custom-docs
cd my-custom-docs

# Install dependencies
npm install

# Customize
vim app/components/AppNavigation.vue  # Edit components
vim nuxt.config.ts                   # Modify Nuxt config

# Use existing workflow
npm start           # Same as before
npm run generate    # Same as before
```

**Expected Result:**
- Full control over codebase
- Can modify any file
- Can add custom Nuxt modules
- Existing scripts work unchanged

## Risk Mitigation

### Risk: Breaking Template Mode

**Mitigation:**
- Keep all existing files unchanged
- Add new files only (cli/)
- Test template mode after every change
- Maintain separate entry points

### Risk: Path Resolution Issues

**Mitigation:**
- CLI uses `process.cwd()` for user's project
- Template mode uses `__dirname` for project root
- Clear separation between package root and user root
- Thorough testing with npm link

### Risk: Dependency Conflicts

**Mitigation:**
- Keep all dependencies as regular deps (not peer)
- Document required Node version (>=18)
- Test on fresh npm installs
- Use `npm link` for local testing before publishing

## Summary

This implementation plan provides:

1. **Zero-config CLI tool** for quick documentation sites
2. **Full source template** for advanced customization
3. **No breaking changes** to existing workflow
4. **Clear separation** between CLI and template modes
5. **Backward compatibility** with all existing scripts

The dual-purpose approach maximizes flexibility while maintaining simplicity for both use cases.

## Implementation Order

Execute phases in this exact order:

1. **Phase 1**: Create all new files in `cli/` directory
2. **Phase 2**: Update package configuration files
3. **Phase 3**: Update documentation
4. **Phase 4**: Test both modes thoroughly
5. **Phase 5**: Publish to npm

Do NOT skip testing. Both CLI and template modes must work before publishing.
