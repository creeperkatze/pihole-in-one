<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import Toggle from '../../../components/ui/Toggle.vue'

defineProps<{
	enabled: boolean
	sub?: string
	busy?: boolean
}>()

defineEmits<{
	toggle: []
	disableFor: [seconds: number]
}>()

const { t } = useI18n()

const presets = [
	{ label: '10s', seconds: 10 },
	{ label: '30s', seconds: 30 },
	{ label: '5m', seconds: 5 * 60 },
	{ label: '30m', seconds: 30 * 60 },
	{ label: '1h', seconds: 60 * 60 },
]
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

		<div v-if="enabled" class="flex items-center gap-3 border-t border-border px-3 py-2">
			<span class="shrink-0 text-xs text-secondary">{{ t('popup.disableFor') }}</span>
			<div class="grid flex-1 grid-cols-5 gap-1.5">
				<Button
					v-for="preset in presets"
					:key="preset.seconds"
					size="sm"
					:disabled="busy"
					@click="$emit('disableFor', preset.seconds)"
				>
					{{ preset.label }}
				</Button>
			</div>
		</div>
	</section>
</template>
