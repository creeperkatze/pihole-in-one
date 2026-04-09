import { browser } from 'wxt/browser'

import { getSummary } from '../helpers/api'
import { getSettings } from '../helpers/settings'

const ALARM = 'pihole-refresh'

async function updateBadge(): Promise<void> {
	const settings = await getSettings()
	if (!settings.showBadge || settings.instances.length === 0) {
		await browser.action.setBadgeText({ text: '' })
		return
	}
	try {
		const statuses = await Promise.all(
			settings.instances.map((inst) =>
				getSummary(inst.baseUrl, inst.apiPassword)
					.then((s) => s.blocking.blocking)
					.catch(() => null),
			),
		)
		const valid = statuses.filter((s) => s !== null)
		if (valid.length === 0) return // keep last known badge

		const allEnabled = valid.every((s) => s === 'enabled')
		const anyEnabled = valid.some((s) => s === 'enabled')

		if (allEnabled) {
			await browser.action.setBadgeText({ text: 'ON' })
			await browser.action.setBadgeBackgroundColor({ color: '#00ff00' })
		} else if (!anyEnabled) {
			await browser.action.setBadgeText({ text: 'OFF' })
			await browser.action.setBadgeBackgroundColor({ color: '#ff0000' })
		} else {
			// Mixed: some on, some off
			const onCount = valid.filter((s) => s === 'enabled').length
			await browser.action.setBadgeText({ text: `${onCount}/${valid.length}` })
			await browser.action.setBadgeBackgroundColor({ color: '#ff8800' })
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
