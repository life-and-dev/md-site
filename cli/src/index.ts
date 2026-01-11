#!/usr/bin/env node

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import path from 'path'
import { spawn } from 'child_process'
import fs from 'fs-extra'
import { loadConfig } from '../lib/config-loader.js'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// User's project root (where they run the command)
const USER_CWD = process.cwd()

// Package root when installed in node_modules
const PACKAGE_ROOT = path.resolve(__dirname, '../../..')  // node_modules/md-site

const program = new Command()

program
  .name('md-site')
  .description('Markdown Static Site Generator')
  .version(fs.readJsonSync(path.join(PACKAGE_ROOT, 'package.json')).version)

program
  .command('dev')
  .description('Start development server')
  .option('--cached', 'Skip initial content sync')
  .argument('[domain]', 'Optional domain identifier for multi-domain configs')
  .action(async (domain, options) => {
    await runCommand('dev', options, domain)
  })

program
  .command('build')
  .description('Build site for production')
  .argument('[domain]', 'Optional domain identifier for multi-domain configs')
  .action(async (domain) => {
    await runCommand('build', {}, domain)
  })

program
  .command('generate')
  .description('Generate static site')
  .argument('[domain]', 'Optional domain identifier for multi-domain configs')
  .action(async (domain) => {
    await runCommand('generate', {}, domain)
  })

async function runCommand(
  mode: 'dev' | 'build' | 'generate',
  options: { cached?: boolean },
  domain?: string
) {
  try {
    // 1. Load config from user's project root
    const config = await loadConfig(USER_CWD, domain)

    // 2. Resolve content directory relative to user's CWD
    const contentDir = path.resolve(USER_CWD, config.contentPath || './docs')

    // 3. Create a temporary config file in package directory
    // Use a unique domain name to avoid conflicts with existing config files
    const cliDomain = '.cli-temp-content'
    const tempConfigPath = path.join(PACKAGE_ROOT, `${cliDomain}.config.yml`)
    await fs.writeFile(tempConfigPath, YAML.stringify({
      ...config,
      contentPath: contentDir  // Use absolute path
    }))

    // 4. Set environment variables
    process.env.CONTENT_DIR = contentDir

    // 5. Clear Nuxt cache in package directory for dev mode
    if (mode === 'dev') {
      console.log('🧹 Clearing Nuxt cache...')
      const cacheDirs = ['.nuxt', '.data', '.output']
      for (const dir of cacheDirs) {
        const cachePath = path.join(PACKAGE_ROOT, dir)
        if (await fs.pathExists(cachePath)) {
          await fs.remove(cachePath)
        }
      }
    }

    // 6. Build start.ts args - pass the CLI domain so it uses our temp config
    const startArgs: string[] = [cliDomain]
    if (mode === 'build') startArgs.push('--build')
    if (mode === 'generate') startArgs.push('--generate')
    if (mode === 'dev' && options.cached) startArgs.push('--cached')

    console.log(`✨ Starting MD-Site ${mode.toUpperCase()}...`)

    // 7. Run start.ts from package directory
    const startScript = path.join(PACKAGE_ROOT, 'scripts', 'start.ts')
    const startProcess = spawn('npx', ['tsx', startScript, ...startArgs], {
      cwd: PACKAGE_ROOT, // Run from package directory
      stdio: 'inherit',
      env: process.env
    })

    startProcess.on('close', async (code) => {
      // If generate mode, copy output to user directory
      if (mode === 'generate' && code === 0) {
        const packageOutput = path.join(PACKAGE_ROOT, '.output', 'public')
        const userOutput = path.join(USER_CWD, '.output', 'public')

        if (await fs.pathExists(packageOutput)) {
          console.log(`📦 Copying output to ${userOutput}...`)
          await fs.ensureDir(path.dirname(userOutput))
          await fs.copy(packageOutput, userOutput)
          console.log(`✅ Output copied to ${userOutput}`)
        }
      }

      // Clean up temporary config
      await fs.remove(tempConfigPath)

      process.exit(code ?? 0)
    })

    // Handle process termination signals
    const cleanup = async () => {
      await fs.remove(tempConfigPath)
    }

    process.on('SIGINT', async () => {
      startProcess.kill('SIGINT')
      await cleanup()
    })
    process.on('SIGTERM', async () => {
      startProcess.kill('SIGTERM')
      await cleanup()
    })
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

program.parse()
