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
	default:
		'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50',
	primary: 'bg-pihole-red border-pihole-red text-white',
	success: 'bg-pihole-green border-pihole-green text-black',
	danger: 'bg-pihole-red border-pihole-red text-white',
	outline: 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50',
}

const classes = computed(() => [
	'inline-flex items-center gap-1.5 border rounded-[5px] font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
	props.size === 'small' ? 'px-2.5 py-[3px] text-xs' : 'px-3.5 py-1.5',
	variantClasses[props.variant],
])
</script>

<style scoped>
button:hover:not(:disabled) {
	background-color: #e4e4e7;
}

@media (prefers-color-scheme: dark) {
	button:hover:not(:disabled) {
		background-color: #3f3f46;
	}
}

button[data-variant='primary']:hover:not(:disabled),
button[data-variant='danger']:hover:not(:disabled) {
	background-color: #cc0000;
	border-color: #cc0000;
}

button[data-variant='success']:hover:not(:disabled) {
	background-color: #00cc00;
	border-color: #00cc00;
}

button[data-variant='outline']:hover:not(:disabled) {
	background-color: #f4f4f5;
}

@media (prefers-color-scheme: dark) {
	button[data-variant='outline']:hover:not(:disabled) {
		background-color: #27272a;
	}
}
</style>
