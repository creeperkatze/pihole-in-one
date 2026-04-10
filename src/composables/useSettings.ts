import { onMounted, reactive, ref, watch } from 'vue'

import { DEFAULTS, type ExtensionSettings, getSettings, saveSettings } from '../helpers/settings'

// Module-level singleton so all views share the same state
const form = reactive<ExtensionSettings>({
	...DEFAULTS,
	instances: [],
	badgeMode: DEFAULTS.badgeMode,
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
				await saveSettings({ ...form, instances: [...form.instances] })
				saveError.value = ''
			} catch (e) {
				saveError.value = e instanceof Error ? e.message : 'Failed to save settings.'
			}
		}, 600)
	},
	{ deep: true },
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
		initialized.value = true
	})

	return { form, saveError, setOption }
}
