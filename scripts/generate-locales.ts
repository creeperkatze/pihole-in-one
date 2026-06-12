import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const directory = dirname(fileURLToPath(import.meta.url))
const localesDirectory = resolve(directory, '../src/locales')
const publicDirectory = resolve(directory, '../src/public')

type MessageFile = Record<string, { defaultMessage?: string }>

const EXT_NAME = 'Pi-hole In One'

// Exhaustive list of locale codes Chrome recognises in _locales.
// https://developer.chrome.com/docs/extensions/reference/api/i18n#locales
const CHROME_LOCALES = new Set([
	'ar',
	'am',
	'bg',
	'bn',
	'ca',
	'cs',
	'da',
	'de',
	'el',
	'en',
	'en_AU',
	'en_GB',
	'en_US',
	'es',
	'es_419',
	'et',
	'fa',
	'fi',
	'fil',
	'fr',
	'gu',
	'he',
	'hi',
	'hr',
	'hu',
	'id',
	'it',
	'ja',
	'kn',
	'ko',
	'lt',
	'lv',
	'ml',
	'mr',
	'ms',
	'nl',
	'no',
	'pl',
	'pt_BR',
	'pt_PT',
	'ro',
	'ru',
	'sk',
	'sl',
	'sr',
	'sv',
	'sw',
	'ta',
	'te',
	'th',
	'tr',
	'uk',
	'vi',
	'zh_CN',
	'zh_TW',
])

function toChromeLocale(locale: string): string | undefined {
	const { language, region } = new Intl.Locale(locale)
	const withRegion = region ? `${language}_${region}` : language
	if (CHROME_LOCALES.has(withRegion)) return withRegion
	if (CHROME_LOCALES.has(language)) return language
	return undefined
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
	if (!chromeLocale) {
		console.warn(`No Chrome locale mapping for "${locale}", skipping.`)
		continue
	}
	const outDir = resolve(publicDirectory, '_locales', chromeLocale)
	mkdirSync(outDir, { recursive: true })

	const messages = {
		extName: { message: EXT_NAME },
		extDescription: { message: summary },
	}

	writeFileSync(resolve(outDir, 'messages.json'), JSON.stringify(messages, null, '\t') + '\n')
	console.log(`Generated _locales/${chromeLocale}/messages.json`)
}
