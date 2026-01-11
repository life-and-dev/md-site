#!/usr/bin/env node

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import compiled CLI from dist/
const cliPath = path.join(__dirname, '../dist/src/index.js')
await import(cliPath)
