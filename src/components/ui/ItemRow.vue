<script setup lang="ts">
defineProps<{
	as?: string
	active?: boolean
	interactive?: boolean
}>()
</script>

<template>
	<component
		:is="as || 'div'"
		class="flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors"
		:class="[
			active ? 'border-pihole-red/30 bg-pihole-red/10' : 'border-border bg-surface-3',
			interactive && 'cursor-pointer hover:bg-surface-hover',
		]"
	>
		<slot name="leading" />
		<div class="min-w-0 flex-1">
			<slot />
		</div>
		<slot name="trailing" />
	</component>
</template>
