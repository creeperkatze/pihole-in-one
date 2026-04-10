<template>
	<div
		class="flex items-center justify-between gap-4 py-3 border-b border-zinc-200 dark:border-zinc-800"
	>
		<div>
			<div class="text-sm font-medium">{{ label }}</div>
			<div v-if="description" class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
				{{ description }}
			</div>
		</div>
		<button
			type="button"
			role="switch"
			:aria-checked="modelValue"
			class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none"
			:class="modelValue ? 'bg-pihole-red' : 'bg-zinc-300 dark:bg-zinc-600'"
			@click="$emit('update:modelValue', !modelValue)"
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
	label: string
	description?: string
	modelValue: boolean
}>()

defineEmits<{
	'update:modelValue': [value: boolean]
}>()
</script>
