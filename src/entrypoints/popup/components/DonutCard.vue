<template>
	<div class="flex items-start gap-2 p-2 rounded-lg border border-border bg-surface-3">
		<svg class="shrink-0 size-12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<path v-for="arc in computedArcs" :key="arc.label" :d="arc.path" :fill="arc.color" />
		</svg>
		<div class="flex flex-col min-w-0">
			<div class="text-xs text-secondary mb-1">
				{{ title }}
			</div>
			<div class="grid gap-y-0.5">
				<div v-for="seg in activeSegments" :key="seg.label" class="flex items-center gap-1 min-w-0">
					<div class="size-1.5 rounded-full shrink-0" :style="{ background: seg.color }" />
					<span class="text-[10px] text-primary truncate">{{ seg.label }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	title: string
	segments: Array<{ label: string; value: number; color: string }>
}>()

const CX = 50
const CY = 50
const R_OUTER = 46
const R_INNER = 28

function segPath(startAngle: number, endAngle: number, gap: number): string {
	const s = startAngle + gap / 2
	const e = endAngle - gap / 2
	if (e - s < 0.001) return ''
	const large = e - s > Math.PI ? 1 : 0
	const f = (n: number) => n.toFixed(2)
	const x1 = CX + R_OUTER * Math.cos(s)
	const y1 = CY + R_OUTER * Math.sin(s)
	const x2 = CX + R_OUTER * Math.cos(e)
	const y2 = CY + R_OUTER * Math.sin(e)
	const x3 = CX + R_INNER * Math.cos(e)
	const y3 = CY + R_INNER * Math.sin(e)
	const x4 = CX + R_INNER * Math.cos(s)
	const y4 = CY + R_INNER * Math.sin(s)
	return `M${f(x1)} ${f(y1)} A${R_OUTER} ${R_OUTER} 0 ${large} 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${R_INNER} ${R_INNER} 0 ${large} 0 ${f(x4)} ${f(y4)}Z`
}

const activeSegments = computed(() => props.segments.filter((s) => s.value > 0))

const computedArcs = computed(() => {
	const active = activeSegments.value
	const total = active.reduce((sum, s) => sum + s.value, 0)
	if (total === 0) return []
	const gap = active.length > 1 ? 0.05 : 0
	let angle = -Math.PI / 2
	return active.map((seg) => {
		const sweep = (seg.value / total) * 2 * Math.PI
		const start = angle
		angle += sweep
		return { ...seg, path: segPath(start, angle, gap) }
	})
})
</script>
