<template>
	<div
		class="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
	>
		<div>
			<div class="text-sm font-medium">{{ label }}</div>
			<div v-if="description" class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
				{{ description }}
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
defineProps<{
	label: string
	description?: string
	modelValue: string
	options: { value: string; label: string }[]
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()
</script>
