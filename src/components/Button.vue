<template>
	<button :type="type" :data-variant="variant" :class="classes">
		<slot />
	</button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
	defineProps<{
		variant?: 'default' | 'primary' | 'success' | 'danger' | 'outline'
		size?: 'default' | 'small'
		type?: 'button' | 'submit' | 'reset'
	}>(),
	{
		variant: 'default',
		size: 'default',
		type: 'button',
	},
)

const variantClasses: Record<string, string> = {
	default: 'border-border bg-surface-3 text-primary',
	primary: 'bg-pihole-red border-pihole-red text-white',
	success: 'bg-pihole-green border-pihole-green text-black',
	danger: 'bg-pihole-red border-pihole-red text-white',
	outline: 'bg-transparent border-border text-primary',
}

const classes = computed(() => [
	'inline-flex items-center gap-1.5 border rounded-[5px] font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
	props.size === 'small' ? 'px-2.5 py-[3px] text-xs' : 'px-3.5 py-1.5',
	variantClasses[props.variant],
])
</script>

<style scoped>
button:hover:not(:disabled) {
	background-color: var(--color-surface-hover);
}

button[data-variant='primary']:hover:not(:disabled),
button[data-variant='danger']:hover:not(:disabled) {
	background-color: #990000;
}

button[data-variant='success']:hover:not(:disabled) {
	background-color: #009900;
}

button[data-variant='outline']:hover:not(:disabled) {
	background-color: var(--color-surface-hover);
}
</style>
