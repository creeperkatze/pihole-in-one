<template>
	<div class="w-85 flex flex-col">
		<header class="flex items-center justify-between px-3.5 py-3">
			<div class="flex items-center gap-2 font-bold text-[15px]">
				<img :src="iconUrl" width="22" height="22" alt="" />
				Pi-hole In One
			</div>
			<button
				class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors duration-150 cursor-pointer"
				title="Settings"
				@click="openOptions"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					/>
					<circle cx="12" cy="12" r="3" />
				</svg>
			</button>
		</header>

		<div class="h-px bg-zinc-200 dark:bg-zinc-700"></div>

		<div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40">
			<div class="w-7 h-7 border-[3px] border-zinc-200 dark:border-zinc-700 border-t-pihole-red rounded-full animate-spin"></div>
		</div>

		<div v-else-if="!configured" class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40">
			<p class="m-0 text-zinc-500 dark:text-zinc-400 text-center">Configure your Pi-hole to get started.</p>
			<button class="btn btn-primary" @click="openOptions">Open Settings</button>
		</div>

		<template v-else>
			<div class="flex flex-col gap-2.5 px-3.5 py-3">
				<StatusCard
					:status="blockingEnabled ? 'enabled' : 'disabled'"
					:sub="summary ? `${summary.clients.active} client(s) active` : undefined"
					:disabled="toggling || !summary"
					@toggle="toggleBlocking"
				/>

				<div v-if="blockingEnabled" class="flex flex-col gap-1.5">
					<div class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.5px]">
						Disable for:
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

				<DomainCard
					v-if="currentDomain && settings"
					:domain="currentDomain"
					:settings="settings"
				/>
			</div>

			<div class="h-px bg-zinc-200 dark:bg-zinc-700"></div>

			<footer class="flex items-center justify-between px-3.5 py-2">
				<span class="text-[11px] text-zinc-500 dark:text-zinc-400">{{ lastUpdatedText }}</span>
				<button
					class="flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					title="Refresh"
					:disabled="refreshing"
					@click="refresh"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						:class="{ 'animate-spin': refreshing }"
					>
						<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
						<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
						<path d="M8 16H3v5" />
					</svg>
				</button>
			</footer>
		</template>
	</div>
</template>

<script setup lang="ts">
import { browser } from 'wxt/browser'
import { computed, onMounted, ref } from 'vue'

import { getSummary, setBlocking, type PiholeSummary } from '../../helpers/api'
import { getSettings, isConfigured, type PiholeSettings } from '../../helpers/settings'
import DomainCard from './components/DomainCard.vue'
import StatusCard from './components/StatusCard.vue'
import StatsGrid from './components/StatsGrid.vue'

const iconUrl = browser.runtime.getURL('/icon.svg')

const loading = ref(true)
const refreshing = ref(false)
const toggling = ref(false)
const configured = ref(false)
const error = ref('')
const summary = ref<PiholeSummary | null>(null)
const settings = ref<PiholeSettings | null>(null)
const lastUpdated = ref<Date | null>(null)
const currentDomain = ref<string | null>(null)

const disablePresets = [
	{ label: '10s', seconds: 10 },
	{ label: '30s', seconds: 30 },
	{ label: '5m', seconds: 5 * 60 },
	{ label: '30m', seconds: 30 * 60 },
	{ label: '1h', seconds: 60 * 60 },
	{ label: '∞', seconds: 0 },
]

const blockingEnabled = computed(() => summary.value?.blocking.blocking === 'enabled')

const formattedStats = computed(() => {
	if (!summary.value) return []
	const q = summary.value.queries
	return [
		{ label: 'Queries Today', value: fmt(q.total) },
		{ label: 'Blocked Today', value: fmt(q.blocked) },
		{ label: '% Blocked', value: `${q.percent_blocked.toFixed(1)}%` },
		{ label: 'Unique Domains', value: fmt(q.unique_domains) },
	]
})

const lastUpdatedText = computed(() => {
	if (!lastUpdated.value) return 'Never updated'
	const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000)
	if (diff < 5) return 'Just now'
	if (diff < 60) return `${diff}s ago`
	return `${Math.floor(diff / 60)}m ago`
})

function fmt(n: number): string {
	return n.toLocaleString()
}

async function fetchSummary(): Promise<void> {
	if (!settings.value) return
	error.value = ''
	try {
		summary.value = await getSummary(settings.value.baseUrl, settings.value.apiPassword)
		lastUpdated.value = new Date()
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

async function toggleBlocking(): Promise<void> {
	if (!settings.value || !summary.value) return
	toggling.value = true
	error.value = ''
	try {
		const enable = summary.value.blocking.blocking !== 'enabled'
		await setBlocking(settings.value.baseUrl, settings.value.apiPassword, enable)
		await fetchSummary()
		void browser.runtime.sendMessage({ type: 'refresh' })
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
		await setBlocking(settings.value.baseUrl, settings.value.apiPassword, false, seconds)
		await fetchSummary()
		void browser.runtime.sendMessage({ type: 'refresh' })
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
		try { currentDomain.value = new URL(tab.url).hostname } catch {}
	}
	const s = await getSettings()
	settings.value = s
	configured.value = isConfigured(s)
	if (configured.value) await fetchSummary()
	loading.value = false
})
</script>
