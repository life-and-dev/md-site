/**
 * Generate GitHub edit URL for the current page
 */
export function useGitHubEdit() {
  const route = useRoute()
  const siteConfig = useSiteConfig()

  /**
   * Generate GitHub edit URL for current route
   * @returns GitHub edit URL or undefined if not a content page
   */
  function getEditUrl(): string {
    const path = route.path

    // Skip non-content routes
    if (!path || path === '/') {
      // Root page maps to index.md in the content submodule repo
      return `https://github.com/${siteConfig.githubRepo}/blob/${siteConfig.githubBranch}/index.md`
    }

    // Convert route path to content file path
    // Example: /church/history/constantine → church/history/constantine.md (in the submodule repo)
    const contentPath = path.startsWith('/') ? path.slice(1) : path
    return `https://github.com/${siteConfig.githubRepo}/blob/${siteConfig.githubBranch}/${contentPath}.md`
  }

  return {
    getEditUrl
  }
}
