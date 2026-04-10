<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.customization.title'])"
			:description="formatMessage(messages['options.customization.description'])"
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionSelect
				:icon="Languages"
				:label="formatMessage(messages['options.language.label'])"
				:description="formatMessage(messages['options.language.description'])"
				:model-value="form.locale"
				:options="languageOptions"
				@update:model-value="form.locale = $event"
			/>
			<OptionSelect
				:icon="Monitor"
				:label="formatMessage(messages['options.colorScheme.label'])"
				:description="formatMessage(messages['options.colorScheme.description'])"
				:model-value="form.colorScheme"
				:options="colorSchemeOptions"
				@update:model-value="form.colorScheme = $event as ColorScheme"
			/>
			<OptionSelect
				:icon="Tag"
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
import { Languages, Monitor, Tag } from 'lucide-vue-next'
import { computed } from 'vue'

import OptionSelect from '../../../components/options/OptionSelect.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { useVIntl } from '../../../helpers/i18n'
import { LOCALES } from '../../../helpers/locales'
import type { BadgeMode, ColorScheme } from '../../../helpers/settings'

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
	'options.language.label': {
		id: 'options.language.label',
		defaultMessage: 'Language',
	},
	'options.language.description': {
		id: 'options.language.description',
		defaultMessage: 'Choose the language for the extension interface.',
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
	'options.colorScheme.label': {
		id: 'options.colorScheme.label',
		defaultMessage: 'Color scheme',
	},
	'options.colorScheme.description': {
		id: 'options.colorScheme.description',
		defaultMessage: 'Choose between light, dark, or system default.',
	},
	'options.colorScheme.auto': {
		id: 'options.colorScheme.auto',
		defaultMessage: 'System default',
	},
	'options.colorScheme.dark': {
		id: 'options.colorScheme.dark',
		defaultMessage: 'Dark',
	},
	'options.colorScheme.light': {
		id: 'options.colorScheme.light',
		defaultMessage: 'Light',
	},
})

const languageOptions = computed(() => LOCALES.map((l) => ({ value: l.code, label: l.name })))

const colorSchemeOptions = computed(() => [
	{ value: 'auto', label: formatMessage(messages['options.colorScheme.auto']) },
	{ value: 'dark', label: formatMessage(messages['options.colorScheme.dark']) },
	{ value: 'light', label: formatMessage(messages['options.colorScheme.light']) },
])

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
