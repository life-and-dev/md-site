<template>
  <article>
    <div v-if="pending" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="!page">
      <v-alert type="error">Page not found</v-alert>
    </div>
    <div v-else>
      <div class="content-body">
        <ContentRenderer :value="page" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()

// Query content using Nuxt Content v3 API
// server: true = Only query during SSR/prerendering, never on client
// This prevents 3.5MB database download - client uses prerendered HTML
const { data: page, pending } = await useAsyncData(
  `content-${route.path}`,
  () => queryCollection('content').path(route.path).first(),
  { server: true }
)

// SEO meta tags
// @nuxt/content v3 automatically extracts title from first H1
const siteConfig = useSiteConfig()
useHead(() => ({
  title: page.value?.title || 'Page',
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'description', content: page.value?.description || '' },
    { name: 'keywords', content: page.value?.keywords?.join(', ') || '' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'canonical', href: `${siteConfig.canonicalBase}${route.path}` }
  ]
}))

// Post-process content: Bible tooltips + TOC generation
useContentPostProcessing(page)
</script>
