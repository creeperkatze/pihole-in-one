<template>
	<div
		class="flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border transition-colors duration-200"
		:class="
			status === 'enabled'
				? 'border-success-border bg-success-bg'
				: 'border-danger-border bg-danger-bg'
		"
	>
		<div class="flex items-center gap-2.5">
			<span
				class="w-2.5 h-2.5 rounded-full shrink-0"
				:class="
					status === 'enabled'
						? 'bg-pihole-green ring-[3px] ring-pihole-green/25'
						: 'bg-pihole-red ring-[3px] ring-pihole-red/25'
				"
			></span>
			<div>
				<div class="font-semibold text-sm">
					{{
						status === 'enabled'
							? formatMessage(messages['popup.status.blockingEnabled'])
							: formatMessage(messages['popup.status.blockingDisabled'])
					}}
				</div>
				<div class="text-xs text-secondary mt-px">{{ sub }}</div>
			</div>
		</div>
		<Button :disabled="disabled" @click="$emit('toggle')">
			{{
				status === 'enabled'
					? formatMessage(messages['popup.status.disable'])
					: formatMessage(messages['popup.status.enable'])
			}}
		</Button>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'

import Button from '../../../components/Button.vue'
import { useVIntl } from '../../../helpers/i18n'

defineProps<{
	status: 'enabled' | 'disabled'
	sub?: string
	disabled?: boolean
}>()

defineEmits<{ toggle: [] }>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.status.blockingEnabled': {
		id: 'popup.status.blockingEnabled',
		defaultMessage: 'Blocking Enabled',
	},
	'popup.status.blockingDisabled': {
		id: 'popup.status.blockingDisabled',
		defaultMessage: 'Blocking Disabled',
	},
	'popup.status.disable': { id: 'popup.status.disable', defaultMessage: 'Disable' },
	'popup.status.enable': { id: 'popup.status.enable', defaultMessage: 'Enable' },
})
</script>
