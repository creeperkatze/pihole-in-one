import { browser } from 'wxt/browser'

export interface PiholeInstance {
	id: string
	name: string
	baseUrl: string
	apiPassword: string
}

export type BadgeMode = 'off' | 'state' | 'percentage' | 'clients'

export interface ExtensionSettings {
	instances: PiholeInstance[]
	refreshInterval: number
	badgeMode: BadgeMode
}

export const DEFAULTS: ExtensionSettings = {
	instances: [],
	refreshInterval: 60,
	badgeMode: 'percentage',
}

export function generateInstanceId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export async function getSettings(): Promise<ExtensionSettings> {
	const result = await browser.storage.local.get('settings')
	if (!result.settings) return { ...DEFAULTS }
	const raw = result.settings as Record<string, unknown>

	// Migrate from v1 format (single baseUrl/apiPassword)
	if ('baseUrl' in raw) {
		return {
			instances:
				raw.baseUrl && typeof raw.baseUrl === 'string'
					? [
							{
								id: 'default',
								name: 'Pi-hole',
								baseUrl: raw.baseUrl,
								apiPassword: typeof raw.apiPassword === 'string' ? raw.apiPassword : '',
							},
						]
					: [],
			refreshInterval:
				typeof raw.refreshInterval === 'number' ? raw.refreshInterval : DEFAULTS.refreshInterval,
			badgeMode:
				typeof raw.showBadge === 'boolean'
					? raw.showBadge
						? 'percentage'
						: 'off'
					: DEFAULTS.badgeMode,
		}
	}

	return { ...DEFAULTS, ...(raw as Partial<ExtensionSettings>) }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
	await browser.storage.local.set({ settings })
}

export function isConfigured(settings: ExtensionSettings): boolean {
	return settings.instances.length > 0 && Boolean(settings.instances[0].baseUrl)
}
