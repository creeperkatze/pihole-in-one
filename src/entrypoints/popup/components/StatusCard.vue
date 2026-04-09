<template>
	<div
		class="flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border transition-colors duration-200"
		:class="
			status === 'enabled'
				? 'border-success-border bg-success-bg'
				: 'border-danger-border bg-danger-bg'
		"
	>
		<div class="flex items-center gap-2.5">
			<span
				class="w-2.5 h-2.5 rounded-full shrink-0"
				:class="
					status === 'enabled'
						? 'bg-pihole-green ring-[3px] ring-pihole-green/25'
						: 'bg-pihole-red ring-[3px] ring-pihole-red/25'
				"
			></span>
			<div>
				<div class="font-semibold text-sm">
					{{ status === 'enabled' ? 'Blocking Enabled' : 'Blocking Disabled' }}
				</div>
				<div class="text-xs text-zinc-500 dark:text-zinc-400 mt-px">{{ sub }}</div>
			</div>
		</div>
		<button class="btn" :disabled="disabled" @click="$emit('toggle')">
			{{ status === 'enabled' ? 'Disable' : 'Enable' }}
		</button>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	status: 'enabled' | 'disabled'
	sub?: string
	disabled?: boolean
}>()

defineEmits<{ toggle: [] }>()
</script>
