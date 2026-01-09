import { defineCollection, defineContentConfig } from '@nuxt/content'
import path from 'path'

// Multi-domain content selection via CONTENT environment variable
const contentDomain = process.env.CONTENT
const contentDir = process.env.CONTENT_DIR || (contentDomain ? path.resolve(`../md-content/${contentDomain}`) : path.resolve('../md-content'))

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        cwd: contentDir,
        include: '**/*.md',
        exclude: ['**/*.draft.md'],
        prefix: '/'
      }
    })
  }
})