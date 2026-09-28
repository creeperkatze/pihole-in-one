<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
	modelValue?: string | number
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()
</script>

<template>
	<input
		v-bind="$attrs"
		:value="modelValue"
		class="h-9 rounded-md border border-border bg-surface-control px-3 text-sm text-primary transition-colors outline-none placeholder:text-muted focus:border-pihole-red disabled:cursor-not-allowed disabled:opacity-50"
		@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
	/>
</template>
