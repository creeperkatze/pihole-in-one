<template>
	<div class="w-85 flex flex-col">
		<header class="flex items-center justify-between px-3.5 py-3">
			<div class="flex items-center gap-2 font-bold text-[15px]">
				<img :src="browser.runtime.getURL('/logo.svg')" width="128" alt="Pi-hole In One" />
			</div>
			<button
				class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors duration-150 cursor-pointer"
				title="Settings"
				@click="openOptions"
			>
				<Settings :size="16" />
			</button>
		</header>

		<div class="h-px bg-zinc-200 dark:bg-zinc-700"></div>

		<div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40">
			<div
				class="w-7 h-7 border-[3px] border-zinc-200 dark:border-zinc-700 border-t-pihole-red rounded-full animate-spin"
			></div>
		</div>

		<div
			v-else-if="!configured"
			class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40"
		>
			<p class="m-0 text-zinc-500 dark:text-zinc-400 text-center">
				Configure your Pi-hole to get started.
			</p>
			<button class="btn btn-primary" @click="openOptions">Open Settings</button>
		</div>

		<template v-else>
			<div class="flex flex-col gap-2.5 px-3.5 py-3">
				<StatusCard
					v-if="summary"
					:status="blockingEnabled ? 'enabled' : 'disabled'"
					:sub="statusSub"
					:disabled="toggling"
					@toggle="toggleBlocking"
				/>

				<div v-if="blockingEnabled" class="flex flex-col gap-1.5">
					<div
						class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.5px]"
					>
						Disable for
					</div>
					<div class="flex gap-1.5 flex-wrap">
						<button
							v-for="preset in disablePresets"
							:key="preset.label"
							class="btn btn-sm btn-outline"
							:disabled="toggling"
							@click="disableFor(preset.seconds)"
						>
							{{ preset.label }}
						</button>
					</div>
				</div>

				<div
					v-if="error"
					class="px-3 py-2 rounded-[5px] bg-danger-bg border border-danger-border text-pihole-red text-xs"
				>
					{{ error }}
				</div>

				<StatsGrid v-if="summary" :stats="formattedStats" />

				<DomainCard v-if="currentDomain && settings" :domain="currentDomain" :settings="settings" />
			</div>

			<div class="h-px bg-zinc-200 dark:bg-zinc-700"></div>

			<footer class="flex items-center justify-between px-3.5 py-2">
				<a
					href="https://github.com/creeperkatze/pihole-in-one"
					target="_blank"
					rel="noopener"
					class="text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-300"
				>
					★ On GitHub
				</a>
				<button
					class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					title="Refresh"
					:disabled="refreshing"
					@click="refresh"
				>
					<RefreshCw :size="14" :class="{ 'animate-spin': refreshing }" />
				</button>
			</footer>
		</template>
	</div>
</template>

<script setup lang="ts">
import { RefreshCw, Settings } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { browser } from 'wxt/browser'

import { type BlockingStatus, getSummary, type PiholeSummary, setBlocking } from '../../helpers/api'
import { formatDuration, formatNumber } from '../../helpers/format'
import { getSettings, isConfigured, type PiholeSettings } from '../../helpers/settings'
import DomainCard from './components/DomainCard.vue'
import StatsGrid from './components/StatsGrid.vue'
import StatusCard from './components/StatusCard.vue'

const loading = ref(true)
const refreshing = ref(false)
const toggling = ref(false)
const configured = ref(false)
const error = ref('')
const summary = ref<PiholeSummary | null>(null)
const settings = ref<PiholeSettings | null>(null)
const currentDomain = ref<string | null>(null)

// Timer countdown
const timerEndsAt = ref<number | null>(null)
const timerRemaining = ref<number | null>(null)
let countdownInterval: ReturnType<typeof setInterval> | null = null

function syncTimer(blocking: BlockingStatus): void {
	if (blocking.timer !== null && blocking.timer > 0) {
		timerEndsAt.value = Date.now() + blocking.timer * 1000
		if (!countdownInterval) {
			countdownInterval = setInterval(tickTimer, 1000)
		}
	} else {
		timerEndsAt.value = null
		timerRemaining.value = null
		if (countdownInterval) {
			clearInterval(countdownInterval)
			countdownInterval = null
		}
	}
}

function tickTimer(): void {
	if (timerEndsAt.value === null) return
	const remaining = Math.max(0, Math.round((timerEndsAt.value - Date.now()) / 1000))
	timerRemaining.value = remaining
	if (remaining === 0) {
		if (countdownInterval) {
			clearInterval(countdownInterval)
			countdownInterval = null
		}
		void fetchSummary().then(() => {
			void browser.runtime.sendMessage({ type: 'refresh' })
		})
	}
}

onUnmounted(() => {
	if (countdownInterval) clearInterval(countdownInterval)
})

const disablePresets = [
	{ label: '10s', seconds: 10 },
	{ label: '30s', seconds: 30 },
	{ label: '5m', seconds: 5 * 60 },
	{ label: '30m', seconds: 30 * 60 },
	{ label: '1h', seconds: 60 * 60 },
	{ label: '∞', seconds: 0 },
]

const blockingEnabled = computed(() => summary.value?.blocking.blocking === 'enabled')

const statusSub = computed(() => {
	if (timerRemaining.value !== null && timerRemaining.value > 0) {
		return `Re-enables in ${formatDuration(timerRemaining.value)}`
	}
	if (summary.value) {
		return `${summary.value.clients.active} client(s) active`
	}
	return undefined
})

const formattedStats = computed(() => {
	if (!summary.value) return []
	const q = summary.value.queries
	return [
		{ label: 'Queries Today', value: formatNumber(q.total) },
		{ label: 'Blocked Today', value: formatNumber(q.blocked) },
		{ label: 'Blocked', value: `${q.percent_blocked.toFixed(1)}%` },
		{ label: 'Unique Domains', value: formatNumber(q.unique_domains) },
	]
})

async function fetchSummary(): Promise<void> {
	if (!settings.value) return
	error.value = ''
	try {
		summary.value = await getSummary(settings.value.baseUrl, settings.value.apiPassword)
		syncTimer(summary.value.blocking)
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Failed to fetch status'
	}
}

async function refresh(): Promise<void> {
	refreshing.value = true
	await fetchSummary()
	void browser.runtime.sendMessage({ type: 'refresh' })
	refreshing.value = false
}

async function applyBlockingState(newBlocking: BlockingStatus): Promise<void> {
	if (summary.value) {
		summary.value = { ...summary.value, blocking: newBlocking }
	}
	syncTimer(newBlocking)
	void browser.runtime.sendMessage({ type: 'refresh' })
	await fetchSummary()
}

async function toggleBlocking(): Promise<void> {
	if (!settings.value || !summary.value) return
	toggling.value = true
	error.value = ''
	try {
		const enable = summary.value.blocking.blocking !== 'enabled'
		const newBlocking = await setBlocking(
			settings.value.baseUrl,
			settings.value.apiPassword,
			enable,
		)
		await applyBlockingState(newBlocking)
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Action failed'
	} finally {
		toggling.value = false
	}
}

async function disableFor(seconds: number): Promise<void> {
	if (!settings.value) return
	toggling.value = true
	error.value = ''
	try {
		const newBlocking = await setBlocking(
			settings.value.baseUrl,
			settings.value.apiPassword,
			false,
			seconds,
		)
		await applyBlockingState(newBlocking)
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Action failed'
	} finally {
		toggling.value = false
	}
}

function openOptions(): void {
	void browser.tabs.create({ url: browser.runtime.getURL('/options.html') })
}

onMounted(async () => {
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
	if (tab?.url) {
		currentDomain.value = new URL(tab.url).hostname
	}
	const s = await getSettings()
	settings.value = s
	configured.value = isConfigured(s)
	if (configured.value) await fetchSummary()
	loading.value = false
})
</script>
