import { defineMessages } from '@formatjs/intl'
import { storage } from '@wxt-dev/storage'
import { type BlockingStatus, PiHoleError } from 'pihole-js'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { browser } from 'wxt/browser'

import { getApiMessageForError } from '../../composables/useApiMessages'
import { getPiHoleClient, type PiholeSummary } from '../../utils/api'
import { formatDuration } from '../../utils/format'
import { useVIntl } from '../../utils/i18n'
import { type ExtensionSettings, getSettings, isConfigured } from '../../utils/settings'

const messages = defineMessages({
	'popup.statusSub.reenables': {
		id: 'popup.statusSub.reenables',
		defaultMessage: 'Re-enables in {duration}',
	},
	'popup.statusSub.clients': {
		id: 'popup.statusSub.clients',
		defaultMessage: '{count} client(s) active',
	},
	'popup.error.fetchFailed': {
		id: 'popup.error.fetchFailed',
		defaultMessage: 'Failed to fetch status',
	},
	'popup.error.actionFailed': { id: 'popup.error.actionFailed', defaultMessage: 'Action failed' },
})

export interface InstanceState {
	summary: PiholeSummary | null
	error: string
	toggling: boolean
	timerEndsAt: number | null
	timerRemaining: number | null
}

function makeState(): InstanceState {
	return { summary: null, error: '', toggling: false, timerEndsAt: null, timerRemaining: null }
}

interface DonatePromptState {
	dismissed: boolean
}

const donatePromptItem = storage.defineItem<DonatePromptState>('local:donatePrompt')

function paramString(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value
}

// Module-level singleton so the header, tab bar, and every routed view share the same state.
const loading = ref(true)
const refreshing = ref(false)
const configured = ref(false)
const settings = ref<ExtensionSettings | null>(null)
const states = ref<InstanceState[]>([])
const currentDomain = ref<string | null>(null)
const donateVisible = ref(false)

let intervals: (ReturnType<typeof setInterval> | null)[] = []

function isEnabled(i: number): boolean {
	return states.value[i]?.summary?.blocking.blocking === 'enabled'
}

async function conditionallyShowDonate(): Promise<void> {
	const existing = await donatePromptItem.getValue()
	if (existing?.dismissed) return
	donateVisible.value = true
}

export function usePopupInstances() {
	const { formatMessage } = useVIntl()
	const route = useRoute()
	const router = useRouter()

	const activeInstance = computed(() => {
		const id = paramString(route.params.pihole)
		if (!settings.value || !id) return 0
		const idx = settings.value.instances.findIndex((inst) => inst.id === id)
		return idx >= 0 ? idx : 0
	})

	function statusSub(i: number): string | undefined {
		const state = states.value[i]
		if (!state) return undefined
		if (state.timerRemaining !== null && state.timerRemaining > 0) {
			return formatMessage(messages['popup.statusSub.reenables'], {
				duration: formatDuration(state.timerRemaining),
			})
		}
		if (state.summary) {
			return formatMessage(messages['popup.statusSub.clients'], {
				count: state.summary.clients.active,
			})
		}
		return undefined
	}

	function syncTimer(i: number, blocking: BlockingStatus): void {
		const state = states.value[i]
		if (!state) return
		if (blocking.timer !== null && blocking.timer > 0) {
			state.timerEndsAt = Date.now() + blocking.timer * 1000
			if (!intervals[i]) {
				intervals[i] = setInterval(() => tickTimer(i), 1000)
			}
		} else {
			state.timerEndsAt = null
			state.timerRemaining = null
			if (intervals[i]) {
				clearInterval(intervals[i]!)
				intervals[i] = null
			}
		}
	}

	function tickTimer(i: number): void {
		const state = states.value[i]
		if (!state || state.timerEndsAt === null) return
		const remaining = Math.max(0, Math.round((state.timerEndsAt - Date.now()) / 1000))
		state.timerRemaining = remaining
		if (remaining === 0) {
			clearInterval(intervals[i]!)
			intervals[i] = null
			void pollUntilEnabled(i)
		}
	}

	async function pollUntilEnabled(i: number, maxAttempts = 5, delayMs = 1000): Promise<void> {
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			if (attempt > 0) await new Promise((r) => setTimeout(r, delayMs))
			await fetchSummary(i)
			if (isEnabled(i)) break
		}
		void browser.runtime.sendMessage({ type: 'refresh' })
	}

	async function fetchSummary(i: number): Promise<void> {
		const inst = settings.value?.instances[i]
		const state = states.value[i]
		if (!inst || !state) return
		state.error = ''
		try {
			const summary = await getPiHoleClient(inst).getSummary()
			state.summary = summary
			syncTimer(i, summary.blocking)
		} catch (e) {
			const apiMessage = getApiMessageForError(e)
			state.error = apiMessage
				? formatMessage(apiMessage)
				: e instanceof PiHoleError
					? e.message
					: e instanceof Error
						? e.message
						: formatMessage(messages['popup.error.fetchFailed'])
		}
	}

	async function fetchAll(): Promise<void> {
		await Promise.all(states.value.map((_, i) => fetchSummary(i)))
	}

	async function refresh(): Promise<void> {
		refreshing.value = true
		await fetchAll()
		void browser.runtime.sendMessage({ type: 'refresh' })
		refreshing.value = false
	}

	async function toggleBlocking(i: number): Promise<void> {
		const inst = settings.value?.instances[i]
		const state = states.value[i]
		if (!inst || !state?.summary) return
		state.toggling = true
		state.error = ''
		try {
			const enable = state.summary.blocking.blocking !== 'enabled'
			const newBlocking = enable
				? await getPiHoleClient(inst).dns.enable()
				: await getPiHoleClient(inst).dns.disable()
			state.summary = { ...state.summary, blocking: newBlocking }
			syncTimer(i, newBlocking)
			void browser.runtime.sendMessage({ type: 'refresh' })
			await fetchSummary(i)
		} catch (e) {
			const apiMessage = getApiMessageForError(e)
			state.error = apiMessage
				? formatMessage(apiMessage)
				: e instanceof PiHoleError
					? e.message
					: e instanceof Error
						? e.message
						: formatMessage(messages['popup.error.actionFailed'])
		} finally {
			state.toggling = false
		}
	}

	async function disableFor(i: number, seconds: number): Promise<void> {
		const inst = settings.value?.instances[i]
		const state = states.value[i]
		if (!inst || !state?.summary) return
		state.toggling = true
		state.error = ''
		try {
			const newBlocking = await getPiHoleClient(inst).dns.disable(seconds)
			state.summary = { ...state.summary, blocking: newBlocking }
			syncTimer(i, newBlocking)
			void browser.runtime.sendMessage({ type: 'refresh' })
			await fetchSummary(i)
		} catch (e) {
			const apiMessage = getApiMessageForError(e)
			state.error = apiMessage
				? formatMessage(apiMessage)
				: e instanceof PiHoleError
					? e.message
					: e instanceof Error
						? e.message
						: formatMessage(messages['popup.error.actionFailed'])
		} finally {
			state.toggling = false
		}
	}

	async function dismissDonate(): Promise<void> {
		donateVisible.value = false
		await donatePromptItem.setValue({ dismissed: true })
	}

	function openOptions(): void {
		void browser.tabs.create({ url: browser.runtime.getURL('/options.html') })
	}

	function openPihole(i: number): void {
		const baseUrl = settings.value?.instances[i]?.baseUrl
		if (!baseUrl) return
		const adminUrl = new URL(baseUrl)
		adminUrl.pathname = `${adminUrl.pathname.replace(/\/$/, '')}/admin/`
		void browser.tabs.create({ url: adminUrl.toString() })
	}

	function switchInstance(id: string): void {
		const tab = route.name && route.name !== 'root' ? String(route.name) : 'home'
		void router.push(`/${id}/${tab}`)
	}

	function switchTab(tabId: string): void {
		const id = paramString(route.params.pihole) ?? settings.value?.instances[0]?.id
		if (!id) return
		void router.push(`/${id}/${tabId}`)
	}

	async function init(): Promise<void> {
		const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
		if (tab?.url) {
			try {
				currentDomain.value = new URL(tab.url).hostname
			} catch {
				// ignore non-URL tabs
			}
		}

		const s = await getSettings()
		settings.value = s
		configured.value = isConfigured(s)
		if (configured.value) {
			states.value = s.instances.map(() => makeState())
			intervals = s.instances.map(() => null)
			await fetchAll()
			void conditionallyShowDonate()
			if (!paramString(route.params.pihole)) {
				await router.replace(`/${s.instances[0]!.id}/home`)
			}
		}
		loading.value = false
	}

	function dispose(): void {
		intervals.forEach((interval) => {
			if (interval) clearInterval(interval)
		})
	}

	return {
		loading,
		refreshing,
		configured,
		settings,
		states,
		currentDomain,
		donateVisible,
		activeInstance,
		isEnabled,
		statusSub,
		refresh,
		toggleBlocking,
		disableFor,
		dismissDonate,
		openOptions,
		openPihole,
		switchInstance,
		switchTab,
		init,
		dispose,
	}
}
