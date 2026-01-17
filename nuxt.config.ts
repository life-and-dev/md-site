// https://nuxt.com/docs/api/configuration/nuxt-config
import { getDomainThemes } from './app/config/themes'
import { createBibleReferencePatterns } from './app/utils/bible-book-names'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      contentDomain: process.env.CONTENT,
      // Pass the full site configuration to the client
      siteConfig: process.env.CONTENT_CONFIG ? JSON.parse(process.env.CONTENT_CONFIG) : {}
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  nitro: {
    preset: 'static'  // Pure static preset - no SPA fallbacks
  },

  ssr: true,

  css: [
    '~/assets/css/markdown.css',
    '~/assets/css/print.css',
    '~/assets/css/bible-tooltips.css'
  ],

  modules: [
    'vuetify-nuxt-module',
    '@nuxt/content'
  ],

  content: {},

  vite: {
    build: {
      rollupOptions: {
        external: ['fs/promises', 'path']
      }
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap' }
      ]
    }
  },

  hooks: {
    // Wrap Bible verses in spans BEFORE markdown is parsed to AST
    // This prevents hydration mismatch by ensuring server and client HTML match
    'content:file:beforeParse': (ctx: { file: any }) => {
      const { file } = ctx
      if (!file.id.endsWith('.md')) return

      const excludedContexts = ['```', '~~~', '<code', '<pre', '<a ']

      // Check if we're inside excluded context
      const isInExcludedContext = (text: string, index: number): boolean => {
        const before = text.substring(0, index)

        // Check for code blocks
        const codeBlockCount = (before.match(/```/g) || []).length
        if (codeBlockCount % 2 === 1) return true

        // Check for inline code blocks - count backticks in the current line
        const lastNewline = before.lastIndexOf('\n')
        const currentLine = lastNewline === -1 ? before : before.substring(lastNewline + 1)
        const backtickCount = (currentLine.match(/`/g) || []).length
        if (backtickCount % 2 === 1) return true

        // Check for links - rough check for [text](url) format
        const lastOpenBracket = before.lastIndexOf('[')
        const lastCloseBracket = before.lastIndexOf(']')
        if (lastOpenBracket > lastCloseBracket) return true

        return false
      }

      // Process GFM Alerts (> [!NOTE])
      const alertPattern = /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*(?:\n>.*)*)/gm
      file.body = file.body.replace(alertPattern, (match: any, type: string, content: string, offset: number) => {
        if (isInExcludedContext(file.body, offset)) return match

        const cleanContent = content.split('\n')
          .map((line: string) => line.replace(/^>\s?/, ''))
          .join('\n')
        return `::markdown-alert{type="${type.toLowerCase()}"}\n${cleanContent.trim()}\n::\n`
      })

      // Check if Bible tooltips feature is enabled in CMS config
      let enableBibleTooltips = false
      if (process.env.CONTENT_CONFIG) {
        try {
          const config = JSON.parse(process.env.CONTENT_CONFIG)
          if (config.features && typeof config.features.bibleTooltips === 'boolean') {
            enableBibleTooltips = config.features.bibleTooltips
          }
        } catch (e) {
          console.warn('Failed to parse CONTENT_CONFIG for feature check', e)
        }
      }

      if (!enableBibleTooltips) return

      console.log('📖 Processing Bible verses in:', file.id)

      const patterns = createBibleReferencePatterns()

      // Process each pattern
      patterns.forEach(pattern => {
        const matches: Array<{ index: number; text: string }> = []

        let match
        while ((match = pattern.exec(file.body)) !== null) {
          if (!isInExcludedContext(file.body, match.index)) {
            matches.push({
              index: match.index,
              text: match[0]
            })
          }
        }
        pattern.lastIndex = 0

        // Replace matches in reverse order to preserve indices
        matches.reverse().forEach(({ index, text }) => {
          const before = file.body.substring(0, index)
          const after = file.body.substring(index + text.length)
          const wrapped = `<span class="bible-ref" data-reference="${text}">${text}</span>`
          file.body = before + wrapped + after
        })
      })
    },

    'ready': async (nuxt: { options: { dev: any } }) => {
      if (nuxt.options.dev) {
        const { startWatcher } = await import('./scripts/sync-content')
        await startWatcher()
      }
    },

    // Generate navigation, search index, and favicons before build
    'build:before': async () => {

      // Skip during 'nuxt prepare' or if no configuration is provided
      if (process.argv.includes('prepare') || !process.env.CONTENT_CONFIG) {
        return
      }

      const domain: string = process.env.CONTENT || ''

      // Generate navigation and search JSON files
      console.log(`\n🔨 Generating navigation and search index...`)
      const { buildContentData } = await import('./scripts/generate-indices')

      await buildContentData()

      // Generate favicons
      const { generateFavicons, copyFaviconsToPublic, generateWebManifest } = await import('./scripts/generate-favicons')

      // Extract site name from configuration
      let name = domain
      if (process.env.CONTENT_CONFIG) {
        try {
          const config = JSON.parse(process.env.CONTENT_CONFIG)
          if (config.site?.name) {
            name = config.site.name
          }
        } catch (e) {
          console.warn('Failed to parse CONTENT_CONFIG for site name', e)
        }
      }

      console.log(`\n🎨 Generating favicons for build...`)
      const success = await generateFavicons(domain)

      if (success) {
        await copyFaviconsToPublic(domain)
        await generateWebManifest(domain, name)
        console.log(`✅ Favicons ready for ${domain}\n`)
      }
    }
  },

  vuetify: {
    vuetifyOptions: {
      theme: {
        themes: getDomainThemes(process.env.CONTENT)
      },
      // Minimal component defaults - MD3 compliant
      defaults: {
        // Form Controls
        VTextField: {
          rounded: 'pill',
          variant: 'outlined',
          hideDetails: 'auto',
        },
        VTextarea: {
          variant: 'outlined',
          hideDetails: 'auto'
        },
        VSelect: {
          variant: 'outlined',
          hideDetails: 'auto'
        },
        VCheckbox: {
          color: 'primary',
          hideDetails: 'auto'
        },
        VRadioGroup: {
          density: 'compact'
        },

        // Layout Components
        VCard: {
          color: 'surface',
          elevation: 0,
          rounded: 'xl',
          variant: 'flat'
        },
        VCardActions: {
          class: 'justify-end pa-4'
        },

        // Interactive Components
        VBtn: {
          variant: 'flat',
          rounded: 'pill',
          elevation: 0,
          color: 'primary',
          class: 'transition-all'
        },
        'VBtn[color="secondary"]': {
          variant: 'outlined'
        },
        VDataTable: {
          variant: 'outlined',
          itemsPerPage: 25,
          showSelect: false
        },
        VDialog: {
          maxWidth: '600px',
          elevation: 24
        },
        VAlert: {
          variant: 'tonal'
        },

        // Navigation Components
        VTabs: {
          color: 'primary'
        },
        VAppBar: {
          elevation: 1,
          color: 'surface-appbar'
        },
        VNavigationDrawer: {
          elevation: 12,
          color: 'surface-rail',
          style: 'z-index: 1010;'
        },

        // Additional Components
        VChip: {
          variant: 'flat'
        },
        VSwitch: {
          color: 'primary',
          hideDetails: 'auto'
        },
        VListItem: {
          color: 'secondary'
        },
        VMenu: {
          elevation: 8
        }
      }
    }
  }
})
