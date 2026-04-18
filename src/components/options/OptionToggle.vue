<template>
	<div
		class="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border bg-surface-3"
		:class="disabled ? 'opacity-60' : ''"
		:title="disabled && disabledTooltip ? disabledTooltip : undefined"
	>
		<div class="flex items-center gap-3 min-w-0">
			<component :is="icon" v-if="icon" class="size-5 shrink-0 text-muted" />
			<div>
				<div class="text-sm font-medium">{{ label }}</div>
				<div v-if="description" class="text-xs text-secondary mt-0.5">
					{{ description }}
				</div>
			</div>
		</div>
		<Toggle
			:model-value="modelValue"
			:disabled="disabled"
			@update:model-value="$emit('update:modelValue', $event)"
		/>
	</div>
</template>

<script lang="ts">
import type { SettingsKeyOfType } from '../../helpers/settings'

export type ToggleOption = {
	id: string
	type: 'toggle'
	formKey: SettingsKeyOfType<boolean>
	icon?: import('vue').Component
	label: string
	description: string
}
</script>

<script setup lang="ts">
import Toggle from '../Toggle.vue'

defineProps<{
	icon?: import('vue').Component
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
