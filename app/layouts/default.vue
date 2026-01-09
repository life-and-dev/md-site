<template>
  <v-app>
    <!-- App Bar -->
    <AppBar
      :sidebars-visible="mdAndUp && sidebarsVisible"
      @toggle-menu="handleToggleMenu"
    />

    <!-- Desktop Layout (md and up) -->
    <div v-if="mdAndUp" class="desktop-wrapper">
      <div class="desktop-layout">
        <!-- Left Sidebar (Navigation) -->
        <v-navigation-drawer
          v-model="sidebarsVisible"
          permanent
          absolute
          location="left"
          width="320"
          :touchless="true"
          :scrim="false"
          :disableRouteWatcher="true"
          class="desktop-drawer-left"
        >
          <AppNavigation
            :show-search="true"
            @select="handleNavSelect"
          />
        </v-navigation-drawer>

        <!-- Center Content Column (flexible) -->
        <v-main class="content-area">
          <v-container>
            <div ref="desktopContentContainer">
              <slot />
            </div>
          </v-container>
        </v-main>

        <!-- Right Sidebar (Table of Contents) -->
        <v-navigation-drawer
          v-if="shouldShowTOC"
          v-model="sidebarsVisible"
          permanent
          absolute
          location="right"
          width="320"
          :touchless="true"
          :scrim="false"
          :disableRouteWatcher="true"
          class="desktop-drawer-right"
        >
          <AppTableOfContents
            :toc-items="tocItems"
            :active-id="activeHeadingId"
          />
        </v-navigation-drawer>
      </div>
    </div>

    <!-- Mobile Layout (sm and below) -->
    <div v-else class="mobile-layout">
      <!-- Mobile Drawer -->
      <v-navigation-drawer
        v-model="drawerOpen"
        temporary
        location="left"
        width="320"
      >
        <div class="drawer-content">
          <!-- Search Box -->
          <SearchBox
            @select="handleMobileSelection"
          />

          <v-divider class="my-2" />

          <!-- "On This Page" Section (mobile only) -->
          <v-expansion-panels v-if="shouldShowTOC" flat>
            <v-expansion-panel color="surface-rail">
              <v-expansion-panel-title class="toc-panel-title">
                On This Page
              </v-expansion-panel-title>
              <v-expansion-panel-text class="bg-surface-rail">
                <AppTableOfContents
                  :toc-items="tocItems"
                  :active-id="activeHeadingId"
                  :show-header="false"
                  @item-click="handleMobileSelection"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-divider v-if="shouldShowTOC" class="my-2" />

          <!-- Navigation Tree -->
          <AppNavigation
            :show-search="false"
            @select="handleMobileSelection"
          />
        </div>
      </v-navigation-drawer>

      <!-- Full-width Content -->
      <v-main class="content-area-mobile">
        <v-container>
          <div ref="mobileContentContainer">
            <slot />
          </div>
        </v-container>
      </v-main>
    </div>

    <!-- Footer Bar (always visible on all layouts) -->
    <AppFooter />
  </v-app>
</template>

<script setup lang="ts">
import { useTableOfContents } from '~/composables/useTableOfContents'

const { mdAndUp } = useDisplay()
const route = useRoute()

// Table of Contents state
const desktopContentContainer = ref<HTMLElement>()
const mobileContentContainer = ref<HTMLElement>()
const { tocItems, activeId: activeHeadingId, shouldShowTOC, generateTOC } = useTableOfContents()

// Provide TOC generation function to child pages
provide('generateTOC', () => {
  const container = mdAndUp.value ? desktopContentContainer.value : mobileContentContainer.value
  if (container) {
    generateTOC(container)
  }
})

// Sidebar state - initialize based on screen size
const sidebarsVisible = ref(mdAndUp.value)
const drawerOpen = ref(false)

// Update sidebars visibility when screen size changes
watch(mdAndUp, (newValue) => {
  sidebarsVisible.value = newValue
  if (!newValue) {
    drawerOpen.value = false
  }
})

/**
 * Handle toggle menu (hamburger click)
 */
function handleToggleMenu() {
  if (mdAndUp.value) {
    // Desktop: toggle both sidebars
    sidebarsVisible.value = !sidebarsVisible.value
  } else {
    // Mobile: toggle drawer
    drawerOpen.value = !drawerOpen.value
  }
}

/**
 * Handle navigation selection (desktop)
 */
function handleNavSelect(path: string) {
  // Don't auto-close on desktop
  navigateTo(path)
}

/**
 * Handle any selection in mobile drawer (navigation, search, or TOC)
 * Auto-closes drawer after selection
 */
function handleMobileSelection(path?: string) {
  drawerOpen.value = false
  if (path) {
    navigateTo(path)
  }
}

/**
 * NOTE: We do NOT clear TOC on route change here
 * The page component's useContentPostProcessing handles clearing and regenerating
 * Clearing here causes a race condition where we clear AFTER the page has already generated TOC
 */
</script>

<style>
/* Global: Prevent horizontal scroll on body */
body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* CSS Variables - must be unscoped */
:root {
  --app-bar-height: 56px;
  --footer-height: 56px;
  --sidebar-transition: 0.3s ease;
}

/* Print styles - hide navigation elements */
@media print {
  .v-navigation-drawer {
    display: none !important;
  }

  .content-area {
    margin-left: 0 !important;
    margin-right: 0 !important;
    max-width: 100% !important;
  }
}
</style>

<style scoped>

/* Desktop Wrapper - clips overflow for slide animations */
.desktop-wrapper {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  overflow-y: visible;
  position: relative;
}

/* Desktop Layout - full height flex container */
.desktop-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* Desktop drawers - fixed positioning with independent scrolling */
.desktop-layout :deep(.v-navigation-drawer.desktop-drawer-left),
.desktop-layout :deep(.v-navigation-drawer.desktop-drawer-right) {
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  right: auto !important;
  height: 100vh !important;
  z-index: 1100 !important;
  overflow-y: auto;
}

.desktop-layout :deep(.v-navigation-drawer.desktop-drawer-left) {
  left: 0 !important;
}

.desktop-layout :deep(.v-navigation-drawer.desktop-drawer-right) {
  right: 0 !important;
}

/* Content area - Vuetify handles spacing automatically via --v-layout-* vars */
.content-area {
  flex: 1;
  min-width: 0;
  /* Remove custom margins - Vuetify calculates based on drawer width */
  margin: 0 !important;
}

.content-area-mobile {
  width: 100%;
  overflow-y: auto;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.toc-panel-title {
  font-weight: 600;
  font-size: 0.875rem;
}

/* Ensure proper spacing for container */
:deep(.v-container) {
  max-width: 1200px;
}
</style>
