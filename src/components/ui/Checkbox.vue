<script setup lang="ts">
import { Check, Minus } from '@lucide/vue'
import { useTemplateRef, watchEffect } from 'vue'

const props = defineProps<{
	modelValue: boolean
	disabled?: boolean
	neutral?: boolean
}>()

defineEmits<{
	'update:modelValue': [value: boolean]
}>()

const inputRef = useTemplateRef('input')
watchEffect(() => {
	if (inputRef.value) inputRef.value.indeterminate = !!props.neutral && !props.modelValue
})
</script>

<template>
	<span class="relative inline-flex size-4 shrink-0">
		<input
			ref="input"
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			class="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
			@change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
		/>
		<span
			class="pointer-events-none inline-flex size-4 items-center justify-center rounded border transition-colors"
			:class="[
				modelValue || neutral
					? 'border-pihole-red bg-pihole-red'
					: 'border-border bg-surface-control',
				disabled ? 'opacity-60' : '',
			]"
		>
			<Check v-if="modelValue" class="size-3 text-white" :stroke-width="3" />
			<Minus v-else-if="neutral" class="size-3 text-white" :stroke-width="3" />
		</span>
	</span>
</template>
