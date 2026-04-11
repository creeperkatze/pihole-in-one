<template>
	<div class="w-96 flex flex-col">
		<header class="flex items-center justify-between px-3.5 py-3">
			<a
				href="https://github.com/creeperkatze/pihole-in-one"
				target="_blank"
				rel="noopener"
				class="flex items-center gap-2"
			>
				<Logo class="text-primary" width="128" height="43" />
			</a>
			<div class="flex items-center gap-1">
				<button
					class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					:title="formatMessage(messages['popup.refresh'])"
					:disabled="refreshing"
					@click="refresh"
				>
					<RefreshCw class="size-4" :class="{ 'animate-spin': refreshing }" />
				</button>
				<button
					v-if="configured && settings"
					class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150 cursor-pointer"
					:title="`Open ${settings.instances[activeInstance]?.name || formatMessage(messages['options.piholeselector.instance.fallbackName'])}`"
					@click="openPihole"
				>
					<ExternalLink class="size-4" />
				</button>
				<button
					class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150 cursor-pointer"
					:title="formatMessage(messages['popup.settings'])"
					@click="openOptions"
				>
					<Settings class="size-4" />
				</button>
			</div>
		</header>

		<div class="h-px bg-border"></div>

		<div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40">
			<div
				class="w-7 h-7 border-[3px] border-border border-t-pihole-red rounded-full animate-spin"
			></div>
		</div>

		<div
			v-else-if="!configured"
			class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40"
		>
			<p class="m-0 text-secondary text-center">
				{{ formatMessage(messages['popup.notConfigured.message']) }}
			</p>
			<Button variant="primary" @click="openOptions">
				{{ formatMessage(messages['popup.notConfigured.openSettings']) }}
			</Button>
		</div>

		<template v-else>
			<!-- Instance tabs — only shown when there are multiple instances -->
			<div v-if="settings!.instances.length > 1" class="flex border-b border-border px-1">
				<button
					v-for="(inst, i) in settings!.instances"
					:key="inst.id"
					class="relative px-3.5 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer border-0 bg-transparent"
					:class="activeInstance === i ? 'text-primary' : 'text-secondary hover:text-primary'"
					@click="activeInstance = i"
				>
					{{
						inst.name ||
						`${formatMessage(messages['options.piholeselector.instance.fallbackName'])} ${i + 1}`
					}}
					<span
						v-if="activeInstance === i"
						class="absolute bottom-0 left-0 right-0 h-0.5 bg-pihole-red rounded-full"
					></span>
				</button>
			</div>

			<div class="flex flex-col gap-2.5 px-3.5 py-3">
				<StatusCard
					v-if="states[activeInstance]?.summary"
					:status="isEnabled(activeInstance) ? 'enabled' : 'disabled'"
					:sub="statusSub(activeInstance)"
					:disabled="states[activeInstance].toggling"
					@toggle="toggleBlocking(activeInstance)"
				/>

				<div v-if="isEnabled(activeInstance)" class="flex flex-col gap-1.5">
					<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
						{{ formatMessage(messages['popup.disableFor']) }}
					</div>
					<div class="flex gap-1.5 flex-wrap">
						<Button
							v-for="preset in disablePresets"
							:key="preset.label"
							variant="outline"
							:disabled="states[activeInstance].toggling"
							@click="disableFor(activeInstance, preset.seconds)"
						>
							{{ preset.label }}
						</Button>
					</div>
				</div>

				<div
					v-if="states[activeInstance]?.error"
					class="flex items-center justify-between gap-2 px-3 py-2 rounded-[5px] bg-danger-bg border border-danger-border text-pihole-red text-xs"
				>
					<span>{{ states[activeInstance].error }}</span>
					<Button variant="outline" size="small" class="shrink-0" @click="openOptions">
						{{ formatMessage(messages['popup.error.fix']) }}
					</Button>
				</div>

				<StatsGrid v-if="states[activeInstance]?.summary" :stats="formattedStats(activeInstance)" />

				<DomainCard
					v-if="
						currentDomain &&
						settings &&
						settings.instances.length > 0 &&
						!states[activeInstance]?.error
					"
					:domain="currentDomain"
					:instances="settings.instances"
				/>
			</div>

			<div class="h-px bg-border"></div>
		</template>

		<footer class="flex items-center gap-2 px-3.5 py-2">
			<span class="text-xs text-secondary">v{{ version }}</span>
			<span v-if="updateChecking" class="flex items-center gap-1 text-xs text-muted">
				<Loader2 class="size-3 animate-spin" aria-hidden="true" />
				{{ formatMessage(messages['popup.footer.checking']) }}
			</span>
			<a
				v-else-if="isLatest"
				href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
				target="_blank"
				rel="noopener"
				class="flex items-center gap-1 text-xs text-green-500 no-underline transition-colors hover:text-green-400"
			>
				<CheckCircle2 class="size-3" aria-hidden="true" />
				{{ formatMessage(messages['popup.footer.latestVersion']) }}
			</a>
			<a
				v-else-if="latestVersion"
				href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
				target="_blank"
				rel="noopener"
				class="flex items-center gap-1 text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-400"
			>
				<Clock class="size-3" aria-hidden="true" />
				{{ formatMessage(messages['popup.footer.updateAvailable']) }}
			</a>
			<a
				href="https://ko-fi.com/creeperkatze"
				target="_blank"
				rel="noopener"
				class="ml-auto flex items-center gap-1 text-xs text-[#FF5E5B] no-underline transition-colors hover:text-[#ff8e8c]"
			>
				<KofiIcon class="size-3.5" aria-hidden="true" />
				{{ formatMessage(messages['popup.footer.support']) }}
			</a>
			<a
				href="https://github.com/creeperkatze/pihole-in-one"
				target="_blank"
				rel="noopener"
				class="text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-300"
			>
				{{ formatMessage(messages['popup.footer.starOnGitHub']) }}
			</a>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { CheckCircle2, Clock, ExternalLink, Loader2, RefreshCw, Settings } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { browser } from 'wxt/browser'

import KofiIcon from '../../assets/icons/kofi.svg?component'
import Logo from '../../assets/logo.svg?component'
import Button from '../../components/Button.vue'
import { type BlockingStatus, getSummary, type PiholeSummary, setBlocking } from '../../helpers/api'
import { formatDuration, formatNumber } from '../../helpers/format'
import { useVIntl } from '../../helpers/i18n'
import { type ExtensionSettings, getSettings, isConfigured } from '../../helpers/settings'
import DomainCard from './components/DomainCard.vue'
import StatsGrid from './components/StatsGrid.vue'
import StatusCard from './components/StatusCard.vue'

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.refresh': { id: 'popup.refresh', defaultMessage: 'Refresh' },
	'popup.settings': { id: 'popup.settings', defaultMessage: 'Settings' },
	'popup.notConfigured.message': {
		id: 'popup.notConfigured.message',
		defaultMessage: 'Configure your Pi-hole to get started.',
	},
	'popup.notConfigured.openSettings': {
		id: 'popup.notConfigured.openSettings',
		defaultMessage: 'Open Settings',
	},
	'popup.disableFor': { id: 'popup.disableFor', defaultMessage: 'Disable for' },
	'popup.statusSub.reenables': {
		id: 'popup.statusSub.reenables',
		defaultMessage: 'Re-enables in {duration}',
	},
	'popup.statusSub.clients': {
		id: 'popup.statusSub.clients',
		defaultMessage: '{count} client(s) active',
	},
	'popup.stats.queriesToday': { id: 'popup.stats.queriesToday', defaultMessage: 'Queries Today' },
	'popup.stats.blockedToday': { id: 'popup.stats.blockedToday', defaultMessage: 'Blocked Today' },
	'popup.stats.blocked': { id: 'popup.stats.blocked', defaultMessage: 'Blocked' },
	'popup.stats.uniqueDomains': {
		id: 'popup.stats.uniqueDomains',
		defaultMessage: 'Unique Domains',
	},
	'popup.error.fix': { id: 'popup.error.fix', defaultMessage: 'Fix' },
	'popup.footer.support': { id: 'popup.footer.support', defaultMessage: 'Support' },
	'popup.footer.checking': { id: 'popup.footer.checking', defaultMessage: 'Checking' },
	'popup.footer.latestVersion': {
		id: 'popup.footer.latestVersion',
		defaultMessage: 'Latest version',
	},
	'popup.footer.updateAvailable': {
		id: 'popup.footer.updateAvailable',
		defaultMessage: 'Update available',
	},
	'popup.footer.starOnGitHub': {
		id: 'popup.footer.starOnGitHub',
		defaultMessage: '★ On GitHub',
	},
	'options.piholeselector.instance.fallbackName': {
		id: 'options.piholeselector.instance.fallbackName',
		defaultMessage: 'Pi-hole',
	},
})

interface InstanceState {
	summary: PiholeSummary | null
	error: string
	toggling: boolean
	timerEndsAt: number | null
	timerRemaining: number | null
}

function makeState(): InstanceState {
	return { summary: null, error: '', toggling: false, timerEndsAt: null, timerRemaining: null }
}

const version = browser.runtime.getManifest().version
const latestVersion = ref<string | null>(null)
const isLatest = ref(false)
const updateChecking = ref(true)

const loading = ref(true)
const refreshing = ref(false)
const configured = ref(false)
const settings = ref<ExtensionSettings | null>(null)
const states = ref<InstanceState[]>([])
const activeInstance = ref(0)
const currentDomain = ref<string | null>(null)

let intervals: (ReturnType<typeof setInterval> | null)[] = []

const disablePresets = [
	{ label: '10s', seconds: 10 },
	{ label: '30s', seconds: 30 },
	{ label: '5m', seconds: 5 * 60 },
	{ label: '30m', seconds: 30 * 60 },
	{ label: '1h', seconds: 60 * 60 },
]

function isEnabled(i: number): boolean {
	return states.value[i]?.summary?.blocking.blocking === 'enabled'
}

function statusSub(i: number): string | undefined {
	const state = states.value[i]
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

function formattedStats(i: number): Array<{ label: string; value: string }> {
	const summary = states.value[i]?.summary
	if (!summary) return []
	const q = summary.queries
	return [
		{ label: formatMessage(messages['popup.stats.queriesToday']), value: formatNumber(q.total) },
		{ label: formatMessage(messages['popup.stats.blockedToday']), value: formatNumber(q.blocked) },
		{
			label: formatMessage(messages['popup.stats.blocked']),
			value: `${q.percent_blocked.toFixed(1)}%`,
		},
		{
			label: formatMessage(messages['popup.stats.uniqueDomains']),
			value: formatNumber(q.unique_domains),
		},
	]
}

function syncTimer(i: number, blocking: BlockingStatus): void {
	if (blocking.timer !== null && blocking.timer > 0) {
		states.value[i].timerEndsAt = Date.now() + blocking.timer * 1000
		if (!intervals[i]) {
			intervals[i] = setInterval(() => tickTimer(i), 1000)
		}
	} else {
		states.value[i].timerEndsAt = null
		states.value[i].timerRemaining = null
		if (intervals[i]) {
			clearInterval(intervals[i]!)
			intervals[i] = null
		}
	}
}

function tickTimer(i: number): void {
	const state = states.value[i]
	if (state.timerEndsAt === null) return
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
	if (!inst) return
	states.value[i].error = ''
	try {
		const summary = await getSummary(inst.baseUrl, inst.apiPassword)
		states.value[i].summary = summary
		syncTimer(i, summary.blocking)
	} catch (e) {
		states.value[i].error = e instanceof Error ? e.message : 'Failed to fetch status'
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
	if (!inst || !state.summary) return
	state.toggling = true
	state.error = ''
	try {
		const enable = state.summary.blocking.blocking !== 'enabled'
		const newBlocking = await setBlocking(inst.baseUrl, inst.apiPassword, enable)
		state.summary = { ...state.summary, blocking: newBlocking }
		syncTimer(i, newBlocking)
		void browser.runtime.sendMessage({ type: 'refresh' })
		await fetchSummary(i)
	} catch (e) {
		state.error = e instanceof Error ? e.message : 'Action failed'
	} finally {
		state.toggling = false
	}
}

async function disableFor(i: number, seconds: number): Promise<void> {
	const inst = settings.value?.instances[i]
	const state = states.value[i]
	if (!inst || !state.summary) return
	state.toggling = true
	state.error = ''
	try {
		const newBlocking = await setBlocking(inst.baseUrl, inst.apiPassword, false, seconds)
		state.summary = { ...state.summary, blocking: newBlocking }
		syncTimer(i, newBlocking)
		void browser.runtime.sendMessage({ type: 'refresh' })
		await fetchSummary(i)
	} catch (e) {
		state.error = e instanceof Error ? e.message : 'Action failed'
	} finally {
		state.toggling = false
	}
}

function openPihole(): void {
	const url = settings.value?.instances[activeInstance.value]?.baseUrl
	if (url) void browser.tabs.create({ url })
}

function openOptions(): void {
	void browser.tabs.create({ url: browser.runtime.getURL('/options.html') })
}

onUnmounted(() => {
	intervals.forEach((interval) => {
		if (interval) clearInterval(interval)
	})
})

onMounted(async () => {
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
	}
	loading.value = false

	try {
		const CACHE_KEY = 'updateCheckCache'
		const CACHE_TTL = 10 * 60 * 1000
		const cached = await browser.storage.local.get(CACHE_KEY)
		const entry = cached[CACHE_KEY] as { tag: string; ts: number } | undefined
		let tag: string
		if (entry && Date.now() - entry.ts < CACHE_TTL) {
			tag = entry.tag
		} else {
			const res = await fetch(
				'https://api.github.com/repos/creeperkatze/pihole-in-one/releases/latest',
			)
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data = await res.json()
			tag = data.tag_name?.replace(/^v/, '') ?? ''
			await browser.storage.local.set({ [CACHE_KEY]: { tag, ts: Date.now() } })
		}
		if (tag && tag !== version) latestVersion.value = tag
		else if (tag) isLatest.value = true
	} catch (err) {
		console.error('[Pi-hole In One] Failed to check for updates:', err)
	} finally {
		updateChecking.value = false
	}
})
</script>
