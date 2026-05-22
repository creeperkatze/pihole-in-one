<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="formatMessage(messages['options.data.title'])"
			:description="formatMessage(messages['options.data.description'])"
		/>
		<div v-if="initialized" class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionButton
				:icon="Download"
				:label="formatMessage(messages['options.data.export.label'])"
				:description="formatMessage(messages['options.data.export.description'])"
				:button-label="formatMessage(messages['options.data.export.button'])"
				@action="triggerExport"
			/>
			<OptionButton
				:icon="Upload"
				:label="formatMessage(messages['options.data.import.label'])"
				:description="formatMessage(messages['options.data.import.description'])"
				:button-label="formatMessage(messages['options.data.import.button'])"
				@action="triggerImport"
			/>
			<div
				v-if="importFeedback"
				:class="[
					'mt-1 px-3.5 py-2.5 rounded-lg text-[13px] border',
					importFeedback.type === 'success'
						? 'bg-success-bg border-success-border text-pihole-green'
						: 'bg-danger-bg border-danger-border text-pihole-red',
				]"
			>
				{{ importFeedback.message }}
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import { defineMessages } from '@formatjs/intl'
import { Download as DownloadIcon, Upload as UploadIcon } from '@lucide/vue'
import { computed } from 'vue'

import { useDataActions } from '../../../composables/useDataActions'
import { useVIntl } from '../../../helpers/i18n'

export const messages = defineMessages({
	'options.data.title': { id: 'options.data.title', defaultMessage: 'Data' },
	'options.data.description': {
		id: 'options.data.description',
		defaultMessage: 'Export and import your extension settings.',
	},
	'options.data.export.label': {
		id: 'options.data.export.label',
		defaultMessage: 'Export settings',
	},
	'options.data.export.description': {
		id: 'options.data.export.description',
		defaultMessage: 'Download your current settings as a JSON file.',
	},
	'options.data.export.button': {
		id: 'options.data.export.button',
		defaultMessage: 'Export',
	},
	'options.data.import.label': {
		id: 'options.data.import.label',
		defaultMessage: 'Import settings',
	},
	'options.data.import.description': {
		id: 'options.data.import.description',
		defaultMessage: 'Restore settings from a previously exported JSON file.',
	},
	'options.data.import.button': {
		id: 'options.data.import.button',
		defaultMessage: 'Import',
	},
})

export function useDataOptions() {
	const { formatMessage } = useVIntl()
	const { triggerExport, triggerImport } = useDataActions()

	const exportOption = computed(() => ({
		id: 'export',
		type: 'button' as const,
		icon: DownloadIcon,
		label: formatMessage(messages['options.data.export.label']),
		description: formatMessage(messages['options.data.export.description']),
		buttonLabel: formatMessage(messages['options.data.export.button']),
		onClick: triggerExport,
	}))

	const importOption = computed(() => ({
		id: 'import',
		type: 'button' as const,
		icon: UploadIcon,
		label: formatMessage(messages['options.data.import.label']),
		description: formatMessage(messages['options.data.import.description']),
		buttonLabel: formatMessage(messages['options.data.import.button']),
		onClick: triggerImport,
	}))

	return { exportOption, importOption }
}
</script>

<script setup lang="ts">
import { Download, Upload } from '@lucide/vue'

import OptionButton from '../../../components/options/OptionButton.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { importFeedback } from '../../../composables/useDataActions'
import { useSettings } from '../../../composables/useSettings'

const { initialized } = useSettings()
const { triggerExport, triggerImport } = useDataActions()
const { formatMessage } = useVIntl()
</script>
