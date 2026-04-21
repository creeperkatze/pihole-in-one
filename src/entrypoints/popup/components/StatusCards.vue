<template>
	<div class="flex flex-col gap-2">
		<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
			{{ formatMessage(messages['popup.status']) }}
		</div>
		<div class="grid grid-cols-4 gap-1.5">
			<div
				v-for="cell in cells"
				:key="cell.label"
				class="flex flex-col items-center p-2 rounded-lg border border-border bg-surface-3"
			>
				<component :is="cell.icon" class="size-6 shrink-0 mb-2" :class="cell.color" />
				<div class="text-sm font-semibold text-primary">{{ cell.value }}</div>
				<div class="text-xs text-secondary">
					{{ cell.label }}
				</div>
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
	status: PiholeDiagnosis
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.status': { id: 'popup.status', defaultMessage: 'Status' },
	'popup.status.cpu': { id: 'popup.status.cpu', defaultMessage: 'CPU' },
	'popup.status.memory': { id: 'popup.status.memory', defaultMessage: 'Memory' },
	'popup.status.temperature': { id: 'popup.status.temperature', defaultMessage: 'Temp' },
	'popup.status.uptime': { id: 'popup.status.uptime', defaultMessage: 'Uptime' },
})

const cells = computed(() => [
	{
		icon: Cpu,
		label: formatMessage(messages['popup.status.cpu']),
		value: `${props.status.cpu.toFixed(1)}%`,
		color: 'text-sky-500',
	},
	{
		icon: MemoryStick,
		label: formatMessage(messages['popup.status.memory']),
		value: `${props.status.memory.toFixed(1)}%`,
		color: 'text-fuchsia-500',
	},
	{
		icon: Thermometer,
		label: formatMessage(messages['popup.status.temperature']),
		value:
			props.status.temperature !== null
				? `${Math.round(props.status.temperature)}°${props.status.tempUnit}`
				: '-',
		color: 'text-yellow-500',
	},
	{
		icon: Clock,
		label: formatMessage(messages['popup.status.uptime']),
		value: formatDuration(props.status.uptime),
		color: 'text-green-500',
	},
])
</script>
