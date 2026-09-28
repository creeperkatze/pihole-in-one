<template>
	<div class="flex flex-col gap-2 rounded-lg border border-border bg-surface-3 px-3 py-2">
		<div class="flex min-w-0 items-center gap-3">
			<component :is="icon" v-if="icon" :size="18" class="shrink-0 text-secondary" />
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">{{ label }}</p>
				<p v-if="description" class="mt-0.5 text-xs text-secondary">{{ description }}</p>
			</div>
			<div class="flex items-center gap-1 shrink-0">
				<Input
					type="number"
					:min="min"
					:max="max"
					:step="step"
					:model-value="inputVal"
					class="w-16 text-end tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					@update:model-value="inputVal = +$event > max ? String(max) : $event"
					@change="$emit('update:modelValue', Math.min(max, Math.max(min, +inputVal || min)))"
				/>
				<span v-if="suffix" class="text-sm text-secondary">{{ suffix }}</span>
			</div>
		</div>
		<div :class="icon ? 'ps-7.5' : ''">
			<input
				type="range"
				:min="min"
				:max="max"
				:step="step"
				:value="modelValue"
				class="w-full accent-pihole-red cursor-pointer"
				@input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ref, watch } from 'vue'

import Input from '../ui/Input.vue'

const props = defineProps<{
	icon?: Component
	label: string
	description?: string
	modelValue: number
	min: number
	max: number
	step?: number
	suffix?: string
	format?: (value: number) => string
}>()

defineEmits<{
	'update:modelValue': [value: number]
}>()

const inputVal = ref(String(props.modelValue))
watch(
	() => props.modelValue,
	(v) => {
		inputVal.value = String(v)
	},
)
</script>
