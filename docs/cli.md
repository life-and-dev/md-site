# CLI Usage Guide

MD-Site provides a command-line interface (CLI) that allows you to use it as an npm package without cloning the repository. This is the recommended approach for most users who want to quickly set up and deploy documentation sites.

## Installation

Install MD-Site globally to use it from anywhere on your system:

```bash
npm install -g md-site
```

Or install MD-Site as a development dependency in your project:

```bash
npm install --save-dev md-site
```

## Usage

When installed locally, you can run commands using `npx`:

```bash
npx md-site dev
```

Or add scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "md-site dev",
    "build": "md-site generate"
  }
}
```

## Quick Start

1. **Create a new project directory**:
   ```bash
   mkdir my-docs
   cd my-docs
   ```

2. **Create a configuration file** (`content.config.yml`):
   ```yaml
   contentPath: ./docs
   siteName: My Documentation Site
   features:
     bibleTooltips: false
   themes:
     light:
       colors:
         primary: '#0969da'
     dark:
       colors:
         primary: '#58a6ff'
   ```

3. **Create your content directory**:
   ```bash
   mkdir docs
   ```

4. **Add markdown files**:
   ```bash
   echo "# Welcome\n\nThis is my documentation site." > docs/index.md
   ```

5. **Start the development server**:
   ```bash
   md-site dev
   ```

6. **Open your browser** to `http://localhost:3000`

## CLI Commands

### `md-site dev`

Start the development server with hot reload.

```bash
md-site dev
```

**Options:**
- `--cached` - Skip initial content sync for faster startup

**Examples:**
```bash
# Standard development server
md-site dev

# Start with cached content (faster)
md-site dev --cached

# Use domain-specific config
md-site dev mydomain
```

The development server will:
- Watch for changes to markdown files
- Automatically regenerate navigation and search indices
- Hot reload the browser when content changes

### `md-site generate`

Generate a static HTML site ready for deployment.

```bash
md-site generate
```

**Output:** Static files are generated to `.output/public/` in your project directory.

**Examples:**
```bash
# Generate static site
md-site generate

# Generate with domain-specific config
md-site generate staging
```

After generation, you can:
- Deploy `.output/public/` to any static hosting service
- Preview locally with: `npx serve .output/public`

### Multi-Domain Configuration

You can create multiple configuration files for different environments or domains:

**content.config.yml** (default):
```yaml
contentPath: ./docs
siteName: My Docs
```

**help.config.yml**:
```yaml
contentPath: ./help
siteName: My Help
```

Use the domain parameter to select which config to use:

```bash
md-site dev              # Uses content.config.yml
md-site dev help         # Uses help.config.yml
```

## Project Structure

A typical MD-Site CLI project looks like this:

```
my-docs/
├── content.config.yml    # Main configuration
├── docs/                 # Your markdown content
│   ├── index.md          # Home page
│   ├── some-doc.md       # Some document
│   ├── _menu.yml         # Navigation structure
│   └── some-dir/
│       └── sub-doc.md    # Sub document
├── .output/              # Generated output (after build)
│   └── public/
└── package.json          # Optional: npm scripts
```

## Content Management

### Creating Pages

Simply create `.md` files in your `docs/` directory:

```markdown
# The title that will appear on your menu by default

Your content goes here.

## Subheading

More content...
```

See [Markdown Reference](markdown.md) for more details on Markdown syntax and features.

The file path determines the URL, for example:
- `docs/index.md` → `/`
- `docs/about.md` → `/about`
- `docs/guides/intro.md` → `/guides/intro`

See [Menu Configuration](menu.md) for more details.

## Deployment

### Deploy to Cloudflare Pages

1. Generate static site:
   ```bash
   md-site generate
   ```

2. Deploy `.output/public/` to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy .output/public
   ```

See [Deployment Guide](deploy.md) for more hosting options.

### Deploy to Netlify

1. Generate static site:
   ```bash
   md-site generate
   ```

2. Deploy:
   ```bash
   netlify deploy --prod --dir=.output/public
   ```

### Deploy to GitHub Pages

1. Generate static site:
   ```bash
   md-site generate
   ```

2. Push to `gh-pages` branch:
   ```bash
   cd .output/public
   git init
   git add -A
   git commit -m "Deploy"
   git push -f git@github.com:username/repo.git main:gh-pages
   ```

## Examples

### Basic Documentation Site

```bash
# Create project
mkdir my-docs && cd my-docs

# Create config
cat > content.config.yml << 'EOF'
contentPath: ./docs
siteName: My Documentation
EOF

# Create content
mkdir docs
cat > docs/index.md << 'EOF'
# Welcome
Welcome to my documentation!
EOF

# Start dev server
md-site dev
```

### Multi-Language Setup

Create separate configs for each language:

**en.config.yml**:
```yaml
contentPath: ./docs/en
siteName: Documentation (English)
```

**es.config.yml**:
```yaml
contentPath: ./docs/es
siteName: Documentación (Español)
```

Then run:
```bash
md-site dev en  # English version
md-site dev es  # Spanish version
```

### Custom Theme

```yaml
contentPath: ./docs
siteName: My Branded Docs
themes:
  light:
    colors:
      primary: '#2563eb'        # Blue
      secondary: '#64748b'      # Slate
      surface-appbar: '#f8fafc' # Light gray
      on-primary: '#ffffff'     # White text
      # ...
  dark:
    colors:
      primary: '#3b82f6'        # Lighter blue
      secondary: '#94a3b8'      # Lighter slate
      surface-appbar: '#0f172a' # Dark blue
      on-primary: '#ffffff'     # White text
      # ...
```

See [Theme Configuration](theme.md) for more details.

## Troubleshooting

### Command Not Found

If you get `command not found: md-site`:

1. Check installation:
   ```bash
   npm list -g md-site
   ```

2. Reinstall globally:
   ```bash
   npm install -g md-site
   ```

3. Or use `npx`:
   ```bash
   npx md-site dev
   ```

### Configuration Not Found

Error: `No configuration file found`

**Solution:** Create a `content.config.yml` file in your project root:

```yaml
contentPath: ./docs
siteName: My Site
```

### Port Already in Use

If port 3000 is already in use, the dev server will fail to start.

**Solution:** Kill the process using port 3000:

```bash
# Find process
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Content Not Updating

If changes to markdown files aren't reflected:

1. Stop the dev server (Ctrl+C)
2. Clear the cache:
   ```bash
   rm -rf .nuxt .output .data
   ```
3. Restart dev server:
   ```bash
   md-site dev
   ```

### Build Errors

If you encounter build errors:

1. Check your markdown syntax
2. Ensure all internal links are valid
3. Check for special characters in filenames
4. Clear cache and rebuild:
   ```bash
   rm -rf .nuxt .output
   md-site generate
   ```

## Advanced Usage

### Environment Variables

You can set environment variables to customize behavior:

```bash
# Set content directory explicitly
CONTENT_DIR=/path/to/docs md-site dev

# Set custom port
PORT=8080 md-site dev
```

### npm Scripts

Add convenience scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "md-site dev",
    "dev:cached": "md-site dev --cached",
    "build": "md-site build",
    "generate": "md-site generate",
    "preview": "serve .output/public",
    "deploy:staging": "md-site generate staging && wrangler pages deploy .output/public",
    "deploy:prod": "md-site generate production && wrangler pages deploy .output/public"
  }
}
```

Then run:
```bash
npm run dev
npm run generate
npm run deploy:prod
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install -g md-site

      - name: Generate site
        run: md-site generate

      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy .output/public
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Comparison with Template Mode

| Feature        | CLI Mode                 | Template Mode        |
| -------------- | ------------------------ | -------------------- |
| Installation   | `npm install -g md-site` | `git clone` repo     |
| Customization  | Config only              | Full codebase access |
| Updates        | `npm update -g md-site`  | `git pull` + merge   |
| Use Case       | Quick docs sites         | Custom applications  |
| Components     | Pre-built                | Fully customizable   |
| Build pipeline | Automated                | Direct control       |

**When to use CLI mode:**
- You want to quickly create documentation sites
- You don't need custom Vue components
- You want easy updates via npm

**When to use template mode:**
- You need custom Vue components in markdown
- You want to modify the build pipeline
- You want full control over the Nuxt configuration
