<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
	defineProps<{
		variant?: 'default' | 'primary' | 'success'
		size?: 'sm' | 'md' | 'icon'
		type?: 'button' | 'submit' | 'reset'
		disabled?: boolean
		active?: boolean
	}>(),
	{
		variant: 'default',
		size: 'md',
		type: 'button',
		disabled: false,
		active: false,
	},
)

const classes = computed(() => [
	'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
	props.size === 'icon' ? 'size-9 p-0' : props.size === 'sm' ? 'h-8 px-3' : 'h-9 px-3',
	props.variant === 'default' &&
		!props.active &&
		'border-border bg-surface-control text-primary enabled:hover:bg-surface-hover',
	props.variant === 'primary' &&
		'border-pihole-red bg-pihole-red text-white enabled:hover:bg-pihole-red-hover',
	props.variant === 'success' &&
		'border-pihole-green bg-pihole-green text-black enabled:hover:bg-pihole-green-hover',
	props.active && 'border-pihole-red bg-pihole-red/10 text-primary',
])

defineSlots<{
	default?: () => unknown
	icon?: () => unknown
}>()
</script>

<template>
	<button :type="type" :disabled="disabled" :class="classes">
		<slot />
		<slot name="icon" />
	</button>
</template>
