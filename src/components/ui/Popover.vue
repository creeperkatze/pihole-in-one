<script setup lang="ts">
import { nextTick, onUnmounted, ref, useTemplateRef, watch } from 'vue'

const props = withDefaults(
	defineProps<{
		open: boolean
		align?: 'start' | 'end'
	}>(),
	{ align: 'start' },
)

const emit = defineEmits<{
	'update:open': [open: boolean]
}>()

defineSlots<{
	trigger?: () => unknown
	default?: () => unknown
}>()

const GAP = 6
const MARGIN = 8

const anchor = useTemplateRef('anchor')
const panel = useTemplateRef('panel')
const position = ref<Record<string, string>>({})

function close(focusTrigger = false): void {
	emit('update:open', false)
	if (focusTrigger) anchor.value?.querySelector<HTMLElement>('button')?.focus()
}

// The panel lives in the body so the popup's scroll area can't clip it
function place(): void {
	if (!anchor.value || !panel.value) return
	const rect = anchor.value.getBoundingClientRect()
	const height = panel.value.offsetHeight
	const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - MARGIN
	const top = fitsBelow ? rect.bottom + GAP : Math.max(MARGIN, rect.top - GAP - height)
	position.value =
		props.align === 'end'
			? { top: `${top}px`, right: `${Math.max(MARGIN, window.innerWidth - rect.right)}px` }
			: { top: `${top}px`, left: `${Math.max(MARGIN, rect.left)}px` }
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key !== 'Escape') return
	event.preventDefault()
	close(true)
}

watch(
	() => props.open,
	async (isOpen) => {
		if (!isOpen) {
			document.removeEventListener('keydown', onKeydown)
			return
		}
		document.addEventListener('keydown', onKeydown)
		position.value = { visibility: 'hidden' }
		await nextTick()
		place()
		panel.value?.querySelector<HTMLElement>('input, button')?.focus()
	},
)

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
	<div ref="anchor">
		<slot name="trigger" />
	</div>
	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-100"
			enter-from-class="opacity-0"
			leave-active-class="transition-opacity duration-75"
			leave-to-class="opacity-0"
		>
			<div v-if="open" class="fixed inset-0 z-50 bg-black/50" @click="close()" />
		</Transition>
		<Transition
			enter-active-class="transition duration-100"
			enter-from-class="opacity-0 scale-95"
			leave-active-class="transition-opacity duration-75"
			leave-to-class="opacity-0"
		>
			<div
				v-if="open"
				ref="panel"
				role="dialog"
				class="fixed z-50 w-max rounded-lg border border-border bg-surface-3 p-3 shadow-xl"
				:class="align === 'end' ? 'origin-top-right' : 'origin-top-left'"
				:style="position"
			>
				<slot />
			</div>
		</Transition>
	</Teleport>
</template>
