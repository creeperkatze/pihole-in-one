import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const directory = dirname(fileURLToPath(import.meta.url))
const localesDirectory = resolve(directory, '../src/locales')
const publicDirectory = resolve(directory, '../src/public')

type MessageFile = Record<string, { defaultMessage?: string }>

const EXT_NAME = 'Pi-hole In One'

function toChromeLocale(locale: string): string {
	return locale.replace('-', '_')
}

function loadSummary(locale: string): string | undefined {
	const localePath = resolve(localesDirectory, locale, 'meta.json')
	try {
		const local: MessageFile = JSON.parse(readFileSync(localePath, 'utf8'))
		return local['meta.summary']?.defaultMessage
	} catch {
		return undefined
	}
}

const localeDirs = readdirSync(localesDirectory, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name)

for (const locale of localeDirs) {
	if (!existsSync(resolve(localesDirectory, locale, 'meta.json'))) continue

	const summary = loadSummary(locale)
	if (!summary) {
		console.warn(`No meta.summary for locale "${locale}", skipping.`)
		continue
	}

	const chromeLocale = toChromeLocale(locale)
	const outDir = resolve(publicDirectory, '_locales', chromeLocale)
	mkdirSync(outDir, { recursive: true })

	const messages = {
		extName: { message: EXT_NAME },
		extDescription: { message: summary },
	}

	writeFileSync(resolve(outDir, 'messages.json'), JSON.stringify(messages, null, '\t') + '\n')
	console.log(`Generated _locales/${chromeLocale}/messages.json`)
}
