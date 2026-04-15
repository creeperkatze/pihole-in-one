<template>
	<div class="grid grid-cols-2 gap-2">
		<div
			v-for="stat in stats"
			:key="stat.label"
			class="relative overflow-hidden px-3 py-2.5 rounded-lg border border-border bg-surface-3"
		>
			<svg
				v-if="stat.sparkline && stat.sparkline.length > 1"
				class="absolute inset-0 w-full h-full pointer-events-none"
				preserveAspectRatio="none"
				viewBox="0 0 100 56"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					:d="linePath(stat.sparkline)"
					:stroke="stat.sparklineColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="none"
					opacity="0.6"
				/>
			</svg>
			<div
				class="absolute inset-0 pointer-events-none"
				style="
					background: linear-gradient(
						to right,
						color-mix(in srgb, var(--color-surface-3) 80%, transparent) 20%,
						transparent 60%
					);
				"
			></div>
			<div class="relative text-lg font-bold">{{ stat.value }}</div>
			<div class="relative text-xs text-secondary mt-0.5">{{ stat.label }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	stats: Array<{ label: string; value: string; sparkline?: number[]; sparklineColor?: string }>
}>()

const WIDTH = 100
const HEIGHT = 56
const PAD_TOP = 6
const PAD_H = 0

function toPoints(data: number[]): { x: number; y: number }[] {
	const min = Math.min(...data)
	const max = Math.max(...data)
	const range = max - min || 1
	const chartH = HEIGHT - PAD_TOP
	return data.map((v, i) => ({
		x: PAD_H + (i / (data.length - 1)) * (WIDTH - PAD_H * 2),
		y: PAD_TOP + (1 - (v - min) / range) * chartH,
	}))
}

function linePath(data: number[]): string {
	const pts = toPoints(data)
	return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}
</script>
