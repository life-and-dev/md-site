<template>
  <article>
    <div v-if="pending" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="!page">
      <v-alert type="error">Home page not found</v-alert>
    </div>
    <div v-else>
      <div class="content-body">
        <ContentRenderer :value="page" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
// Query home page content using Nuxt Content v3 API
// server: true = Only query during SSR/prerendering, never on client
// This prevents 3.5MB database download - client uses prerendered HTML
const { data: page, pending } = await useAsyncData(
  'content-home',
  () => queryCollection('content').path('/').first(),
  { server: true } // true = SSR/prerender only
)

// SEO meta tags
const siteConfig = useSiteConfig()
useHead(() => ({
  title: page.value?.title || 'Home',
  htmlAttrs: { lang: 'en' },
  meta: [
    { name: 'description', content: page.value?.description || '' },
    { name: 'keywords', content: page.value?.keywords?.join(', ') || '' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'canonical', href: siteConfig.canonicalBase }
  ]
}))

// Post-process content: Bible tooltips + TOC generation
useContentPostProcessing(page)
</script>
