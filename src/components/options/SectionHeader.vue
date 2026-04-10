<template>
	<div class="px-8 pt-8 pb-6">
		<h1 class="text-lg font-semibold m-0">{{ title }}</h1>
		<p v-if="description" class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
			{{ description }}
		</p>
	</div>
	<div class="border-b border-zinc-200 dark:border-zinc-800"></div>
</template>

<script setup lang="ts">
defineProps<{
	title: string
	description?: string
}>()
</script>
