<template>
  <Mermaid v-if="language === 'mermaid'" :code="code" />
  <pre v-else :class="$attrs.class"><slot /></pre>
</template>

<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: null
  },
  filename: {
    type: String,
    default: null
  },
  highlights: {
    type: Array,
    default: () => []
  },
  meta: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
pre {
  position: relative;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  overflow-x: auto;
}

/* Dark mode support if applicable */
:deep(.dark-mode) pre {
  background-color: #1e1e1e;
}
</style>
