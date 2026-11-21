import { IntlMessageFormat } from 'intl-messageformat'
import { type CompileError, createI18n, type MessageCompiler, type MessageContext } from 'vue-i18n'

type Messages = typeof import('../locales/en-US.json')

// A locale without a file yet falls back to en-US
const files = import.meta.glob<Messages>('../locales/*.json', { eager: true, import: 'default' })
const messages = Object.fromEntries(
	Object.entries(files).map(([path, file]) => [path.replace(/^.*\/|\.json$/g, ''), file]),
) as Record<SupportedLocale, Messages>

export interface LocaleDefinition {
	code: string
	name: string
	dir?: 'ltr' | 'rtl'
}

export const LOCALES = [
	{ code: 'en-US', name: 'English' },
	// { code: 'af-ZA', name: 'Afrikaans' },
	// { code: 'ar-SA', name: 'العربية', dir: 'rtl' },
	// { code: 'ca-ES', name: 'Català' },
	{ code: 'cs-CZ', name: 'Čeština' },
	// { code: 'da-DK', name: 'Dansk' },
	{ code: 'de-DE', name: 'Deutsch' },
	// { code: 'el-GR', name: 'Ελληνικά' },
	{ code: 'es-ES', name: 'Español' },
	// { code: 'fi-FI', name: 'Suomi' },
	{ code: 'fr-FR', name: 'Français' },
	// { code: 'he-IL', name: 'עברית', dir: 'rtl' },
	// { code: 'hu-HU', name: 'Magyar' },
	// { code: 'it-IT', name: 'Italiano' },
	// { code: 'ja-JP', name: '日本語' },
	// { code: 'ko-KR', name: '한국어' },
	// { code: 'nl-NL', name: 'Nederlands' },
	// { code: 'no-NO', name: 'Norsk' },
	// { code: 'pl-PL', name: 'Polski' },
	// { code: 'pt-BR', name: 'Português (Brasil)' },
	// { code: 'pt-PT', name: 'Português' },
	// { code: 'ro-RO', name: 'Română' },
	// { code: 'ru-RU', name: 'Русский' },
	// { code: 'sr-CS', name: 'Српски' },
	// { code: 'sv-SE', name: 'Svenska' },
	// { code: 'tr-TR', name: 'Türkçe' },
	// { code: 'uk-UA', name: 'Українська' },
	// { code: 'vi-VN', name: 'Tiếng Việt' },
	// { code: 'zh-CN', name: '简体中文' },
	// { code: 'zh-TW', name: '繁體中文' },
] as const satisfies readonly LocaleDefinition[]

export type SupportedLocale = (typeof LOCALES)[number]['code']

const LOCALE_CODES = new Set<string>(LOCALES.map((l) => l.code))

function isSupportedLocale(value: string): value is SupportedLocale {
	return LOCALE_CODES.has(value)
}

export function detectBrowserLocale(): SupportedLocale {
	const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
	for (const lang of langs) {
		if (isSupportedLocale(lang)) return lang
	}
	for (const lang of langs) {
		const prefix = lang.split('-')[0]?.toLowerCase()
		const match = LOCALES.find((l) => l.code.split('-')[0] === prefix)
		if (match) return match.code
	}
	return 'en-US'
}

// Messages use ICU syntax, like {count, plural, one {# item} other {# items}}
const messageCompiler: MessageCompiler = (message, { locale, key, onError }) => {
	if (typeof message !== 'string') {
		onError?.(new Error(`Message ${key} is not a string`) as CompileError)
		return () => key
	}
	const formatter = new IntlMessageFormat(message, locale, undefined, { ignoreTag: true })
	// Slot values like links come back as an array of parts, which <i18n-t> renders
	return (ctx: MessageContext) => formatter.format(ctx.values) as string
}

export const i18n = createI18n({
	messageCompiler,
	legacy: false,
	locale: detectBrowserLocale(),
	fallbackLocale: 'en-US',
	messages,
})

export function resolveLocale(locale: string): SupportedLocale {
	return isSupportedLocale(locale) ? locale : detectBrowserLocale()
}

export function applyLocale(locale: string) {
	const code = resolveLocale(locale)
	i18n.global.locale.value = code
	document.documentElement.lang = code
	const definition: LocaleDefinition | undefined = LOCALES.find((l) => l.code === code)
	document.documentElement.dir = definition?.dir ?? 'ltr'
}
