<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.connection.title'])"
			:description="formatMessage(messages['options.connection.description'])"
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionPiHoleSelector
				:model-value="form.instances"
				@update:model-value="form.instances = $event"
			/>
			<OptionSlider
				:icon="refreshInterval.icon"
				:label="refreshInterval.label"
				:description="refreshInterval.description"
				:model-value="form.refreshInterval"
				:min="refreshInterval.min"
				:max="refreshInterval.max"
				:step="refreshInterval.step"
				:format="refreshInterval.format"
				@update:model-value="form.refreshInterval = $event"
			/>
			<div
				v-if="saveError"
				class="px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import { defineMessages } from '@formatjs/intl'
import { Timer } from '@lucide/vue'
import { computed } from 'vue'

import { formatSeconds } from '../../../helpers/format'
import { useVIntl } from '../../../helpers/i18n'

export const messages = defineMessages({
	'options.connection.title': { id: 'options.connection.title', defaultMessage: 'Connection' },
	'options.connection.description': {
		id: 'options.connection.description',
		defaultMessage: 'Manage your Pi-hole instances and badge refresh settings.',
	},
	'options.piholeselector.title': {
		id: 'options.piholeselector.title',
		defaultMessage: 'Pi-holes',
	},
	'options.piholeselector.description': {
		id: 'options.piholeselector.description',
		defaultMessage: 'Configure one or more Pi-hole instances.',
	},
	'options.connection.refreshInterval.label': {
		id: 'options.connection.refreshInterval.label',
		defaultMessage: 'Badge Refresh Interval',
	},
	'options.connection.refreshInterval.description': {
		id: 'options.connection.refreshInterval.description',
		defaultMessage: 'How often the badge is refreshed. Choose between one minute and one hour.',
	},
})

export function useConnectionOptions() {
	const { formatMessage } = useVIntl()

	const pihole = computed(() => ({
		id: 'pihole',
		type: 'pihole' as const,
		label: formatMessage(messages['options.piholeselector.title']),
		description: formatMessage(messages['options.piholeselector.description']),
	}))

	const refreshInterval = computed(() => ({
		id: 'refreshInterval',
		type: 'slider' as const,
		formKey: 'refreshInterval' as const,
		icon: Timer,
		label: formatMessage(messages['options.connection.refreshInterval.label']),
		description: formatMessage(messages['options.connection.refreshInterval.description']),
		min: 60,
		max: 3600,
		step: 30,
		format: formatSeconds,
	}))

	return { pihole, refreshInterval }
}
</script>

<script setup lang="ts">
import OptionPiHoleSelector from '../../../components/options/OptionPiHoleSelector.vue'
import OptionSlider from '../../../components/options/OptionSlider.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'

const { form, saveError } = useSettings()
const { refreshInterval } = useConnectionOptions()
const { formatMessage } = useVIntl()
</script>
