<template>
	<div
		class="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border bg-surface-3"
	>
		<div class="flex items-center gap-3 min-w-0">
			<component :is="icon" v-if="icon" :size="16" class="shrink-0 text-muted" />
			<div>
				<div class="text-sm font-medium">{{ label }}</div>
				<div v-if="description" class="text-xs text-secondary mt-0.5">
					{{ description }}
				</div>
			</div>
		</div>
		<select
			class="input w-auto text-sm py-1.5"
			:value="modelValue"
			@change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
		>
			<option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
		</select>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
	icon?: Component
	label: string
	description?: string
	modelValue: string
	options: { value: string; label: string }[]
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()
</script>
