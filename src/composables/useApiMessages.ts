import { defineMessages } from '@formatjs/intl'

import type { MessageDescriptor } from '../helpers/i18n'

const apiMessages = defineMessages({
	'api.error.passwordIncorrect': {
		id: 'api.error.passwordIncorrect',
		defaultMessage: 'Password incorrect',
	},
	'api.error.passwordRequired': {
		id: 'api.error.passwordRequired',
		defaultMessage: 'Password required',
	},
}) as Record<string, MessageDescriptor>

export function getApiMessage(id: string): MessageDescriptor | undefined {
	return apiMessages[id]
}
