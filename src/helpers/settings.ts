import { browser } from 'wxt/browser'

export interface PiholeSettings {
	baseUrl: string
	apiPassword: string
	refreshInterval: number
}

export const DEFAULTS: PiholeSettings = {
	baseUrl: 'https://pi.hole',
	apiPassword: '',
	refreshInterval: 60,
}

export async function getSettings(): Promise<PiholeSettings> {
	const result = await browser.storage.local.get('settings')
	if (!result.settings) return { ...DEFAULTS }
	return { ...DEFAULTS, ...(result.settings as Partial<PiholeSettings>) }
}

export async function saveSettings(settings: PiholeSettings): Promise<void> {
	await browser.storage.local.set({ settings })
}

export function isConfigured(settings: PiholeSettings): boolean {
	return Boolean(settings.baseUrl)
}
