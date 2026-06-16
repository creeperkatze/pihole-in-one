<template>
	<div class="px-4 pt-6 pb-5 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8">
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
