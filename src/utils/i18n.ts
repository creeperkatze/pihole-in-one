import type { App } from 'vue'
import { useI18n } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

import { LOCALES } from './locales'

type CrowdinMessages = Record<string, { defaultMessage: string }>

const LOCALE_CODES = new Set(LOCALES.map((l) => l.code))

const localeModules = import.meta.glob<{ default: CrowdinMessages }>('../locales/*/*.json', {
	eager: true,
})

function transformCrowdinMessages(messages: CrowdinMessages): Record<string, string> {
	return Object.fromEntries(
		Object.entries(messages).map(([key, value]) => [key, value.defaultMessage]),
	)
}

function buildMessages(): Record<string, Record<string, string>> {
	const messages: Record<string, Record<string, string>> = {}
	for (const [path, module] of Object.entries(localeModules)) {
		const match = path.match(/\/([^/]+)\/[^/]+\.json$/)
		if (match && LOCALE_CODES.has(match[1])) {
			const locale = match[1]
			if (!messages[locale]) messages[locale] = {}
			Object.assign(messages[locale], transformCrowdinMessages(module.default))
		}
	}
	return messages
}

export const i18n = createI18n({
	legacy: false,
	locale: 'en-US',
	fallbackLocale: 'en-US',
	missingWarn: false,
	fallbackWarn: false,
	messages: buildMessages(),
})

export function detectBrowserLocale(): string {
	const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
	for (const lang of langs) {
		const exact = LOCALES.find((l) => l.code.toLowerCase() === lang.toLowerCase())
		if (exact) return exact.code
		const prefix = lang.split('-')[0].toLowerCase()
		const match = LOCALES.find((l) => l.code.split('-')[0].toLowerCase() === prefix)
		if (match) return match.code
	}
	return 'en-US'
}

export function installI18n(app: App): void {
	app.use(i18n)
	i18n.global.locale.value = detectBrowserLocale()
}

export interface MessageDescriptor {
	id: string
	defaultMessage: string
}

export function useVIntl() {
	const { t } = useI18n()
	return {
		formatMessage(msg: MessageDescriptor, values?: Record<string, string | number>): string {
			return t(msg.id, values ?? {})
		},
	}
}
