<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.diagnostics.title'])"
			:description="formatMessage(messages['options.diagnostics.description'])"
		/>
		<div v-if="initialized && firefoxCheckDone" class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionToggle
				:icon="telemetry.icon"
				:label="telemetry.label"
				:description="telemetry.description"
				:model-value="firefoxControlsTelemetry ? false : form.telemetry"
				:disabled="firefoxControlsTelemetry"
				:disabled-tooltip="
					firefoxControlsTelemetry
						? formatMessage(messages['options.telemetry.disabledTooltip'])
						: undefined
				"
				@update:model-value="form.telemetry = $event"
			/>
		</div>
	</section>
</template>

<script lang="ts">
import { defineMessages } from '@formatjs/intl'
import { ChartColumn } from '@lucide/vue'
import { computed } from 'vue'

import { useVIntl } from '../../../helpers/i18n'

export const messages = defineMessages({
	'options.diagnostics.title': {
		id: 'options.diagnostics.title',
		defaultMessage: 'Diagnostics',
	},
	'options.diagnostics.description': {
		id: 'options.diagnostics.description',
		defaultMessage: 'Help improve the extension by sharing anonymous usage data.',
	},
	'options.telemetry.label': { id: 'options.telemetry.label', defaultMessage: 'Telemetry' },
	'options.telemetry.description': {
		id: 'options.telemetry.description',
		defaultMessage:
			'Help improve the extension by anonymously sharing statistics like the extension version and which features are used. No Pi-hole data, activity, or personal information is ever collected.',
	},
	'options.telemetry.disabledTooltip': {
		id: 'options.telemetry.disabledTooltip',
		defaultMessage: 'Controlled by Firefox data collection settings',
	},
})

export function useDiagnosticsOptions() {
	const { formatMessage } = useVIntl()

	const telemetry = computed(() => ({
		id: 'telemetry',
		type: 'toggle' as const,
		formKey: 'telemetry' as const,
		icon: ChartColumn,
		label: formatMessage(messages['options.telemetry.label']),
		description: formatMessage(messages['options.telemetry.description']),
	}))

	return { telemetry }
}
</script>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { browser } from 'wxt/browser'

import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'

const { form, initialized } = useSettings()
const { telemetry } = useDiagnosticsOptions()
const { formatMessage } = useVIntl()

const firefoxControlsTelemetry = ref(false)
const firefoxCheckDone = ref(false)

onMounted(async () => {
	const perms = await browser.permissions.getAll()
	if ('data_collection' in perms) {
		const granted = (perms as unknown as { data_collection: string[] }).data_collection
		firefoxControlsTelemetry.value = !granted.includes('technicalAndInteraction')
	}
	firefoxCheckDone.value = true
})
</script>
