<template>
	<div class="flex flex-col gap-2">
		<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
			{{ t('popup.status.title') }}
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
import { Clock, Cpu, MemoryStick, Thermometer } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { PiholeDiagnosis } from '../../../utils/api'
import { formatDuration } from '../../../utils/format'

const props = defineProps<{
	status: PiholeDiagnosis
}>()

const { t } = useI18n()

const cells = computed(() => [
	{
		icon: Cpu,
		label: t('popup.status.cpu'),
		value: `${props.status.cpu.toFixed(1)}%`,
		color: 'text-sky-500',
	},
	{
		icon: MemoryStick,
		label: t('popup.status.memory'),
		value: `${props.status.memory.toFixed(1)}%`,
		color: 'text-fuchsia-500',
	},
	{
		icon: Thermometer,
		label: t('popup.status.temperature'),
		value:
			props.status.temperature !== null
				? `${Math.round(props.status.temperature)}°${props.status.tempUnit}`
				: '-',
		color: 'text-yellow-500',
	},
	{
		icon: Clock,
		label: t('popup.status.uptime'),
		value: formatDuration(props.status.uptime),
		color: 'text-green-500',
	},
])
</script>
