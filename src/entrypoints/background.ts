import { browser } from 'wxt/browser'

import { COUNTDOWN_ALARM, updateBadge } from '../utils/badge'
import { buildContextMenu, contextMenuKey, handleContextMenuClick } from '../utils/context-menu'
import { DEFAULTS, getSettings, watchSettings } from '../utils/settings'
import { isUpdateFromBeforeRedesign, redesignNoticeItem } from '../utils/whats-new'

const ALARM = 'pihole-refresh'

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
		if (alarm.name === ALARM || alarm.name === COUNTDOWN_ALARM) void updateBadge()
	})

	// Rebuilt on every start so the items always match the current settings
	void getSettings().then(buildContextMenu)
	browser.contextMenus.onClicked.addListener((info, tab) => {
		void handleContextMenuClick(info, tab).then(() => updateBadge())
	})

	// Re-check immediately when settings change
	watchSettings((next, prev) => {
		void updateBadge()
		if (prev?.refreshInterval !== next.refreshInterval) {
			void browser.alarms.clear(ALARM).then(() => scheduleAlarm())
		}
		const nextWithDefaults = { ...DEFAULTS, ...next }
		if (!prev || contextMenuKey({ ...DEFAULTS, ...prev }) !== contextMenuKey(nextWithDefaults)) {
			void buildContextMenu(nextWithDefaults)
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

	browser.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
		if (reason === 'update' && previousVersion && isUpdateFromBeforeRedesign(previousVersion)) {
			void redesignNoticeItem.setValue(true)
		}
	})
})
