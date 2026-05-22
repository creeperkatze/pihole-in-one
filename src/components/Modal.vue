<template>
	<Teleport to="body">
		<div
			v-if="modelValue"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			@click="$emit('update:modelValue', false)"
		>
			<div
				class="bg-surface-2 border border-border rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
				@click.stop
			>
				<slot />
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && props.modelValue) emit('update:modelValue', false)
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
