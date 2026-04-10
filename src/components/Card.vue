<template>
	<component
		:is="as"
		class="card group rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-between gap-2 px-2.5 py-2"
		:style="{ '--c': color ?? '#a1a1aa' }"
	>
		<div class="min-w-0 flex-1">
			<div class="text-sm font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
				{{ title }}
			</div>
			<div v-if="description" class="text-xs text-zinc-500 dark:text-zinc-400 mt-px">
				{{ description }}
			</div>
		</div>
		<slot name="icon" />
	</component>
</template>

<script setup lang="ts">
import { type Component } from 'vue'

withDefaults(
	defineProps<{
		as?: string | Component
		color?: string
		title: string
		description?: string
	}>(),
	{
		as: 'div',
		color: undefined,
		description: undefined,
	},
)
</script>

<style>
.card {
	background-color: color-mix(in srgb, var(--c) 8%, white);
	border-color: color-mix(in srgb, var(--c) 22%, transparent);
}

.card:hover {
	background-color: color-mix(in srgb, var(--c) 22%, white);
	border-color: color-mix(in srgb, var(--c) 60%, transparent);
}

.dark .card {
	background-color: color-mix(in srgb, var(--c) 12%, #27272a);
	border-color: color-mix(in srgb, var(--c) 28%, transparent);
}

.dark .card:hover {
	background-color: color-mix(in srgb, var(--c) 28%, #27272a);
	border-color: color-mix(in srgb, var(--c) 65%, transparent);
}
</style>
