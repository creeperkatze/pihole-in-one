import { browser } from 'wxt/browser'

import { getSummary } from '../helpers/api'
import { getSettings } from '../helpers/settings'

const ALARM = 'pihole-refresh'

async function updateBadge(): Promise<void> {
	const action = browser.action ?? browser.browserAction
	const settings = await getSettings()
	if (settings.badgeMode === 'off' || settings.instances.length === 0) {
		await action.setBadgeText({ text: '' })
		return
	}
	try {
		const summaries = await Promise.all(
			settings.instances.map((inst) =>
				getSummary(inst.baseUrl, inst.apiPassword).catch(() => null),
			),
		)
		const valid = summaries.filter((s) => s !== null)
		if (valid.length === 0) return // Keep last known badge

		const allEnabled = valid.every((s) => s.blocking.blocking === 'enabled')
		const anyEnabled = valid.some((s) => s.blocking.blocking === 'enabled')

		if (!anyEnabled) {
			await action.setBadgeText({ text: 'OFF' })
			await action.setBadgeBackgroundColor({ color: '#ef4444' })
			return
		}

		const color = allEnabled ? '#22c55e' : '#f97316' // green = all on, orange = mixed
		let text: string

		if (settings.badgeMode === 'state') {
			text = 'ON'
		} else if (settings.badgeMode === 'clients') {
			const totalClients = valid.reduce((sum, s) => sum + s.clients.active, 0)
			text = String(totalClients)
		} else {
			const totalQueries = valid.reduce((sum, s) => sum + s.queries.total, 0)
			const totalBlocked = valid.reduce((sum, s) => sum + s.queries.blocked, 0)
			const pct = totalQueries > 0 ? Math.round((totalBlocked / totalQueries) * 100) : 0
			text = `${pct}%`
		}

		await action.setBadgeText({ text })
		await action.setBadgeBackgroundColor({ color })
	} catch {
		// Keep last known badge state on error rather than clearing it
	}
}

async function scheduleAlarm(): Promise<void> {
	const settings = await getSettings()

	// Chrome MV3 minimum alarm interval is 1 minute
	const periodInMinutes = Math.max(1, settings.refreshInterval / 60)
	browser.alarms.create(ALARM, { periodInMinutes })
}

export default defineBackground(() => {
	void updateBadge()

	void scheduleAlarm()
	browser.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === ALARM) void updateBadge()
	})

	// Re-check immediately when settings change
	browser.storage.onChanged.addListener((changes, area) => {
		if (area === 'local' && 'settings' in changes) {
			void updateBadge()
			const prev = changes.settings.oldValue as { refreshInterval?: number } | undefined
			const next = changes.settings.newValue as { refreshInterval?: number } | undefined
			if (prev?.refreshInterval !== next?.refreshInterval) {
				void browser.alarms.clear(ALARM).then(() => scheduleAlarm())
			}
		}
	})

	// Allow popup to trigger a refresh
	browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (message?.type === 'refresh') {
			void updateBadge().then(() => sendResponse({ ok: true }))
			return true
		}
	})

	browser.runtime.onStartup.addListener(() => void updateBadge())
})
