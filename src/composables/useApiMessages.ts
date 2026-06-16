import { defineMessages } from '@formatjs/intl'
import { PiHoleError } from 'pihole-js'

import type { MessageDescriptor } from '../utils/i18n'

const apiMessages = defineMessages({
	'api.error.passwordIncorrect': {
		id: 'api.error.passwordIncorrect',
		defaultMessage: 'Password incorrect',
	},
	'api.error.passwordRequired': {
		id: 'api.error.passwordRequired',
		defaultMessage: 'Password required',
	},
	'api.error.timeout': {
		id: 'api.error.timeout',
		defaultMessage: 'Connection timed out',
	},
}) as Record<string, MessageDescriptor>

export function getApiMessageForError(error: unknown): MessageDescriptor | undefined {
	if (!(error instanceof PiHoleError)) return undefined

	switch (error.code) {
		case 'PASSWORD_INCORRECT':
			return apiMessages['api.error.passwordIncorrect']
		case 'PASSWORD_REQUIRED':
			return apiMessages['api.error.passwordRequired']
		case 'TIMEOUT':
			return apiMessages['api.error.timeout']
		default:
			return undefined
	}
}
