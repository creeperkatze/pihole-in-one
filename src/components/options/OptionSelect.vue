<script setup lang="ts" generic="T extends { value: string; label: string }">
import type { Component } from 'vue'

import Dropdown from '../ui/Dropdown.vue'

defineProps<{
	icon?: Component
	label: string
	description?: string
	modelValue: string
	options: T[]
	disabled?: boolean
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()

defineSlots<{
	leading?: (props: { option: T }) => unknown
	description?: () => unknown
}>()
</script>

<template>
	<div
		class="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-3 px-3 py-2"
		:class="disabled ? 'opacity-60' : ''"
	>
		<component :is="icon" v-if="icon" :size="18" class="shrink-0 text-secondary" />
		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium">{{ label }}</p>
			<p v-if="$slots.description" class="mt-0.5 text-xs text-secondary">
				<slot name="description" />
			</p>
			<p v-else-if="description" class="mt-0.5 text-xs text-secondary">{{ description }}</p>
		</div>
		<Dropdown
			class="w-40 shrink-0"
			:model-value="modelValue"
			:options="options"
			:disabled="disabled"
			@update:model-value="$emit('update:modelValue', $event)"
		>
			<template v-if="$slots.leading" #leading="slotProps">
				<slot name="leading" v-bind="slotProps" />
			</template>
		</Dropdown>
	</div>
</template>
