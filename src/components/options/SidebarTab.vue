<template>
	<button
		type="button"
		class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer"
		:class="
			active
				? 'bg-surface-raised text-primary shadow-xs border border-border'
				: 'text-secondary hover:bg-surface-3 hover:text-primary border border-transparent'
		"
		@click="$emit('click')"
	>
		<component :is="icon" class="size-4" />
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
