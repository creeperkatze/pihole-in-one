<template>
	<div class="popup">
		<header class="header">
			<div class="header-title">
				<img :src="iconUrl" width="22" height="22" alt="" />
				Pi-hole In One
			</div>
			<button class="icon-btn" title="Settings" @click="openOptions">
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

		<div class="divider"></div>

		<div v-if="loading" class="state-center">
			<div class="spinner"></div>
		</div>

		<div v-else-if="!configured" class="state-center">
			<p class="state-text">Configure your Pi-hole to get started.</p>
			<button class="btn btn-primary" @click="openOptions">Open Settings</button>
		</div>

		<template v-else>
			<div class="content">
				<StatusCard
					:status="blockingEnabled ? 'enabled' : 'disabled'"
					:sub="summary ? `${summary.clients.active} client(s) active` : undefined"
					:disabled="toggling || !summary"
					@toggle="toggleBlocking"
				/>

				<div v-if="blockingEnabled" class="disable-section">
					<div class="disable-label">Disable for:</div>
					<div class="disable-btns">
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

				<div v-if="error" class="error-msg">{{ error }}</div>

				<StatsGrid v-if="summary" :stats="formattedStats" />

				<DomainCard
					v-if="currentDomain && settings"
					:domain="currentDomain"
					:settings="settings"
				/>
			</div>

			<div class="divider"></div>

			<footer class="footer">
				<span class="footer-time">{{ lastUpdatedText }}</span>
				<button class="icon-btn" title="Refresh" :disabled="refreshing" @click="refresh">
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
						:class="{ spinning: refreshing }"
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

<style scoped>
.popup {
	width: 340px;
	display: flex;
	flex-direction: column;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 14px;
}

.header-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 700;
	font-size: 15px;
}


.icon-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 5px;
	border: none;
	border-radius: var(--radius-sm);
	background: transparent;
	color: var(--text-muted);
	transition: background 0.15s, color 0.15s;
}

.icon-btn:hover:not(:disabled) {
	background: var(--bg-hover);
	color: var(--text);
}

.state-center {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 32px 20px;
	min-height: 160px;
}

.state-text {
	margin: 0;
	color: var(--text-muted);
	text-align: center;
}

.spinner {
	width: 28px;
	height: 28px;
	border: 3px solid var(--border);
	border-top-color: var(--accent);
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

.content {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 12px 14px;
}

.disable-section {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.disable-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.disable-btns {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}

.error-msg {
	padding: 8px 12px;
	border-radius: var(--radius-sm);
	background: var(--danger-bg);
	border: 1px solid var(--danger-border);
	color: var(--danger);
	font-size: 12px;
}

.footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 14px;
}

.footer-time {
	font-size: 11px;
	color: var(--text-muted);
}

.spinning {
	animation: spin 0.7s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
