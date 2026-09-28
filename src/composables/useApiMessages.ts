import { PiHoleError } from 'pihole-js'
import { useI18n } from 'vue-i18n'

const CODE_KEYS: Record<string, string> = {
	PASSWORD_INCORRECT: 'api.error.passwordIncorrect',
	PASSWORD_REQUIRED: 'api.error.passwordRequired',
	AUTH_FAILED: 'api.error.authFailed',
	TIMEOUT: 'api.error.timeout',
	rate_limiting: 'api.error.rateLimited',
	api_seats_exceeded: 'api.error.noSeats',
	regex_error: 'api.error.invalidRegex',
	database_error: 'api.error.database',
	forbidden: 'api.error.forbidden',
}

function hintOf(error: PiHoleError): string | undefined {
	const body = error.body as { error?: { hint?: unknown } } | undefined
	return typeof body?.error?.hint === 'string' ? body.error.hint : undefined
}

function keyForPiHoleError(error: PiHoleError): string | undefined {
	if (/2FA/i.test(error.message)) return 'api.error.twoFactor'
	if (error.code && CODE_KEYS[error.code]) return CODE_KEYS[error.code]
	if (error.status === 401) return 'api.error.authFailed'
	if (error.status === 403) return 'api.error.forbidden'
	if (error.status === 404) return 'api.error.notFound'
	if (error.status >= 500) return 'api.error.server'
	return undefined
}

// Returns the translation key for errors with a known cause
export function getApiMessageForError(error: unknown): string | undefined {
	if (error instanceof PiHoleError) return keyForPiHoleError(error)
	// fetch throws a TypeError when the host can't be reached at all
	if (error instanceof TypeError) return 'api.error.unreachable'
	// A web page instead of the API fails to parse as JSON
	if (error instanceof SyntaxError) return 'api.error.notPihole'
	if (error instanceof Error && /UNIQUE constraint/i.test(error.message)) {
		return 'api.error.duplicate'
	}
	return undefined
}

export function useErrorMessage() {
	const { t } = useI18n()

	return function describeError(error: unknown, fallbackKey: string): string {
		const key = getApiMessageForError(error)
		if (key) {
			const hint = error instanceof PiHoleError ? hintOf(error) : undefined
			return key === 'api.error.invalidRegex' && hint ? `${t(key)} (${hint})` : t(key)
		}
		if (error instanceof Error && error.message) return error.message
		return t(fallbackKey)
	}
}
