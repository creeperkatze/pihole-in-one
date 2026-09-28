<script setup lang="ts">
import type { Component } from 'vue'

import UiToggle from '../ui/Toggle.vue'

defineProps<{
	icon?: Component
	label: string
	description?: string
	modelValue: boolean
	disabled?: boolean
	disabledTooltip?: string
}>()

defineEmits<{
	'update:modelValue': [value: boolean]
}>()
</script>

<template>
	<div
		class="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-3 px-3 py-2"
		:class="disabled ? 'opacity-60' : ''"
		:title="disabled && disabledTooltip ? disabledTooltip : undefined"
	>
		<component :is="icon" v-if="icon" :size="18" class="shrink-0 text-secondary" />
		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium">{{ label }}</p>
			<p v-if="description" class="mt-0.5 text-xs text-secondary">{{ description }}</p>
		</div>
		<UiToggle
			:model-value="modelValue"
			:disabled="disabled"
			@update:model-value="$emit('update:modelValue', $event)"
		/>
	</div>
</template>
