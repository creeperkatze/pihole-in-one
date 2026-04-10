<template>
	<button
		type="button"
		class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left w-full transition-colors duration-150 cursor-pointer"
		:class="
			active
				? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200 dark:border-zinc-700'
				: 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50 border border-transparent'
		"
		@click="$emit('click')"
	>
		<component :is="icon" :size="16" />
		{{ label }}
	</button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
	icon: Component
	label: string
	active: boolean
}>()

defineEmits<{
	click: []
}>()
</script>
