
import { startWatcher } from './sync-content.js'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')


// Parse arguments
const args = process.argv.slice(2)
const isBuild = args.includes('--build')
const isGenerate = args.includes('--generate')
const isCached = args.includes('--cached')

// Find the domain: first non-flag argument, or environment variable
let domain = args.find(arg => !arg.startsWith('--')) || process.env.CONTENT

// Helper to separate config finding logic
function findConfig(basePathWithoutExt: string): string | null {
    const yamlPath = `${basePathWithoutExt}.yaml`
    const ymlPath = `${basePathWithoutExt}.yml`

    if (fs.existsSync(yamlPath)) return yamlPath
    if (fs.existsSync(ymlPath)) return ymlPath
    return null
}

// Config file paths
const globalConfigPath = findConfig(path.join(rootDir, 'content.config'))
const domainConfigPath = domain ? findConfig(path.join(rootDir, `${domain}.config`)) : null

// Exit if no configuration is found at all
if (!domainConfigPath && domain && domain !== 'content') { // Added 'domain' check to prevent error when no domain is specified
    console.error(`❌ Configuration file not found: ${domain}.config.yaml or ${domain}.config.yml`)
    process.exit(1)
}
if (!globalConfigPath && !domainConfigPath) {
    console.error('❌ No configuration found. Please create content.config.yml or provide a domain (e.g., npm start example)')
    process.exit(1)
}

// Read configs
const globalConfig = globalConfigPath
    ? YAML.parse(fs.readFileSync(globalConfigPath, 'utf8'))
    : {}

const domainConfig = domainConfigPath
    ? YAML.parse(fs.readFileSync(domainConfigPath, 'utf8'))
    : {}

// Combine configs (domain overrides global)
const config = { ...globalConfig, ...domainConfig }

// Fallback to 'cms' if no domain is provided and not in config
const activeDomain = domain || config.domain || 'cms'

// Resolve content path
const contentConfig = config.content || {}
const contentPath = contentConfig.path
    ? path.resolve(rootDir, contentConfig.path)
    : path.resolve(rootDir, '..', activeDomain)

// Git checkout logic
const gitConfig = contentConfig.git || {}
const gitTargetDir = gitConfig.path
    ? path.resolve(rootDir, gitConfig.path)
    : contentPath

const isContentMissing = !fs.existsSync(gitTargetDir);
const isEnvironmentManaged = !!process.env.CONTENT_DIR; // Use local path if provided via environment

if (gitConfig.repo && (isBuild || isGenerate || (isContentMissing && !isEnvironmentManaged))) {
    const repoUrl = gitConfig.repo
    const branch = gitConfig.branch || 'main'

    console.log(`📡 Checking out content repo: ${repoUrl} (${branch}) into ${gitTargetDir}`)

    let exitCode = 0
    if (fs.existsSync(path.join(gitTargetDir, '.git'))) {
        console.log(`🔄 Updating existing content repo...`)
        const pullProcess = spawn('git', ['-C', gitTargetDir, 'pull', 'origin', branch], { stdio: 'inherit' })
        exitCode = await new Promise((resolve) => pullProcess.on('close', resolve)) || 0
    } else if (!fs.existsSync(gitTargetDir)) {
        console.log(`📥 Cloning content repo...`)
        const cloneProcess = spawn('git', ['clone', '-b', branch, repoUrl, gitTargetDir], { stdio: 'inherit' })
        exitCode = await new Promise((resolve) => cloneProcess.on('close', resolve)) || 0
    } else {
        console.error(`❌ Destination directory ${gitTargetDir} exists but is not a Git repo. Aborting.`)
        process.exit(1)
    }

    if (exitCode !== 0) {
        console.error(`❌ Git operation failed with exit code ${exitCode}. Aborting.`)
        process.exit(1)
    }
}

console.log(`🚀 Preparing site for: ${domain || 'Default (content.config.yml)'}`)
console.log(`📂 Content path: ${contentPath}`)

// Set environment variables for the child process
process.env.CONTENT = activeDomain
process.env.CONTENT_DIR = contentPath
process.env.CMS_CONFIG = JSON.stringify(config)

// Determine the command to run
let nuxtCommand = 'dev'
if (isBuild) nuxtCommand = 'build'
if (isGenerate) nuxtCommand = 'generate'
if (isCached && !isBuild && !isGenerate) nuxtCommand = 'dev:cached'

// Start Watcher (clean, copy, and watch) - only needed for dev
if (nuxtCommand.startsWith('dev')) {
    await startWatcher()
} else {
    // For build/generate, we just need a one-time sync
    const { syncContent } = await import('./sync-content.js')
    await syncContent()
}

console.log(`✨ Starting Nuxt ${nuxtCommand.toUpperCase()}...`)

const nuxtProcess = spawn('npx', ['nuxt', nuxtCommand], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env
})

nuxtProcess.on('close', (code) => {
    process.exit(code ?? 0)
})
