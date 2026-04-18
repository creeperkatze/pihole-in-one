<template>
	<div class="flex flex-col gap-2">
		<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
			{{ formatMessage(messages['popup.disableFor']) }}
		</div>
		<div class="flex gap-1.5 flex-wrap">
			<Button
				v-for="preset in presets"
				:key="preset.label"
				variant="outline"
				:disabled="disabled"
				@click="$emit('select', preset.seconds)"
			>
				{{ preset.label }}
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'

import Button from '../../../components/Button.vue'
import { useVIntl } from '../../../helpers/i18n'

defineProps<{
	disabled?: boolean
}>()

defineEmits<{
	select: [seconds: number]
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.disableFor': { id: 'popup.disableFor', defaultMessage: 'Disable for' },
})

const presets = [
	{ label: '10s', seconds: 10 },
	{ label: '30s', seconds: 30 },
	{ label: '5m', seconds: 5 * 60 },
	{ label: '30m', seconds: 30 * 60 },
	{ label: '1h', seconds: 60 * 60 },
]
</script>
