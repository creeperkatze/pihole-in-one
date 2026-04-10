<template>
	<div class="grid grid-cols-2 gap-2">
		<div
			v-for="stat in stats"
			:key="stat.label"
			class="px-3 py-2.5 rounded-lg border border-border bg-surface-3"
		>
			<div class="text-lg font-bold tracking-tight leading-tight">{{ stat.value }}</div>
			<div class="text-[11px] text-secondary mt-0.5 uppercase tracking-[0.4px]">
				{{ stat.label }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	stats: Array<{ label: string; value: string }>
}>()
</script>
