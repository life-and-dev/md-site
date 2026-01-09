interface SiteConfig {
  domain: string
  siteName: string
  canonicalBase: string
  githubRepo: string
  githubBranch: string
}

/**
 * Get site configuration based on runtime config (populated from CMS_CONFIG)
 */
export function useSiteConfig(): SiteConfig {
  const config = useRuntimeConfig()
  const siteConfig = config.public.siteConfig as unknown as SiteConfig

  return {
    domain: siteConfig?.domain || 'localhost',
    siteName: siteConfig?.siteName || 'Markdown CMS',
    canonicalBase: siteConfig?.canonicalBase || '',
    githubRepo: siteConfig?.githubRepo || '',
    githubBranch: siteConfig?.githubBranch || 'main'
  }
}
