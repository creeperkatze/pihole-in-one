<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
	defineProps<{
		icon: Component
		text: string
		error?: boolean
	}>(),
	{ error: false },
)
</script>

<template>
	<div class="flex flex-col items-center gap-2 px-4 py-8 text-center">
		<component :is="icon" class="size-6" :class="error ? 'text-pihole-red' : 'text-muted'" />
		<p class="m-0 text-sm" :class="error ? 'text-pihole-red' : 'text-secondary'">{{ text }}</p>
		<div v-if="$slots.default" class="mt-1">
			<slot />
		</div>
	</div>
</template>
