import { IntlMessageFormat } from 'intl-messageformat'
import { type CompileError, createI18n, type MessageCompiler, type MessageContext } from 'vue-i18n'

import deDE from '../src/locales/de-DE.json'
import enUS from '../src/locales/en-US.json'

const messages = { 'en-US': enUS, 'de-DE': deDE }

const messageCompiler: MessageCompiler = (message, { locale, key, onError }) => {
	if (typeof message !== 'string') {
		onError?.(new Error(`Message ${key} is not a string`) as CompileError)
		return () => key
	}
	const formatter = new IntlMessageFormat(message, locale, undefined, { ignoreTag: true })
	return (ctx: MessageContext) => formatter.format(ctx.values) as string
}

export const i18n = createI18n({
	messageCompiler,
	legacy: false,
	locale: 'en-US',
	fallbackLocale: 'en-US',
	messages,
})
