import { defineMessages } from '@formatjs/intl'
import { ref } from 'vue'

import { useVIntl } from '../helpers/i18n'
import { DEFAULTS, parseSettingsExport } from '../helpers/settings'
import { useSettings } from './useSettings'

const messages = defineMessages({
	'options.data.import.success': {
		id: 'options.data.import.success',
		defaultMessage: 'Settings imported successfully.',
	},
	'options.data.import.error.invalid': {
		id: 'options.data.import.error.invalid',
		defaultMessage: 'Invalid settings file.',
	},
	'options.data.import.error.read': {
		id: 'options.data.import.error.read',
		defaultMessage: 'Failed to read the file.',
	},
})

export const showExportWarning = ref(false)
export const showResetConfirm = ref(false)
export const importFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

export function useDataActions() {
	const { form } = useSettings()
	const { formatMessage } = useVIntl()

	function triggerExport() {
		showExportWarning.value = true
	}

	function confirmExport() {
		showExportWarning.value = false
		const data = JSON.stringify(form, null, 2)
		const blob = new Blob([data], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		const ts = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')
		a.download = `pihole-in-one-settings_${ts}.json`
		a.click()
		URL.revokeObjectURL(url)
	}

	function triggerImport() {
		importFeedback.value = null
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.json,application/json'
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (!file) return
			let text: string
			try {
				text = await file.text()
			} catch {
				importFeedback.value = {
					type: 'error',
					message: formatMessage(messages['options.data.import.error.read']),
				}
				return
			}
			try {
				const imported = parseSettingsExport(text)
				Object.assign(form, imported)
				importFeedback.value = {
					type: 'success',
					message: formatMessage(messages['options.data.import.success']),
				}
			} catch {
				importFeedback.value = {
					type: 'error',
					message: formatMessage(messages['options.data.import.error.invalid']),
				}
			}
		}
		input.click()
	}

	function triggerReset() {
		showResetConfirm.value = true
	}

	function confirmReset() {
		showResetConfirm.value = false
		importFeedback.value = null
		Object.assign(form, { ...DEFAULTS, instances: [] })
	}

	return { triggerExport, confirmExport, triggerImport, triggerReset, confirmReset }
}
