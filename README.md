![MD-Site](docs/logo.svg)

# MD-Site

MD-Site is designed to be a flexible, file-based Markdown Static Site Generator (SSG) where content MD (Markdown) files are completely separated from the renderer (the Nuxt framework).

This project allow content creators to write standard Markdown files while MD-Site provide a robust, high-performance rendering engine that can be deployed in any environment that support static webpages (like Cloudflare Pages).

## Benefits

- ⚡ **Performance**: Pre-rendered HTML files load near-instantly via CDN without database overhead.
- 🛡️ **Security**: No database or server-side vulnerabilities, significantly reducing attack risks.
- 📈 **Scalability**: Handles high traffic effortlessly without expensive infrastructure.
- 🔄 **Versioning**: Content is stored in Git, allowing for easy tracking, reviews, and rollbacks.
- ✅ **Reliability**: No "database connection errors"—if the static file exists, the site works.
- 💰 **Lower Costs**: Static hosting is significantly cheaper (often free) than dynamic hosting.

## Features
- 📝 **[Markdown Reference](docs/markdown.md)**: Support for GFM alerts, Material Design styled blockquotes, and automatic Table of Contents.
- 🛠️ **[Menu Configuration](docs/menu.md)**: Support for flexible navigation structures including nested dropdowns and external links.
- 🎨 **[Theme Configuration](docs/theme.md)**: Customizable look and feel with color tokens and automatic dark mode support.
- 🖼️ **[Generating Favicons](docs/favicon.md)**: Automated generation of all browser and mobile favicons from a single SVG logo.
- 🏗️ **[Project Architecture](docs/architecture.md)**: Decoupled design separating content from the rendering engine for maximum flexibility.
- 🔍 **[Search & Indexing](docs/architecture.md)**: Pre-calculated JSON indices for lightning-fast client-side search.
- 📖 **[Bible Verse Tooltips](docs/nuxt.md)**: Automatic detection and enhancement of scripture references with interactive tooltips.
- 🧪 **[Automated Testing](docs/tests.md)**: Comprehensive E2E test suite using Playwright.
- 🚀 **[Deployment](docs/deploy.md)**: Optimized deployment to static hosting platforms like Cloudflare Pages.

## Feature Toggles

MD-Site allows you to enable or disable specific features globally via your configuration file (e.g., `content.config.yml`). This is done in the `features` section:

```yaml
features:
  bibleTooltips: true  # Automatic Bible reference detection
  sourceEdit: true     # "Edit on GitHub" links
```

Check the **[Features Documentation](docs/features.md)** for a full list of available toggles and their effects.

## Getting Started

The most common way to start the project is using the `npm start` command.

For example to start the documentation site located in the `/docs` directory of this project:

```bash
npm start
```

By running this command, you should see this documentation site running at `http://localhost:3000`.

## Production Deployment

```bash
npm run generate
```

This will generate static HTML files in the `.output/public` directory.

---

For more detailed installation and setup instructions, please refer to the [Documentation](docs/index.md).
