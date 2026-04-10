<template>
	<div
		class="flex flex-col gap-2 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
	>
		<div class="flex items-center justify-between gap-4">
			<div>
				<div class="text-sm font-medium">{{ label }}</div>
				<div v-if="description" class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
					{{ description }}
				</div>
			</div>
			<span class="text-sm font-medium tabular-nums shrink-0 text-zinc-950 dark:text-zinc-50">
				{{ format ? format(modelValue) : modelValue }}
			</span>
		</div>
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
</template>

<script setup lang="ts">
defineProps<{
	label: string
	description?: string
	modelValue: number
	min: number
	max: number
	step?: number
	format?: (value: number) => string
}>()

defineEmits<{
	'update:modelValue': [value: number]
}>()
</script>
