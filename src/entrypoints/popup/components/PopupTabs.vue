<template>
	<div class="flex gap-1">
		<button
			v-for="tab in tabs"
			:key="tab.id"
			type="button"
			class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
			:class="
				modelValue === tab.id
					? 'bg-surface-raised text-primary shadow-xs border-border'
					: 'text-secondary hover:bg-surface-3 hover:text-primary border-transparent'
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
