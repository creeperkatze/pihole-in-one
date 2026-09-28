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

<template>
	<button
		type="button"
		class="flex w-full cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-start text-sm font-medium whitespace-nowrap transition-colors"
		:class="
			active
				? 'border-pihole-red bg-pihole-red/10 text-primary'
				: 'border-transparent text-secondary hover:border-border hover:bg-surface-hover hover:text-primary'
		"
		@click="$emit('click')"
	>
		<component :is="icon" :size="16" class="shrink-0" />
		{{ label }}
	</button>
</template>
