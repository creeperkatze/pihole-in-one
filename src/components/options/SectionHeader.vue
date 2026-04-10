<template>
	<div class="px-8 pt-8 pb-6">
		<h1 class="text-lg font-semibold m-0">{{ title }}</h1>
		<p v-if="description" class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
			{{ description }}
		</p>
	</div>
	<div class="h-px bg-zinc-200 dark:bg-zinc-700"></div>
</template>

<script setup lang="ts">
defineProps<{
	title: string
	description?: string
}>()
</script>
