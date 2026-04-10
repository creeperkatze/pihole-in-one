import { defineMessages } from '@formatjs/intl'
import { computed } from 'vue'

import { formatSeconds } from '../helpers/format'
import { useVIntl } from '../helpers/i18n'

export type ToggleOption = {
	id: string
	type: 'toggle'
	label: string
	description: string
	formKey: 'showBadge'
}

export type SliderOption = {
	id: string
	type: 'slider'
	label: string
	description: string
	formKey: 'refreshInterval'
	min: number
	max: number
	step: number
	format: (v: number) => string
}

export type SimpleOption = ToggleOption | SliderOption

const optionMessages = defineMessages({
	'options.simpleOptions.showBadge.label': {
		id: 'options.simpleOptions.showBadge.label',
		defaultMessage: 'Show badge',
	},
	'options.simpleOptions.showBadge.description': {
		id: 'options.simpleOptions.showBadge.description',
		defaultMessage:
			'Display an ON / OFF badge on the extension icon reflecting the current blocking state.',
	},
	'options.simpleOptions.refreshInterval.label': {
		id: 'options.simpleOptions.refreshInterval.label',
		defaultMessage: 'Badge Refresh Interval',
	},
	'options.simpleOptions.refreshInterval.description': {
		id: 'options.simpleOptions.refreshInterval.description',
		defaultMessage: 'Minimum 60s in Chrome (MV3 alarm constraint). Firefox allows lower values.',
	},
})

export function useSimpleOptions() {
	const { formatMessage } = useVIntl()
	return computed<SimpleOption[]>(() => [
		{
			id: 'showBadge',
			type: 'toggle',
			label: formatMessage(optionMessages['options.simpleOptions.showBadge.label']),
			description: formatMessage(optionMessages['options.simpleOptions.showBadge.description']),
			formKey: 'showBadge',
		},
		{
			id: 'refreshInterval',
			type: 'slider',
			label: formatMessage(optionMessages['options.simpleOptions.refreshInterval.label']),
			description: formatMessage(
				optionMessages['options.simpleOptions.refreshInterval.description'],
			),
			formKey: 'refreshInterval',
			min: 60,
			max: 3600,
			step: 30,
			format: formatSeconds,
		},
	])
}
