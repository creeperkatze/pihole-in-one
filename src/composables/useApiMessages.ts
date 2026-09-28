import { PiHoleError } from 'pihole-js'

export function getApiMessageForError(error: unknown): string | undefined {
	if (!(error instanceof PiHoleError)) return undefined

	switch (error.code) {
		case 'PASSWORD_INCORRECT':
			return 'api.error.passwordIncorrect'
		case 'PASSWORD_REQUIRED':
			return 'api.error.passwordRequired'
		case 'TIMEOUT':
			return 'api.error.timeout'
		default:
			return undefined
	}
}
