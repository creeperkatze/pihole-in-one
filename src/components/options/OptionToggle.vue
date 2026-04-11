<template>
	<div
		class="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border bg-surface-3"
		:class="disabled ? 'opacity-60' : ''"
	>
		<div class="flex items-center gap-3 min-w-0">
			<component :is="icon" v-if="icon" class="size-5 shrink-0 text-muted" />
			<div>
				<div class="text-sm font-medium">{{ label }}</div>
				<div v-if="description" class="text-xs text-secondary mt-0.5">
					{{ description }}
				</div>
				<div v-if="disabled && disabledTooltip" class="text-xs text-muted mt-0.5 italic">
					{{ disabledTooltip }}
				</div>
			</div>
		</div>
		<button
			type="button"
			role="switch"
			:aria-checked="modelValue"
			:disabled="disabled"
			class="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none"
			:class="[
				modelValue ? 'bg-pihole-red' : 'bg-control-track',
				disabled ? 'cursor-not-allowed' : 'cursor-pointer',
			]"
			@click="!disabled && $emit('update:modelValue', !modelValue)"
		>
			<span
				class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
				:class="modelValue ? 'translate-x-4' : 'translate-x-0'"
			></span>
		</button>
	</div>
</template>

<script setup lang="ts">
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
