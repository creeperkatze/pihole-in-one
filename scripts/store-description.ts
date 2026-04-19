import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const directory = dirname(fileURLToPath(import.meta.url))
const localesDirectory = resolve(directory, '../src/locales')

const language =
	process.argv.find(
		(a) => !a.startsWith('--') && !a.includes('node') && !a.includes('store-desc'),
	) ?? 'en-US'

const markdown = process.argv.includes('--markdown')
const summary = process.argv.includes('--summary')

type MessageFile = Record<string, { defaultMessage?: string }>
type Messages = Record<string, string>

function loadMessages(locale: string, file: string): Messages {
	const enPath = resolve(localesDirectory, 'en-US', `${file}.json`)
	const localePath = resolve(localesDirectory, locale, `${file}.json`)
	const en: MessageFile = JSON.parse(readFileSync(enPath, 'utf8'))
	let local: MessageFile = {}
	try {
		local = JSON.parse(readFileSync(localePath, 'utf8'))
	} catch {
		console.warn(`Could not load messages for locale "${locale}", falling back to en-US.`)
	}
	const merged: Messages = {}
	for (const key of Object.keys(en)) {
		merged[key] = (local[key]?.defaultMessage || en[key]?.defaultMessage) ?? ''
	}
	return merged
}

const meta = loadMessages(language, 'meta')

function t(key: string): string {
	return meta[key] ?? ''
}

const REPO_URL = 'https://github.com/creeperkatze/pihole-in-one'

const features = ['blocking', 'domain', 'stats', 'systemInfo', 'groups', 'multiInstance', 'badge', 'customization']

function featureLines(): string {
	return features
		.map((k) => `- ${t(`meta.feature.${k}.title`)}: ${t(`meta.feature.${k}.description`)}`)
		.join('\n')
}

const footer = t('meta.description.footer').replace(
	/<link>(.*?)<\/link>[。.]?/,
	(_, text: string) => (markdown ? `[${text}](${REPO_URL})` : `${text}: ${REPO_URL}`),
)

const description = [
	summary ? t('meta.summary') : null,
	summary ? '' : null,
	t('meta.description.intro'),
	'',
	t('meta.description.featuresTitle'),
	featureLines(),
	'',
	footer,
	'',
	t('meta.description.disclaimer'),
]
	.filter((line) => line !== null)
	.join('\n')

console.log(description)
