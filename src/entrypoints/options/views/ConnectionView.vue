<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.connection.title'])"
			:description="formatMessage(messages['options.connection.description'])"
		/>
		<div class="flex max-w-xl flex-col gap-2 p-4">
			<OptionPiHoleSelector
				:model-value="form.instances"
				@update:model-value="form.instances = $event"
			/>
			<OptionSlider
				:icon="connectionTimeout.icon"
				:label="connectionTimeout.label"
				:description="connectionTimeout.description"
				:model-value="form.connectionTimeout"
				:min="connectionTimeout.min"
				:max="connectionTimeout.max"
				:step="connectionTimeout.step"
				:suffix="connectionTimeout.suffix"
				:format="connectionTimeout.format"
				@update:model-value="form.connectionTimeout = $event"
			/>
			<OptionSlider
				:icon="refreshInterval.icon"
				:label="refreshInterval.label"
				:description="refreshInterval.description"
				:model-value="form.refreshInterval"
				:min="refreshInterval.min"
				:max="refreshInterval.max"
				:step="refreshInterval.step"
				:suffix="refreshInterval.suffix"
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
import { Timer, Wifi } from '@lucide/vue'
import { computed } from 'vue'

import { formatSeconds } from '../../../utils/format'
import { useVIntl } from '../../../utils/i18n'

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
	'options.connection.connectionTimeout.label': {
		id: 'options.connection.connectionTimeout.label',
		defaultMessage: 'Connection Timeout',
	},
	'options.connection.connectionTimeout.description': {
		id: 'options.connection.connectionTimeout.description',
		defaultMessage: 'How long to wait before a rquest to a Pi-hole is treated as failed.',
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
		suffix: 's',
		format: formatSeconds,
	}))

	const connectionTimeout = computed(() => ({
		id: 'connectionTimeout',
		type: 'slider' as const,
		formKey: 'connectionTimeout' as const,
		icon: Wifi,
		label: formatMessage(messages['options.connection.connectionTimeout.label']),
		description: formatMessage(messages['options.connection.connectionTimeout.description']),
		min: 3,
		max: 60,
		step: 1,
		suffix: 's',
		format: formatSeconds,
	}))

	return { pihole, refreshInterval, connectionTimeout }
}
</script>

<script setup lang="ts">
import OptionPiHoleSelector from '../../../components/options/OptionPiHoleSelector.vue'
import OptionSlider from '../../../components/options/OptionSlider.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'

const { form, saveError } = useSettings()
const { connectionTimeout, refreshInterval } = useConnectionOptions()
const { formatMessage } = useVIntl()
</script>
