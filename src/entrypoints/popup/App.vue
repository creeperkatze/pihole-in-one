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
			<!-- Instance tabs — only shown when there are multiple instances -->
			<div
				v-if="settings!.instances.length > 1"
				class="flex border-b border-zinc-200 dark:border-zinc-700 px-1"
			>
				<button
					v-for="(inst, i) in settings!.instances"
					:key="inst.id"
					class="relative px-3.5 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer border-0 bg-transparent"
					:class="
						activeInstance === i
							? 'text-zinc-950 dark:text-zinc-50'
							: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50'
					"
					@click="activeInstance = i"
				>
					{{ inst.name || `Pi-hole ${i + 1}` }}
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
							:disabled="states[activeInstance].toggling"
							@click="disableFor(activeInstance, preset.seconds)"
						>
							{{ preset.label }}
						</button>
					</div>
				</div>

				<div
					v-if="states[activeInstance]?.error"
					class="px-3 py-2 rounded-[5px] bg-danger-bg border border-danger-border text-pihole-red text-xs"
				>
					{{ states[activeInstance].error }}
				</div>

				<StatsGrid v-if="states[activeInstance]?.summary" :stats="formattedStats(activeInstance)" />

				<DomainCard
					v-if="currentDomain && settings && settings.instances.length > 0"
					:domain="currentDomain"
					:instances="settings.instances"
				/>
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
import { onMounted, onUnmounted, ref } from 'vue'
import { browser } from 'wxt/browser'

import { type BlockingStatus, getSummary, type PiholeSummary, setBlocking } from '../../helpers/api'
import { formatDuration, formatNumber } from '../../helpers/format'
import { getSettings, isConfigured, type PiholeSettings } from '../../helpers/settings'
import DomainCard from './components/DomainCard.vue'
import StatsGrid from './components/StatsGrid.vue'
import StatusCard from './components/StatusCard.vue'

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

const loading = ref(true)
const refreshing = ref(false)
const configured = ref(false)
const settings = ref<PiholeSettings | null>(null)
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
	{ label: '∞', seconds: 0 },
]

function isEnabled(i: number): boolean {
	return states.value[i]?.summary?.blocking.blocking === 'enabled'
}

function statusSub(i: number): string | undefined {
	const state = states.value[i]
	if (state.timerRemaining !== null && state.timerRemaining > 0) {
		return `Re-enables in ${formatDuration(state.timerRemaining)}`
	}
	if (state.summary) {
		return `${state.summary.clients.active} client(s) active`
	}
	return undefined
}

function formattedStats(i: number): Array<{ label: string; value: string }> {
	const summary = states.value[i]?.summary
	if (!summary) return []
	const q = summary.queries
	return [
		{ label: 'Queries Today', value: formatNumber(q.total) },
		{ label: 'Blocked Today', value: formatNumber(q.blocked) },
		{ label: 'Blocked', value: `${q.percent_blocked.toFixed(1)}%` },
		{ label: 'Unique Domains', value: formatNumber(q.unique_domains) },
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
		void fetchSummary(i).then(() => {
			void browser.runtime.sendMessage({ type: 'refresh' })
		})
	}
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
})
</script>
