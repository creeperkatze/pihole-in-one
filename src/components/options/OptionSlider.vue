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
				class="slider w-full cursor-pointer"
				:style="{ '--fill': `${fill}%` }"
				@input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref, watch } from 'vue'

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

const fill = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)

const inputVal = ref(String(props.modelValue))
watch(
	() => props.modelValue,
	(v) => {
		inputVal.value = String(v)
	},
)
</script>

<style scoped>
.slider {
	appearance: none;
	height: 1rem;
	background: transparent;
	--track: linear-gradient(
		to right,
		var(--color-pihole-red) var(--fill),
		var(--color-surface-control) var(--fill)
	);
}

.slider:dir(rtl) {
	--track: linear-gradient(
		to left,
		var(--color-pihole-red) var(--fill),
		var(--color-surface-control) var(--fill)
	);
}

.slider:focus-visible {
	outline: none;
}

.slider::-webkit-slider-runnable-track {
	box-sizing: border-box;
	height: 0.5625rem;
	border: 1px solid var(--color-border);
	border-radius: 9999px;
	background: var(--track);
}

.slider::-moz-range-track {
	box-sizing: border-box;
	height: 0.5625rem;
	border: 1px solid var(--color-border);
	border-radius: 9999px;
	background: var(--track);
}

.slider::-webkit-slider-thumb {
	appearance: none;
	margin-top: calc((0.5625rem - 2px - 1rem) / 2);
	width: 1rem;
	height: 1rem;
	border: none;
	border-radius: 9999px;
	background: var(--color-primary);
	transition: background-color 150ms;
}

.slider::-moz-range-thumb {
	width: 1rem;
	height: 1rem;
	border: none;
	border-radius: 9999px;
	background: var(--color-primary);
	transition: background-color 150ms;
}

.slider:hover::-webkit-slider-thumb {
	background: color-mix(in srgb, var(--color-primary) 75%, var(--color-surface-3));
}

.slider:hover::-moz-range-thumb {
	background: color-mix(in srgb, var(--color-primary) 75%, var(--color-surface-3));
}

.slider:focus-visible::-webkit-slider-thumb {
	box-shadow: 0 0 0 2px var(--color-pihole-red);
}

.slider:focus-visible::-moz-range-thumb {
	box-shadow: 0 0 0 2px var(--color-pihole-red);
}
</style>
