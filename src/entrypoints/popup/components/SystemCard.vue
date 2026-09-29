<script setup lang="ts">
import { Clock, Cpu, MemoryStick, Thermometer } from '@lucide/vue'
import type { PaddResponse } from 'pihole-js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatDuration } from '../../../utils/format'

const props = defineProps<{
	padd: PaddResponse
}>()

const { t } = useI18n()

const HOT_CELSIUS = 70

function toCelsius(value: number, unit: string): number {
	if (unit === 'F') return ((value - 32) * 5) / 9
	if (unit === 'K') return value - 273.15
	return value
}

const tiles = computed(() => {
	const cpu = props.padd['%cpu'] ?? 0
	const memory = props.padd['%mem'] ?? 0
	const temperature = props.padd.sensors?.cpu_temp ?? null
	const tempUnit = props.padd.sensors?.unit ?? 'C'
	const uptime = props.padd.system?.uptime ?? 0
	const hot = temperature !== null && toCelsius(temperature, tempUnit) >= HOT_CELSIUS
	return [
		{ icon: Cpu, label: t('popup.system.cpu'), value: `${cpu.toFixed(1)}%`, color: 'text-sky-500' },
		{
			icon: MemoryStick,
			label: t('popup.system.memory'),
			value: `${memory.toFixed(1)}%`,
			color: 'text-fuchsia-500',
		},
		{
			icon: Thermometer,
			label: t('popup.system.temperature'),
			value: temperature !== null ? `${Math.round(temperature)}°${tempUnit}` : '–',
			color: hot ? 'text-pihole-red' : 'text-yellow-500',
			hot,
		},
		{
			icon: Clock,
			label: t('popup.system.uptime'),
			value: formatDuration(uptime),
			color: 'text-green-500',
		},
	]
})
</script>

<template>
	<div class="grid grid-cols-4 gap-2">
		<div
			v-for="tile in tiles"
			:key="tile.label"
			class="flex min-w-0 flex-col items-center rounded-lg border border-border bg-surface-3 px-1 py-2"
		>
			<component :is="tile.icon" class="mb-1.5 size-4 shrink-0" :class="tile.color" />
			<p
				class="max-w-full truncate text-sm font-semibold"
				:class="tile.hot ? 'text-pihole-red' : 'text-primary'"
			>
				{{ tile.value }}
			</p>
			<p class="max-w-full truncate text-[11px] text-secondary">{{ tile.label }}</p>
		</div>
	</div>
</template>
