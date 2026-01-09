import type { ThemeDefinition } from 'vuetify'

/**
 * Get theme configuration for a specific domain
 * Used at build time via CONTENT environment variable
 */
export function getDomainThemes(domain: string | undefined): Record<string, ThemeDefinition> {
  // 1. Start with default theme (Safety net)
  let themes: Record<string, ThemeDefinition> = {
    light: {
      colors: {
        primary: '#0969da',
        secondary: '#656d76',
        surface: '#ffffff',
        background: '#f6f8fa',
        error: '#cf222e',
        info: '#0969da',
        success: '#1a7f37',
        warning: '#9a6700',
        'surface-rail': '#edf1f5',
        'on-surface-rail': '#32302a',
        'on-selectable': '#24292f',
        'selected': '#dbe3eb',
        'on-selected': '#0969da',
      }
    }
  }

  // 2. Try to load from CMS_CONFIG environment variable (injected by start script)
  if (process.env.CMS_CONFIG) {
    try {
      const config = JSON.parse(process.env.CMS_CONFIG)
      if (config.themes) {
        themes = config.themes
      }
    } catch (e) {
      console.warn('Failed to parse CMS_CONFIG environment variable', e)
    }
  }

  // 3. Automatically determine dark mode based on theme name for all themes
  for (const [name, theme] of Object.entries(themes)) {
    (theme as any).dark = name.toLowerCase().includes('dark')
  }

  return themes
}
