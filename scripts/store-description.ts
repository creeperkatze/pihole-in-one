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

type Messages = { [key: string]: string | Messages }

function loadMessages(locale: string): Messages {
	try {
		return JSON.parse(readFileSync(resolve(localesDirectory, `${locale}.json`), 'utf8'))
	} catch {
		console.warn(`Could not load messages for locale "${locale}", falling back to en-US.`)
		return {}
	}
}

function lookup(messages: Messages, key: string): string | undefined {
	let node: string | Messages | undefined = messages
	for (const part of key.split('.')) {
		node = typeof node === 'object' ? node[part] : undefined
	}
	return typeof node === 'string' && node ? node : undefined
}

const en = loadMessages('en-US')
const local = loadMessages(language)

function t(key: string): string {
	return lookup(local, key) ?? lookup(en, key) ?? ''
}

const REPO_URL = 'https://github.com/creeperkatze/pihole-in-one'

const features = [
	'blocking',
	'currentSite',
	'domains',
	'groups',
	'stats',
	'systemInfo',
	'recentlyBlocked',
	'notices',
	'multiInstance',
	'badge',
	'customization',
	'backup',
]

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
