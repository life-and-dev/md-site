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
  overflow-x: auto;
  background-color: #bbb;
  border: 2px solid rgb(var(--v-theme-outline));
}

@media print {
  pre {
    background-color: white !important;
    border: 2px solid #ccc !important;
  }
}
</style>
