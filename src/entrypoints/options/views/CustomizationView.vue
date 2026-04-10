<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.customization.title'])"
			:description="formatMessage(messages['options.customization.description'])"
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionSelect
				:label="formatMessage(messages['options.customization.badge.label'])"
				:description="formatMessage(messages['options.customization.badge.description'])"
				:model-value="form.badgeMode"
				:options="badgeModeOptions"
				@update:model-value="form.badgeMode = $event as BadgeMode"
			/>
			<div
				v-if="saveError"
				class="mt-3 px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { computed } from 'vue'

import OptionSelect from '../../../components/options/OptionSelect.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { useVIntl } from '../../../helpers/i18n'
import type { BadgeMode } from '../../../helpers/settings'

const { form, saveError } = useSettings()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'options.customization.title': {
		id: 'options.customization.title',
		defaultMessage: 'Customization',
	},
	'options.customization.description': {
		id: 'options.customization.description',
		defaultMessage: 'Adjust the appearance and behavior of the extension.',
	},
	'options.customization.badge.label': {
		id: 'options.customization.badge.label',
		defaultMessage: 'Badge appearance',
	},
	'options.customization.badge.description': {
		id: 'options.customization.badge.description',
		defaultMessage: 'What to display on the extension icon badge.',
	},
	'options.customization.badge.off': {
		id: 'options.customization.badge.off',
		defaultMessage: 'Off',
	},
	'options.customization.badge.state': {
		id: 'options.customization.badge.state',
		defaultMessage: 'State',
	},
	'options.customization.badge.percentage': {
		id: 'options.customization.badge.percentage',
		defaultMessage: 'Percentage blocked',
	},
	'options.customization.badge.clients': {
		id: 'options.customization.badge.clients',
		defaultMessage: 'Active clients',
	},
})

const badgeModeOptions = computed(() => [
	{ value: 'off', label: formatMessage(messages['options.customization.badge.off']) },
	{ value: 'state', label: formatMessage(messages['options.customization.badge.state']) },
	{
		value: 'percentage',
		label: formatMessage(messages['options.customization.badge.percentage']),
	},
	{ value: 'clients', label: formatMessage(messages['options.customization.badge.clients']) },
])
</script>
