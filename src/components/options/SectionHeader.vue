<template>
	<div class="p-4">
		<h1 class="text-lg font-semibold m-0">{{ title }}</h1>
		<p v-if="description" class="text-sm text-secondary mt-1 mb-0">
			{{ description }}
		</p>
	</div>
	<div class="border-b border-border-subtle"></div>
</template>

<script setup lang="ts">
defineProps<{
	title: string
	description?: string
}>()
</script>
