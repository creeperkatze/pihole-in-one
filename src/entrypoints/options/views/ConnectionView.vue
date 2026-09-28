<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="t('options.connection.title')"
			:description="t('options.connection.description')"
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
import { Timer, Wifi } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatSeconds } from '../../../utils/format'

export function useConnectionOptions() {
	const { t } = useI18n()

	const pihole = computed(() => ({
		id: 'pihole',
		type: 'pihole' as const,
		label: t('options.piholeselector.title'),
		description: t('options.piholeselector.description'),
	}))

	const refreshInterval = computed(() => ({
		id: 'refreshInterval',
		type: 'slider' as const,
		formKey: 'refreshInterval' as const,
		icon: Timer,
		label: t('options.connection.refreshInterval.label'),
		description: t('options.connection.refreshInterval.description'),
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
		label: t('options.connection.connectionTimeout.label'),
		description: t('options.connection.connectionTimeout.description'),
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
const { t } = useI18n()
</script>
