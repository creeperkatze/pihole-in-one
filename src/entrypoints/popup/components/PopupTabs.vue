<template>
	<div class="flex gap-1">
		<button
			v-for="tab in tabs"
			:key="tab.id"
			type="button"
			class="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors"
			:class="
				modelValue === tab.id
					? 'border-pihole-red bg-pihole-red/10 text-primary'
					: 'border-transparent text-secondary hover:border-border hover:bg-surface-hover hover:text-primary'
			"
			@click="$emit('update:modelValue', tab.id)"
		>
			<span v-if="tab.error" class="w-1.5 h-1.5 rounded-full bg-pihole-red shrink-0"></span>
			<component :is="tab.icon" v-if="tab.icon" class="size-4 shrink-0" />
			<span class="truncate">{{ tab.label }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

export interface PopupTab {
	id: string
	label: string
	icon?: Component
	error?: boolean
}

defineProps<{
	tabs: PopupTab[]
	modelValue: string
}>()

defineEmits<{
	'update:modelValue': [id: string]
}>()
</script>
