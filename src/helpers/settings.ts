import { browser } from 'wxt/browser'

export interface PiholeInstance {
	id: string
	name: string
	baseUrl: string
	apiPassword: string
}

export type BadgeMode = 'off' | 'state' | 'percentage' | 'clients'
export type ColorScheme = 'auto' | 'dark' | 'light'

export interface ExtensionSettings {
	instances: PiholeInstance[]
	refreshInterval: number
	badgeMode: BadgeMode
	colorScheme: ColorScheme
	locale: string
	telemetry: boolean
}

export const DEFAULTS: ExtensionSettings = {
	instances: [],
	refreshInterval: 60,
	badgeMode: 'percentage',
	colorScheme: 'auto',
	locale: '',
	telemetry: true,
}

export function generateInstanceId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export async function getSettings(): Promise<ExtensionSettings> {
	const result = await browser.storage.local.get('settings')
	if (!result.settings) return { ...DEFAULTS }
	return { ...DEFAULTS, ...(result.settings as Partial<ExtensionSettings>) }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
	await browser.storage.local.set({ settings })
}

export function isConfigured(settings: ExtensionSettings): boolean {
	return settings.instances.length > 0 && Boolean(settings.instances[0].baseUrl)
}
