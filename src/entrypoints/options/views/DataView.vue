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
			<OptionButton
				:icon="RotateCcw"
				:label="formatMessage(messages['options.data.reset.label'])"
				:description="formatMessage(messages['options.data.reset.description'])"
				:button-label="formatMessage(messages['options.data.reset.button'])"
				@action="triggerReset"
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

	<Modal v-model="showExportWarning">
		<div class="flex items-start gap-3 mb-5">
			<AlertTriangle class="size-5 shrink-0 text-yellow-500 mt-0.5" />
			<div>
				<h2 class="text-sm font-semibold mb-1.5">
					{{ formatMessage(messages['options.data.export.warning.title']) }}
				</h2>
				<p class="text-xs text-secondary">
					{{ formatMessage(messages['options.data.export.warning.description']) }}
				</p>
			</div>
		</div>
		<div class="flex justify-end gap-2">
			<Button @click="showExportWarning = false">
				{{ formatMessage(messages['options.data.export.warning.cancel']) }}
			</Button>
			<Button variant="danger" @click="confirmExport">
				{{ formatMessage(messages['options.data.export.warning.confirm']) }}
			</Button>
		</div>
	</Modal>

	<Modal v-model="showResetConfirm">
		<div class="flex items-start gap-3 mb-5">
			<AlertTriangle class="size-5 shrink-0 text-yellow-500 mt-0.5" />
			<div>
				<h2 class="text-sm font-semibold mb-1.5">
					{{ formatMessage(messages['options.data.reset.confirm.title']) }}
				</h2>
				<p class="text-xs text-secondary">
					{{ formatMessage(messages['options.data.reset.confirm.description']) }}
				</p>
			</div>
		</div>
		<div class="flex justify-end gap-2">
			<Button @click="showResetConfirm = false">
				{{ formatMessage(messages['options.data.reset.confirm.cancel']) }}
			</Button>
			<Button variant="danger" @click="confirmReset">
				{{ formatMessage(messages['options.data.reset.confirm.confirm']) }}
			</Button>
		</div>
	</Modal>
</template>

<script lang="ts">
import { defineMessages } from '@formatjs/intl'
import {
	Download as DownloadIcon,
	RotateCcw as RotateCcwIcon,
	Upload as UploadIcon,
} from '@lucide/vue'
import { computed } from 'vue'

import { useDataActions } from '../../../composables/useDataActions'
import { useVIntl } from '../../../utils/i18n'

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
	'options.data.reset.label': {
		id: 'options.data.reset.label',
		defaultMessage: 'Reset settings',
	},
	'options.data.reset.description': {
		id: 'options.data.reset.description',
		defaultMessage: 'Restore all settings to their default values.',
	},
	'options.data.reset.button': {
		id: 'options.data.reset.button',
		defaultMessage: 'Reset',
	},
	'options.data.export.warning.title': {
		id: 'options.data.export.warning.title',
		defaultMessage: 'Export settings?',
	},
	'options.data.export.warning.description': {
		id: 'options.data.export.warning.description',
		defaultMessage:
			'The exported file will contain your Pi-hole API passwords in plain text. Keep it secure and avoid sharing it.',
	},
	'options.data.export.warning.cancel': {
		id: 'options.data.export.warning.cancel',
		defaultMessage: 'Cancel',
	},
	'options.data.export.warning.confirm': {
		id: 'options.data.export.warning.confirm',
		defaultMessage: 'Export',
	},
	'options.data.reset.confirm.title': {
		id: 'options.data.reset.confirm.title',
		defaultMessage: 'Reset settings?',
	},
	'options.data.reset.confirm.description': {
		id: 'options.data.reset.confirm.description',
		defaultMessage:
			'This will restore all settings to their defaults and remove all configured Pi-hole instances. This cannot be undone.',
	},
	'options.data.reset.confirm.cancel': {
		id: 'options.data.reset.confirm.cancel',
		defaultMessage: 'Cancel',
	},
	'options.data.reset.confirm.confirm': {
		id: 'options.data.reset.confirm.confirm',
		defaultMessage: 'Reset',
	},
})

export function useDataOptions() {
	const { formatMessage } = useVIntl()
	const { triggerExport, triggerImport, triggerReset } = useDataActions()

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

	const resetOption = computed(() => ({
		id: 'reset',
		type: 'button' as const,
		icon: RotateCcwIcon,
		label: formatMessage(messages['options.data.reset.label']),
		description: formatMessage(messages['options.data.reset.description']),
		buttonLabel: formatMessage(messages['options.data.reset.button']),
		onClick: triggerReset,
	}))

	return { exportOption, importOption, resetOption }
}
</script>

<script setup lang="ts">
import { AlertTriangle, Download, RotateCcw, Upload } from '@lucide/vue'

import Button from '../../../components/Button.vue'
import Modal from '../../../components/Modal.vue'
import OptionButton from '../../../components/options/OptionButton.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import {
	importFeedback,
	showExportWarning,
	showResetConfirm,
} from '../../../composables/useDataActions'
import { useSettings } from '../../../composables/useSettings'

const { initialized } = useSettings()
const { triggerExport, confirmExport, triggerImport, triggerReset, confirmReset } = useDataActions()
const { formatMessage } = useVIntl()
</script>
