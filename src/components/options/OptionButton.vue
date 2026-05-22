<template>
	<div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-surface-3">
		<component :is="icon" class="size-5 shrink-0 text-muted" />
		<div class="flex-1 min-w-0">
			<div class="text-sm font-medium">{{ label }}</div>
			<div v-if="description" class="text-xs text-secondary mt-0.5">{{ description }}</div>
		</div>
		<Button @click="$emit('action')">{{ buttonLabel }}</Button>
	</div>
</template>

<script lang="ts">
export type ButtonOption = {
	id: string
	type: 'button'
	icon: import('vue').Component
	label: string
	description: string
	buttonLabel: string
	onClick: () => void
}
</script>

<script setup lang="ts">
import Button from '../Button.vue'

defineProps<{
	icon: import('vue').Component
	label: string
	description?: string
	buttonLabel: string
}>()

defineEmits<{ action: [] }>()
</script>
