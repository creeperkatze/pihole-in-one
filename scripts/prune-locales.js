import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const localesDirs = [join(root, 'src/locales'), join(root, 'website/src/locales')]
const sourceFile = 'en-US.json'

function prune(messages) {
	const pruned = {}
	for (const [key, value] of Object.entries(messages)) {
		if (typeof value === 'object' && value !== null) {
			const nested = prune(value)
			if (Object.keys(nested).length) pruned[key] = nested
		} else if (value !== '') {
			pruned[key] = value
		}
	}
	return pruned
}

for (const localesDir of localesDirs) {
	for (const file of readdirSync(localesDir)) {
		if (!file.endsWith('.json') || file === sourceFile) continue
		const path = join(localesDir, file)
		const messages = prune(JSON.parse(readFileSync(path, 'utf8')))
		if (Object.keys(messages).length) {
			writeFileSync(path, `${JSON.stringify(messages, null, '\t')}\n`)
		} else {
			rmSync(path)
		}
	}
}
