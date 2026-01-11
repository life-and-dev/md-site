![MD-Site](docs/logo.svg)

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
- `md-site dev [domain]` - Start with domain-specific config (e.g., `md-site dev example`)
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

## Benefits

- ⚡ **Performance**: Pre-rendered HTML files load near-instantly via CDN without database overhead.
- 🛡️ **Security**: No database or server-side vulnerabilities, significantly reducing attack risks.
- 📈 **Scalability**: Handles high traffic effortlessly without expensive infrastructure.
- 🔄 **Versioning**: Content is stored in Git, allowing for easy tracking, reviews, and rollbacks.
- ✅ **Reliability**: No "database connection errors"—if the static file exists, the site works.
- 💰 **Lower Costs**: Static hosting is significantly cheaper (often free) than dynamic hosting.

## Documentation

For detailed documentation, see:
- 💻 **[CLI Usage Guide](docs/cli.md)**: Complete guide to using MD-Site as an npm package
- 📝 **[Markdown Reference](docs/markdown.md)**: GFM alerts, blockquotes, and automatic Table of Contents
- 🛠️ **[Menu Configuration](docs/menu.md)**: Flexible navigation structures
- 🎨 **[Theme Configuration](docs/theme.md)**: Customizable colors and dark mode
- 🖼️ **[Generating Favicons](docs/favicon.md)**: Automated favicon generation
- 🏗️ **[Project Architecture](docs/architecture.md)**: Decoupled design and content processing
- 🔍 **[Search & Indexing](docs/architecture.md)**: Pre-calculated JSON indices
- 📖 **[Bible Verse Tooltips](docs/nuxt.md)**: Scripture reference enhancement
- 🧪 **[Automated Testing](docs/tests.md)**: E2E test suite
- 🚀 **[Deployment](docs/deploy.md)**: Static hosting deployment
