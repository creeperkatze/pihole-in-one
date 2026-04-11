import { onMounted, reactive, ref, watch } from 'vue'

import { applyColorScheme } from '../helpers/colorScheme'
import { detectBrowserLocale, i18n } from '../helpers/i18n'
import { DEFAULTS, type ExtensionSettings, getSettings, saveSettings } from '../helpers/settings'
import { setTelemetryEnabled } from '../helpers/telemetry'

// Module-level singleton so all views share the same state
const form = reactive<ExtensionSettings>({
	...DEFAULTS,
	instances: [],
	badgeMode: DEFAULTS.badgeMode,
	telemetry: true,
})
const saveError = ref('')
const initialized = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | null = null

watch(
	form,
	() => {
		if (!initialized.value) return
		if (saveTimer) clearTimeout(saveTimer)
		saveTimer = setTimeout(async () => {
			try {
				await saveSettings(JSON.parse(JSON.stringify(form)))
				saveError.value = ''
			} catch (e) {
				saveError.value = e instanceof Error ? e.message : 'Failed to save settings.'
			}
		}, 600)
	},
	{ deep: true },
)

watch(
	() => form.locale,
	(locale) => {
		if (!initialized.value) return
		i18n.global.locale.value = locale || detectBrowserLocale()
	},
)

watch(
	() => form.colorScheme,
	(scheme) => {
		if (!initialized.value) return
		applyColorScheme(scheme)
	},
)

watch(
	() => form.telemetry,
	(value) => {
		if (!initialized.value) return
		setTelemetryEnabled(value)
	},
)

function setOption(key: 'badgeMode' | 'refreshInterval', value: string | number): void {
	;(form as Record<string, unknown>)[key] = value
}

export function useSettings() {
	onMounted(async () => {
		if (initialized.value) return
		const settings = await getSettings()
		form.instances = settings.instances.map((inst) => ({ ...inst }))
		form.refreshInterval = settings.refreshInterval
		form.badgeMode = settings.badgeMode
		form.colorScheme = settings.colorScheme
		form.locale = settings.locale || detectBrowserLocale()
		form.telemetry = settings.telemetry
		applyColorScheme(settings.colorScheme)
		i18n.global.locale.value = form.locale
		initialized.value = true
	})

	return { form, saveError, setOption, initialized }
}
