<template>
	<div class="grid grid-cols-4 gap-1.5">
		<div
			v-for="cell in cells"
			:key="cell.label"
			class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg border border-border bg-surface-3"
		>
			<component :is="cell.icon" class="size-4 shrink-0 text-muted" />
			<div class="text-sm font-semibold text-primary">{{ cell.value }}</div>
			<div class="text-xs text-secondary">
				{{ cell.label }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { Clock, Cpu, MemoryStick, Thermometer } from '@lucide/vue'
import { computed } from 'vue'

import type { PiholeDiagnosis } from '../../../helpers/api'
import { formatDuration } from '../../../helpers/format'
import { useVIntl } from '../../../helpers/i18n'

const props = defineProps<{
	diagnosis: PiholeDiagnosis
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.diagnosis.cpu': { id: 'popup.diagnosis.cpu', defaultMessage: 'CPU' },
	'popup.diagnosis.memory': { id: 'popup.diagnosis.memory', defaultMessage: 'Memory' },
	'popup.diagnosis.temperature': { id: 'popup.diagnosis.temperature', defaultMessage: 'Temp' },
	'popup.diagnosis.uptime': { id: 'popup.diagnosis.uptime', defaultMessage: 'Uptime' },
})

const cells = computed(() => [
	{
		icon: Cpu,
		label: formatMessage(messages['popup.diagnosis.cpu']),
		value: `${props.diagnosis.cpu.toFixed(1)}%`,
	},
	{
		icon: MemoryStick,
		label: formatMessage(messages['popup.diagnosis.memory']),
		value: `${props.diagnosis.memory.toFixed(1)}%`,
	},
	{
		icon: Thermometer,
		label: formatMessage(messages['popup.diagnosis.temperature']),
		value:
			props.diagnosis.temperature !== null
				? `${Math.round(props.diagnosis.temperature)}°${props.diagnosis.tempUnit}`
				: '—',
	},
	{
		icon: Clock,
		label: formatMessage(messages['popup.diagnosis.uptime']),
		value: formatDuration(props.diagnosis.uptime),
	},
])
</script>
