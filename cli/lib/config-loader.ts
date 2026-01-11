import fs from 'fs-extra'
import path from 'path'
import YAML from 'yaml'

export interface SiteConfig {
  contentPath?: string
  domain?: string
  siteName?: string
  features?: {
    bibleTooltips?: boolean
  }
  themes?: {
    light?: { colors: Record<string, string> }
    dark?: { colors: Record<string, string> }
  }
  githubRepo?: string
  githubBranch?: string
  canonicalBase?: string
}

function findConfig(dir: string, basename: string): string | null {
  const yamlPath = path.join(dir, `${basename}.yaml`)
  const ymlPath = path.join(dir, `${basename}.yml`)

  if (fs.existsSync(yamlPath)) return yamlPath
  if (fs.existsSync(ymlPath)) return ymlPath
  return null
}

export async function loadConfig(
  userCwd: string,
  domain?: string
): Promise<SiteConfig> {
  // Try domain-specific config first
  let configPath = domain ? findConfig(userCwd, `${domain}.config`) : null

  // Fallback to content.config
  if (!configPath) {
    configPath = findConfig(userCwd, 'content.config')
  }

  if (!configPath) {
    throw new Error(
      'No configuration file found. Please create content.config.yml in your project root.\n' +
      'Example:\n' +
      '  contentPath: ./docs\n' +
      '  siteName: My Documentation Site'
    )
  }

  const configContent = await fs.readFile(configPath, 'utf8')
  const config = YAML.parse(configContent) as SiteConfig

  console.log(`📝 Using config: ${path.basename(configPath)}`)
  console.log(`📂 Content path: ${config.contentPath || './docs'}`)

  return config
}
