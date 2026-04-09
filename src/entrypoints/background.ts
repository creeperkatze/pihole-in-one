import { browser } from 'wxt/browser'

import { getSummary } from '../helpers/api'
import { getSettings } from '../helpers/settings'

const ALARM = 'pihole-refresh'

async function updateBadge(): Promise<void> {
	const settings = await getSettings()
	if (!settings.baseUrl) {
		await browser.action.setBadgeText({ text: '' })
		return
	}
	try {
		const summary = await getSummary(settings.baseUrl, settings.apiPassword)
		if (summary.blocking.blocking === 'enabled') {
			await browser.action.setBadgeText({ text: 'ON' })
			await browser.action.setBadgeBackgroundColor({ color: '#00ff00' })
		} else {
			await browser.action.setBadgeText({ text: 'OFF' })
			await browser.action.setBadgeBackgroundColor({ color: '#ff0000' })
		}
	} catch {
		// Keep last known badge state on error rather than clearing it
	}
}

export default defineBackground(() => {
	void updateBadge()

	// Chrome MV3 minimum alarm interval is 1 minute
	browser.alarms.create(ALARM, { periodInMinutes: 1 })
	browser.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === ALARM) void updateBadge()
	})

	// Re-check immediately when settings change
	browser.storage.onChanged.addListener((changes, area) => {
		if (area === 'local' && 'settings' in changes) void updateBadge()
	})

	// Allow popup to trigger a refresh
	browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (message?.type === 'refresh') {
			void updateBadge().then(() => sendResponse({ ok: true }))
			return true
		}
	})
})
