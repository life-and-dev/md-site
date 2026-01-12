/**
 * Generate source edit URL for the current page
 */
export function useSourceEdit() {
    const route = useRoute()
    const siteConfig = useSiteConfig()

    /**
     * Generate source edit URL for current route
     * @returns source edit URL or undefined if not enabled or not a content page
     */
    function getEditUrl(): string | undefined {
        const path = route.path
        const repo = siteConfig.contentGitRepo

        // Check if feature is enabled
        if (!siteConfig.features.sourceEdit) {
            return undefined
        }

        // Only render if repo starts with "https://github.com" (current supported provider)
        if (!repo || !repo.startsWith('https://github.com')) {
            return undefined
        }

        // Convert repo URL to repo path (e.g., https://github.com/user/repo → user/repo)
        const repoPath = repo.replace('https://github.com/', '')

        // Skip non-content routes
        if (!path || path === '/') {
            // Root page maps to index.md in the content submodule repo
            return `https://github.com/${repoPath}/blob/${siteConfig.contentGitBranch}/index.md`
        }

        // Convert route path to content file path
        // Example: /church/history/constantine → church/history/constantine.md (in the submodule repo)
        const contentPath = path.startsWith('/') ? path.slice(1) : path
        return `https://github.com/${repoPath}/blob/${siteConfig.contentGitBranch}/${contentPath}.md`
    }

    return {
        getEditUrl
    }
}
