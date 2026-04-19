#!/usr/bin/env node
import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const [scriptName, ...args] = process.argv.slice(2)

if (!scriptName) {
	console.error('Usage: pnpm scripts <script-name> [args...]')
	process.exit(1)
}

const scriptPath = join(__dirname, `${scriptName}.ts`)

const child = spawn('pnpx', ['tsx', scriptPath, ...args], {
	stdio: 'inherit',
	shell: true,
})

child.on('exit', (code) => {
	process.exit(code ?? 0)
})
