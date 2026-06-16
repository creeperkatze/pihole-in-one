import { storage } from '@wxt-dev/storage'

export interface PiholeInstance {
	id: string
	name: string
	baseUrl: string
	apiPassword: string
}

export type BadgeMode = 'off' | 'state' | 'percentage' | 'clients'
export type ColorScheme = 'auto' | 'dark' | 'light'
export type PopupStats = 'none' | 'graphs' | 'all'

export type SettingsKeyOfType<V> = {
	[K in keyof ExtensionSettings]: ExtensionSettings[K] extends V ? K : never
}[keyof ExtensionSettings]

export interface ExtensionSettings {
	instances: PiholeInstance[]
	refreshInterval: number
	connectionTimeout: number
	badgeMode: BadgeMode
	colorScheme: ColorScheme
	locale: string
	popupStats: PopupStats
	popupGroups: boolean
	popupLists: boolean
	popupStatus: boolean
}

export const DEFAULTS: ExtensionSettings = {
	instances: [],
	refreshInterval: 60,
	connectionTimeout: 10,
	badgeMode: 'percentage',
	colorScheme: 'auto',
	locale: '',
	popupStats: 'graphs',
	popupGroups: false,
	popupLists: false,
	popupStatus: false,
}

const settingsItem = storage.defineItem<ExtensionSettings>('local:settings', {
	fallback: DEFAULTS,
})

export function generateInstanceId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export async function getSettings(): Promise<ExtensionSettings> {
	const settings = await settingsItem.getValue()
	return { ...DEFAULTS, ...settings }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
	await settingsItem.setValue(settings)
}

export function watchSettings(
	callback: (newValue: ExtensionSettings, oldValue: ExtensionSettings | null) => void,
): () => void {
	return settingsItem.watch(callback)
}

export function isConfigured(settings: ExtensionSettings): boolean {
	return settings.instances.length > 0 && Boolean(settings.instances[0].baseUrl)
}

export function parseSettingsExport(json: string): ExtensionSettings {
	const data = JSON.parse(json) as unknown
	if (
		typeof data !== 'object' ||
		data === null ||
		!(Object.keys(DEFAULTS) as (keyof ExtensionSettings)[]).some((k) => k in (data as object))
	) {
		throw new Error('Invalid settings file')
	}
	const parsed = data as Partial<ExtensionSettings>
	return {
		...DEFAULTS,
		...parsed,
		instances: Array.isArray(parsed.instances)
			? parsed.instances.map((inst) => ({ ...inst }))
			: DEFAULTS.instances,
	}
}
