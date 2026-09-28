<script setup lang="ts">
import type { Component } from 'vue'

import UiButton from '../ui/Button.vue'

defineProps<{
	icon?: Component
	label: string
	description?: string
	buttonLabel: string
	disabled?: boolean
}>()

defineEmits<{
	click: []
}>()
</script>

<template>
	<div
		class="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-3 px-3 py-2"
	>
		<component :is="icon" v-if="icon" :size="18" class="shrink-0 text-secondary" />
		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium">{{ label }}</p>
			<p v-if="description" class="mt-0.5 text-xs text-secondary">{{ description }}</p>
		</div>
		<UiButton :disabled="disabled" @click="$emit('click')">
			{{ buttonLabel }}
		</UiButton>
	</div>
</template>
