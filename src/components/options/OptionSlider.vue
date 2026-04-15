<template>
	<div class="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border bg-surface-3">
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-3 min-w-0">
				<component :is="icon" v-if="icon" class="size-5 shrink-0 text-muted" />
				<div>
					<div class="text-sm font-medium">{{ label }}</div>
					<div v-if="description" class="text-xs text-secondary mt-0.5">
						{{ description }}
					</div>
				</div>
			</div>
			<div class="flex items-center gap-1 shrink-0">
				<Input
					type="number"
					:min="min"
					:max="max"
					:step="step"
					:model-value="inputVal"
					class="w-16 text-right tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					@update:model-value="inputVal = +$event > max ? String(max) : $event"
					@change="$emit('update:modelValue', Math.min(max, Math.max(min, +inputVal || min)))"
				/>
				<span v-if="suffix" class="text-sm text-secondary">{{ suffix }}</span>
			</div>
		</div>
		<div :class="icon ? 'pl-7' : ''">
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

<script lang="ts">
export type SliderOption = {
	id: string
	type: 'slider'
	formKey: 'refreshInterval'
	icon?: import('vue').Component
	label: string
	description: string
	min: number
	max: number
	step: number
	format?: (v: number) => string
}
</script>

<script setup lang="ts">
import type { Component } from 'vue'
import { ref, watch } from 'vue'

import Input from '../Input.vue'

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
