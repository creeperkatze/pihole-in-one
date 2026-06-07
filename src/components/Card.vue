<template>
	<component
		:is="as"
		class="card group rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-between gap-2 px-2.5 py-2"
		:style="{ '--c': color ?? '#a1a1aa' }"
	>
		<slot v-if="iconPosition === 'left'" name="icon" />
		<div class="min-w-0 flex-1">
			<div class="text-sm font-semibold text-primary leading-tight">
				{{ title }}
			</div>
			<div v-if="description" class="text-xs text-secondary mt-px">
				{{ description }}
			</div>
		</div>
		<slot v-if="iconPosition === 'right'" name="icon" />
		<button
			v-if="dismissible"
			type="button"
			class="flex self-start shrink-0 size-5 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-muted transition-colors hover:text-primary"
			:title="dismissLabel"
			@click.prevent.stop="$emit('dismiss')"
		>
			<X class="size-4" aria-hidden="true" />
		</button>
	</component>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'
import { type Component } from 'vue'

withDefaults(
	defineProps<{
		as?: string | Component
		color?: string
		title: string
		description?: string
		iconPosition?: 'left' | 'right'
		dismissible?: boolean
		dismissLabel?: string
	}>(),
	{
		as: 'div',
		color: undefined,
		description: undefined,
		iconPosition: 'right',
		dismissible: false,
		dismissLabel: undefined,
	},
)

defineEmits<{ dismiss: [] }>()
</script>

<style>
.card {
	background-color: color-mix(in srgb, var(--c) 8%, var(--color-surface-raised));
	border-color: color-mix(in srgb, var(--c) 22%, transparent);
}

.card:hover {
	background-color: color-mix(in srgb, var(--c) 22%, var(--color-surface-raised));
	border-color: color-mix(in srgb, var(--c) 60%, transparent);
}
</style>
