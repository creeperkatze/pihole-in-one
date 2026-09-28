<template>
	<input
		v-bind="$attrs"
		:value="modelValue"
		class="px-3 py-2 border border-border rounded-[5px] bg-surface-3 text-primary transition-colors duration-150 outline-none focus:border-pihole-red"
		@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
	/>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
	modelValue?: string | number
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()
</script>
