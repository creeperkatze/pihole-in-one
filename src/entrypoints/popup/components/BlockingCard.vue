<script setup lang="ts">
import { Timer } from '@lucide/vue'
import { storage } from '@wxt-dev/storage'
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import DurationInput from '../../../components/ui/DurationInput.vue'
import Popover from '../../../components/ui/Popover.vue'
import Toggle from '../../../components/ui/Toggle.vue'
import { PAUSE_PRESETS } from '../../../utils/actions'
import { formatDuration } from '../../../utils/format'

const props = defineProps<{
	enabled: boolean
	sub?: string
	busy?: boolean
	pauseEndsAt?: number | null
}>()

const emit = defineEmits<{
	toggle: []
	disableFor: [seconds: number]
}>()

const { t, locale } = useI18n()

const presets = PAUSE_PRESETS.map((seconds) => ({ label: formatDuration(seconds), seconds }))
const extendPresets = PAUSE_PRESETS.map((seconds) => ({
	label: `+${formatDuration(seconds)}`,
	seconds,
}))

// Pi-hole replaces the timer, so the new pause is what is left plus the extra time
function extend(seconds: number): void {
	if (!props.pauseEndsAt) return
	const remaining = Math.max(0, Math.round((props.pauseEndsAt - Date.now()) / 1000))
	emit('disableFor', remaining + seconds)
}

const customPauseItem = storage.defineItem<number>('local:customPauseSeconds', {
	fallback: 15 * 60,
})

const customOpen = ref(false)
const customSeconds = ref<number | null>(null)
const now = ref(Date.now())

onMounted(async () => {
	customSeconds.value = await customPauseItem.getValue()
})

const durationInput = useTemplateRef('durationInput')

async function openCustom(): Promise<void> {
	now.value = Date.now()
	customOpen.value = true
	await nextTick()
	durationInput.value?.focus()
}

const backOnAt = computed(() =>
	new Date(now.value + (customSeconds.value ?? 0) * 1000).toLocaleTimeString(locale.value, {
		hour: '2-digit',
		minute: '2-digit',
	}),
)

function updateCustom(seconds: number): void {
	now.value = Date.now()
	customSeconds.value = seconds
}

function submitCustom(): void {
	if (!customSeconds.value) return
	customOpen.value = false
	void customPauseItem.setValue(customSeconds.value)
	emit('disableFor', customSeconds.value)
}
</script>

<template>
	<section class="rounded-lg border border-border bg-surface-3">
		<div class="flex items-center gap-3 px-3 py-2.5">
			<span
				class="size-2.5 shrink-0 rounded-full ring-[3px]"
				:class="
					enabled ? 'bg-pihole-green ring-pihole-green/25' : 'bg-pihole-red ring-pihole-red/25'
				"
			/>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold">
					{{ enabled ? t('popup.status.blockingEnabled') : t('popup.status.blockingDisabled') }}
				</p>
				<p v-if="sub" class="truncate text-xs text-secondary">{{ sub }}</p>
			</div>
			<Toggle
				:model-value="enabled"
				:disabled="busy"
				:title="enabled ? t('popup.status.disable') : t('popup.status.enable')"
				:aria-label="enabled ? t('popup.status.disable') : t('popup.status.enable')"
				@update:model-value="$emit('toggle')"
			/>
		</div>

		<div v-if="enabled" class="flex flex-col gap-1.5 border-t border-border px-3 py-2">
			<span class="text-xs text-secondary">{{ t('popup.disableFor') }}</span>
			<div class="grid grid-cols-6 gap-1.5">
				<Button
					v-for="preset in presets"
					:key="preset.seconds"
					size="sm"
					:disabled="busy"
					@click="$emit('disableFor', preset.seconds)"
				>
					{{ preset.label }}
				</Button>
				<Popover v-model:open="customOpen" align="end">
					<template #trigger>
						<Button
							size="sm"
							class="w-full"
							:active="customOpen"
							:disabled="busy || customSeconds === null"
							:title="t('popup.customPause.title')"
							:aria-label="t('popup.customPause.title')"
							aria-haspopup="dialog"
							:aria-expanded="customOpen"
							@click="openCustom"
						>
							<Timer class="size-4" />
						</Button>
					</template>
					<div class="flex flex-col gap-2.5">
						<p class="text-sm font-semibold">{{ t('popup.customPause.title') }}</p>
						<div class="flex items-center gap-2">
							<DurationInput
								ref="durationInput"
								:model-value="customSeconds ?? 0"
								:disabled="busy"
								@update:model-value="updateCustom"
								@submit="submitCustom"
							/>
							<Button size="sm" variant="primary" :disabled="busy" @click="submitCustom">
								{{ t('popup.status.disable') }}
							</Button>
						</div>
						<p class="text-xs text-secondary">
							{{ t('popup.customPause.backOnAt', { time: backOnAt }) }}
						</p>
					</div>
				</Popover>
			</div>
		</div>

		<div v-else-if="pauseEndsAt" class="flex flex-col gap-1.5 border-t border-border px-3 py-2">
			<span class="text-xs text-secondary">{{ t('popup.extendBy') }}</span>
			<div class="grid grid-cols-5 gap-1.5">
				<Button
					v-for="preset in extendPresets"
					:key="preset.seconds"
					size="sm"
					:disabled="busy"
					@click="extend(preset.seconds)"
				>
					{{ preset.label }}
				</Button>
			</div>
		</div>
	</section>
</template>
