<script setup lang="ts">
import { Info } from '@lucide/vue'

defineProps<{
	text: string
}>()
</script>

<template>
	<span class="group relative inline-flex">
		<button
			type="button"
			class="cursor-help text-secondary transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
			:aria-label="text"
		>
			<Info class="size-3.5" />
		</button>
		<span
			role="tooltip"
			class="pointer-events-none absolute inset-s-0 top-full z-20 mt-1.5 w-56 rounded-md border border-border bg-surface-3 px-2.5 py-1.5 text-xs font-normal text-primary opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
		>
			{{ text }}
		</span>
	</span>
</template>
