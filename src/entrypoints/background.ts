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
		const summaries = await Promise.all(
			settings.instances.map((inst) =>
				getSummary(inst.baseUrl, inst.apiPassword).catch(() => null),
			),
		)
		const valid = summaries.filter((s) => s !== null)
		if (valid.length === 0) return // keep last known badge

		const allEnabled = valid.every((s) => s.blocking.blocking === 'enabled')
		const anyEnabled = valid.some((s) => s.blocking.blocking === 'enabled')

		if (!anyEnabled) {
			await browser.action.setBadgeText({ text: 'OFF' })
			await browser.action.setBadgeBackgroundColor({ color: '#ef4444' })
			return
		}

		// Show combined percent blocked across all responding instances
		const totalQueries = valid.reduce((sum, s) => sum + s.queries.total, 0)
		const totalBlocked = valid.reduce((sum, s) => sum + s.queries.blocked, 0)
		const pct = totalQueries > 0 ? Math.round((totalBlocked / totalQueries) * 100) : 0
		const text = `${pct}%`

		await browser.action.setBadgeText({ text })
		await browser.action.setBadgeBackgroundColor({
			color: allEnabled ? '#22c55e' : '#f97316', // green = all on, orange = mixed
		})
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
