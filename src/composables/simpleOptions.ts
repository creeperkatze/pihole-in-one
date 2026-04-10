import { formatSeconds } from '../helpers/format'

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

export const simpleOptions: SimpleOption[] = [
	{
		id: 'showBadge',
		type: 'toggle',
		label: 'Show badge',
		description:
			'Display an ON / OFF badge on the extension icon reflecting the current blocking state.',
		formKey: 'showBadge',
	},
	{
		id: 'refreshInterval',
		type: 'slider',
		label: 'Badge Refresh Interval',
		description: 'Minimum 60s in Chrome (MV3 alarm constraint). Firefox allows lower values.',
		formKey: 'refreshInterval',
		min: 60,
		max: 3600,
		step: 30,
		format: formatSeconds,
	},
]
