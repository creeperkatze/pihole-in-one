import { browser } from 'wxt/browser'

import { getPiHoleClient, type PiholeSummary } from './api'
import { countdownStep, formatCompact, formatCountdown } from './format'
import { i18n, resolveLocale } from './i18n'
import { type BadgeMode, getSettings } from './settings'

export const COUNTDOWN_ALARM = 'pihole-countdown'

const COLORS = {
	on: '#22c55e',
	mixed: '#f97316',
	off: '#ef4444',
	// Tailwind's yellow-500, like the diagnosis badge in the popup
	unreachable: '#f0b100',
}

let pauseEndsAt: number | null = null
let countdownTimeout: ReturnType<typeof setTimeout> | undefined

async function setBadge(text: string, color?: string): Promise<void> {
	const action = browser.action ?? browser.browserAction
	await action.setBadgeText({ text })
	if (color) await action.setBadgeBackgroundColor({ color })
}

function stopCountdown(): void {
	pauseEndsAt = null
	clearTimeout(countdownTimeout)
	void browser.alarms.clear(COUNTDOWN_ALARM)
}

async function renderCountdown(): Promise<void> {
	clearTimeout(countdownTimeout)
	if (pauseEndsAt === null) return
	const remaining = Math.ceil((pauseEndsAt - Date.now()) / 1000)
	if (remaining <= 0) {
		stopCountdown()
		// Gives the Pi-hole a moment to switch blocking back on
		countdownTimeout = setTimeout(() => void updateBadge(), 2000)
		return
	}
	await setBadge(formatCountdown(remaining), COLORS.off)
	const delayMs = countdownStep(remaining) * 1000
	countdownTimeout = setTimeout(() => void renderCountdown(), delayMs)
	// The worker can be stopped during a long wait, so an alarm wakes it up again
	if (delayMs >= 30_000) {
		void browser.alarms.create(COUNTDOWN_ALARM, { when: Date.now() + delayMs })
	}
}

function badgeText(mode: BadgeMode, summaries: PiholeSummary[]): string {
	const total = (pick: (s: PiholeSummary) => number) =>
		summaries.reduce((sum, s) => sum + pick(s), 0)
	switch (mode) {
		case 'state':
			return i18n.global.t('popup.badge.on')
		case 'clients':
			return formatCompact(total((s) => s.clients.active))
		case 'blocked':
			return formatCompact(total((s) => s.queries.blocked))
		case 'queries':
			return formatCompact(total((s) => s.queries.total))
		default: {
			const queries = total((s) => s.queries.total)
			const blocked = total((s) => s.queries.blocked)
			return `${queries > 0 ? Math.round((blocked / queries) * 100) : 0}%`
		}
	}
}

export async function updateBadge(): Promise<void> {
	const settings = await getSettings()
	i18n.global.locale.value = resolveLocale(settings.locale)
	if (settings.badgeMode === 'off' || settings.instances.length === 0) {
		stopCountdown()
		await setBadge('')
		return
	}
	try {
		const summaries = await Promise.all(
			settings.instances.map((inst) =>
				getPiHoleClient(inst)
					.getSummary()
					.catch(() => null),
			),
		)
		const valid = summaries.filter((s) => s !== null)
		if (valid.length === 0) {
			stopCountdown()
			await setBadge('!', COLORS.unreachable)
			return
		}

		const allEnabled = valid.every((s) => s.blocking.blocking === 'enabled')
		const anyEnabled = valid.some((s) => s.blocking.blocking === 'enabled')

		if (!anyEnabled) {
			const timers = valid.map((s) => s.blocking.timer ?? 0).filter((timer) => timer > 0)
			// Counts down to the first Pi-hole that switches back on
			if (timers.length === valid.length) {
				pauseEndsAt = Date.now() + Math.min(...timers) * 1000
				await renderCountdown()
				return
			}
			stopCountdown()
			await setBadge(i18n.global.t('popup.badge.off'), COLORS.off)
			return
		}

		stopCountdown()
		await setBadge(badgeText(settings.badgeMode, valid), allEnabled ? COLORS.on : COLORS.mixed)
	} catch {
		// Keep last known badge state on error rather than clearing it
	}
}
