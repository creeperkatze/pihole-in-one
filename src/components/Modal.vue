<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
	defineProps<{ modelValue: boolean; fullscreen?: boolean; wide?: boolean }>(),
	{
		fullscreen: false,
		wide: false,
	},
)
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && props.modelValue) emit('update:modelValue', false)
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const pressStartedOnBackdrop = ref(false)

function onBackdropMousedown(e: MouseEvent) {
	pressStartedOnBackdrop.value = e.target === e.currentTarget
}

function onBackdropClick(e: MouseEvent) {
	if (pressStartedOnBackdrop.value && e.target === e.currentTarget) {
		emit('update:modelValue', false)
	}
	pressStartedOnBackdrop.value = false
}
</script>

<template>
	<Teleport to="body">
		<div
			v-if="modelValue"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			@mousedown="onBackdropMousedown"
			@click="onBackdropClick"
		>
			<div
				class="rounded-xl border border-border bg-surface-2 shadow-xl"
				:class="
					fullscreen
						? 'flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden'
						: ['mx-4 w-full p-6', wide ? 'max-w-xl' : 'max-w-sm']
				"
				@click.stop
			>
				<slot />
			</div>
		</div>
	</Teleport>
</template>
