import { onMounted, reactive, ref, watch } from 'vue'

import { applyColorScheme } from '../utils/color-scheme'
import { applyLocale, detectBrowserLocale, i18n } from '../utils/i18n'
import { DEFAULTS, type ExtensionSettings, getSettings, saveSettings } from '../utils/settings'

// Module-level singleton so all views share the same state
const form = reactive<ExtensionSettings>({
	...DEFAULTS,
	instances: [],
	badgeMode: DEFAULTS.badgeMode,
})
const saveError = ref('')
const initialized = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | null = null

async function persist(): Promise<void> {
	try {
		await saveSettings(JSON.parse(JSON.stringify(form)))
		saveError.value = ''
	} catch (e) {
		saveError.value = e instanceof Error ? e.message : i18n.global.t('options.saveFailed')
	}
}

async function flushSave(): Promise<void> {
	if (!initialized.value || !saveTimer) return
	clearTimeout(saveTimer)
	saveTimer = null
	await persist()
}

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'hidden') void flushSave()
})

watch(
	form,
	() => {
		if (!initialized.value) return
		if (saveTimer) clearTimeout(saveTimer)
		saveTimer = setTimeout(() => {
			saveTimer = null
			void persist()
		}, 600)
	},
	{ deep: true },
)

watch(
	() => form.locale,
	(locale) => {
		if (!initialized.value) return
		applyLocale(locale)
	},
)

watch(
	() => form.colorScheme,
	(scheme) => {
		if (!initialized.value) return
		applyColorScheme(scheme)
	},
)

export function useSettings() {
	onMounted(async () => {
		if (initialized.value) return
		const settings = await getSettings()
		Object.assign(form, settings, {
			instances: settings.instances.map((inst) => ({ ...inst })),
			locale: settings.locale || detectBrowserLocale(),
		})
		applyColorScheme(form.colorScheme)
		applyLocale(form.locale)
		initialized.value = true
	})

	return { form, saveError, initialized }
}
