<template>
	<button
		type="button"
		role="switch"
		:aria-checked="modelValue"
		:disabled="disabled"
		class="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent focus-visible:outline-none"
		:class="[
			modelValue ? 'bg-pihole-red' : 'bg-control-track',
			disabled ? 'cursor-not-allowed' : 'cursor-pointer',
			mounted ? 'transition-colors duration-200' : '',
		]"
		@click="!disabled && $emit('update:modelValue', !modelValue)"
	>
		<span
			class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform"
			:class="[
				modelValue ? 'translate-x-4' : 'translate-x-0',
				mounted ? 'transition-transform duration-200' : '',
			]"
		></span>
	</button>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

defineProps<{
	modelValue: boolean
	disabled?: boolean
}>()

defineEmits<{
	'update:modelValue': [value: boolean]
}>()

const mounted = ref(false)
onMounted(() => {
	nextTick(() => {
		mounted.value = true
	})
})
</script>
