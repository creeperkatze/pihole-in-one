import { IntlMessageFormat } from 'intl-messageformat'
import { type CompileError, createI18n, type MessageCompiler, type MessageContext } from 'vue-i18n'

import deDE from '../locales/de-DE.json'
import enUS from '../locales/en-US.json'
import esES from '../locales/es-ES.json'
import frFR from '../locales/fr-FR.json'

const messages = { 'en-US': enUS, 'de-DE': deDE, 'es-ES': esES, 'fr-FR': frFR }

export interface LocaleDefinition {
	code: keyof typeof messages
	name: string
	dir?: 'ltr' | 'rtl'
}

export const LOCALES: LocaleDefinition[] = [
	{ code: 'en-US', name: 'English' },
	// { code: 'af-ZA', name: 'Afrikaans' },
	// { code: 'ar-SA', name: 'العربية', dir: 'rtl' },
	// { code: 'ca-ES', name: 'Català' },
	// { code: 'cs-CZ', name: 'Čeština' },
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
]

export type SupportedLocale = LocaleDefinition['code']

const LOCALE_CODES = new Set(LOCALES.map((l) => l.code))

function isSupportedLocale(value: string): value is SupportedLocale {
	return LOCALE_CODES.has(value as SupportedLocale)
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
	document.documentElement.dir = LOCALES.find((l) => l.code === code)?.dir ?? 'ltr'
}
