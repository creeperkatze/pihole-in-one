<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type Unit = 'm' | 'h'

const props = defineProps<{
	modelValue: number
	disabled?: boolean
}>()

const emit = defineEmits<{
	'update:modelValue': [seconds: number]
	submit: []
}>()

const { t } = useI18n()

const UNIT_SECONDS: Record<Unit, number> = { m: 60, h: 3600 }
const MAX: Record<Unit, number> = { m: 999, h: 99 }

function fromSeconds(seconds: number): { value: number; unit: Unit } {
	if (seconds >= 3600 && seconds % 3600 === 0) return { value: seconds / 3600, unit: 'h' }
	return { value: Math.max(1, Math.round(seconds / 60)), unit: 'm' }
}

const initial = fromSeconds(props.modelValue)
const value = ref(initial.value)
const unit = ref<Unit>(initial.unit)
const draft = ref(String(value.value))

const clamp = (n: number) => Math.min(MAX[unit.value], Math.max(1, Math.round(n)))

watch([value, unit], () => {
	draft.value = String(value.value)
	emit('update:modelValue', value.value * UNIT_SECONDS[unit.value])
})

// Minutes move in ones up to 5 and in fives after that
function step(direction: 1 | -1): void {
	const current = value.value
	if (unit.value === 'h') {
		value.value = clamp(current + direction)
	} else if (direction === 1) {
		value.value = clamp(current < 5 ? current + 1 : current + 5 - (current % 5))
	} else {
		value.value = clamp(current <= 5 ? current - 1 : current - (current % 5 || 5))
	}
}

function setUnit(next: Unit): void {
	if (next === unit.value) return
	const seconds = value.value * UNIT_SECONDS[unit.value]
	unit.value = next
	value.value = clamp(seconds / UNIT_SECONDS[next])
}

function onInput(event: Event): void {
	const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 3)
	draft.value = digits
	if (digits) value.value = clamp(Number(digits))
}

function commitDraft(): void {
	draft.value = String(value.value)
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
		event.preventDefault()
		step(event.key === 'ArrowUp' ? 1 : -1)
	} else if (event.key === 'Enter') {
		commitDraft()
		emit('submit')
	}
}

const input = useTemplateRef('input')

defineExpose({
	focus: () => input.value?.select(),
})

const units = computed(() => [
	{ value: 'm' as const, label: t('durationInput.minutes') },
	{ value: 'h' as const, label: t('durationInput.hours') },
])
</script>

<template>
	<div class="flex items-center gap-1.5">
		<div
			class="flex h-8 items-center rounded-md border border-border bg-surface-control transition-colors focus-within:border-pihole-red"
			:class="{ 'opacity-50': disabled }"
		>
			<button
				type="button"
				class="flex h-full w-7 cursor-pointer items-center justify-center text-secondary transition-colors enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
				:disabled="disabled || value <= 1"
				:aria-label="t('durationInput.decrease')"
				@click="step(-1)"
			>
				<Minus class="size-3.5" />
			</button>
			<input
				ref="input"
				:value="draft"
				type="text"
				inputmode="numeric"
				:disabled="disabled"
				:aria-label="t('durationInput.label')"
				class="h-full w-9 bg-transparent text-center text-sm font-semibold text-primary tabular-nums outline-none"
				@input="onInput"
				@blur="commitDraft"
				@keydown="onKeydown"
			/>
			<button
				type="button"
				class="flex h-full w-7 cursor-pointer items-center justify-center text-secondary transition-colors enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
				:disabled="disabled || value >= MAX[unit]"
				:aria-label="t('durationInput.increase')"
				@click="step(1)"
			>
				<Plus class="size-3.5" />
			</button>
		</div>
		<div
			role="radiogroup"
			:aria-label="t('durationInput.unit')"
			class="flex h-8 rounded-md border border-border bg-surface-control p-0.5"
			:class="{ 'opacity-50': disabled }"
		>
			<button
				v-for="option in units"
				:key="option.value"
				type="button"
				role="radio"
				:aria-checked="unit === option.value"
				:disabled="disabled"
				class="cursor-pointer rounded px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed"
				:class="
					unit === option.value
						? 'bg-pihole-red text-white'
						: 'text-secondary enabled:hover:text-primary'
				"
				@click="setUnit(option.value)"
			>
				{{ option.label }}
			</button>
		</div>
	</div>
</template>
