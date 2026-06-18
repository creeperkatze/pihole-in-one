<template>
	<div class="w-96 flex flex-col max-h-max">
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
					:title="
						formatMessage(messages['popup.openInstance'], {
							name:
								settings.instances[activeInstance]?.name ||
								formatMessage(messages['options.piholeselector.instance.fallbackName']),
						})
					"
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

		<div class="h-px bg-border shrink-0"></div>

		<div class="overflow-y-auto max-h-[450px]">
			<div
				v-if="loading"
				class="flex flex-col items-center justify-center gap-3 py-8 px-5 min-h-40"
			>
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
				<!-- Instance tabs -->
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

				<div class="flex flex-col gap-2 p-3">
					<Card
						v-if="donateVisible"
						as="a"
						href="https://ko-fi.com/creeperkatze"
						target="_blank"
						rel="noopener"
						color="#FF5E5B"
						:title="formatMessage(messages['popup.donatePrompt.title'])"
						:description="formatMessage(messages['popup.donatePrompt.message'])"
						class="no-underline"
						icon-position="left"
						dismissible
						:dismiss-label="formatMessage(messages['popup.donatePrompt.dismiss'])"
						@click="dismissDonate"
						@dismiss="dismissDonate"
					>
						<template #icon>
							<KofiIcon class="size-5 shrink-0 text-[#FF5E5B] opacity-75 group-hover:opacity-100" />
						</template>
					</Card>

					<div
						v-if="states[activeInstance]?.error"
						class="flex items-center justify-between gap-2 p-3 rounded-[5px] bg-danger-bg border border-danger-border text-pihole-red text-xs"
					>
						<span>{{ states[activeInstance].error }}</span>
						<Button variant="outline" size="small" class="shrink-0" @click="openOptions">
							{{ formatMessage(messages['popup.error.fix']) }}
						</Button>
					</div>

					<StatusCard
						v-if="states[activeInstance]?.summary"
						:status="isEnabled(activeInstance) ? 'enabled' : 'disabled'"
						:sub="statusSub(activeInstance)"
						:disabled="states[activeInstance].toggling"
						@toggle="toggleBlocking(activeInstance)"
					/>

					<DisablePresets
						v-if="isEnabled(activeInstance)"
						:disabled="states[activeInstance].toggling"
						@select="disableFor(activeInstance, $event)"
					/>

					<StatusCards
						v-if="settings?.popupStatus && states[activeInstance]?.summary?.diagnosis"
						:status="states[activeInstance].summary!.diagnosis!"
					/>

					<GroupsCard
						v-if="settings?.popupGroups && states[activeInstance]?.summary?.groups?.length"
						:groups="states[activeInstance].summary!.groups"
						:base-url="settings!.instances[activeInstance].baseUrl"
						:api-password="settings!.instances[activeInstance].apiPassword"
					/>

					<ListsCard
						v-if="settings?.popupLists && states[activeInstance]?.summary?.lists?.length"
						:lists="states[activeInstance].summary!.lists"
						:base-url="settings!.instances[activeInstance].baseUrl"
						:api-password="settings!.instances[activeInstance].apiPassword"
					/>

					<StatsCard
						v-if="states[activeInstance]?.summary && settings?.popupStats !== 'none'"
						:summary="states[activeInstance].summary!"
						:mode="settings!.popupStats"
					/>

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
			</template>
		</div>

		<div class="h-px bg-border shrink-0"></div>

		<div class="flex shrink-0 items-center gap-2 px-3 py-1.5">
			<div class="flex min-w-0 flex-1 items-center gap-2">
				<span class="shrink-0 text-xs text-secondary">v{{ version }}</span>
				<span v-if="updateChecking" class="flex min-w-0 items-center gap-1 text-xs text-muted">
					<Loader2 class="size-4 shrink-0 animate-spin" aria-hidden="true" />
					<span class="truncate">{{ formatMessage(messages['popup.footer.checking']) }}</span>
				</span>
				<a
					v-else-if="isLatest"
					href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
					target="_blank"
					rel="noopener"
					class="flex min-w-0 items-center gap-1 text-xs text-green-500 no-underline transition-colors hover:text-green-400"
				>
					<CheckCircle2 class="size-3.5 shrink-0" aria-hidden="true" />
					<span class="truncate">{{ formatMessage(messages['popup.footer.latestVersion']) }}</span>
				</a>
				<a
					v-else-if="latestVersion"
					href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
					target="_blank"
					rel="noopener"
					class="flex min-w-0 items-center gap-1 text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-400"
				>
					<Clock class="size-3.5 shrink-0" aria-hidden="true" />
					<span class="truncate">{{
						formatMessage(messages['popup.footer.updateAvailable'])
					}}</span>
				</a>
			</div>
			<a
				href="https://ko-fi.com/creeperkatze"
				target="_blank"
				rel="noopener"
				class="flex shrink-0 items-center gap-1 text-xs text-[#FF5E5B] no-underline transition-colors hover:text-[#ff8e8c]"
			>
				<KofiIcon class="size-3.5" aria-hidden="true" />
				<span>{{ formatMessage(messages['popup.footer.donate']) }}</span>
			</a>
			<a
				href="https://github.com/creeperkatze/pihole-in-one"
				target="_blank"
				rel="noopener"
				class="flex shrink-0 items-center gap-1 text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-300"
			>
				<Star class="size-3.5 shrink-0" aria-hidden="true" />
				<span>{{ formatMessage(messages['popup.footer.starOnGitHub']) }}</span>
			</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { CheckCircle2, Clock, ExternalLink, Loader2, RefreshCw, Settings, Star } from '@lucide/vue'
import { storage } from '@wxt-dev/storage'
import { type BlockingStatus, PiHoleError } from 'pihole-js'
import { onMounted, onUnmounted, ref } from 'vue'
import { browser } from 'wxt/browser'

import KofiIcon from '../../assets/icons/kofi.svg?component'
import Logo from '../../assets/logo.svg?component'
import Button from '../../components/Button.vue'
import Card from '../../components/Card.vue'
import { getApiMessageForError } from '../../composables/useApiMessages'
import { getPiHoleClient, type PiholeSummary } from '../../utils/api'
import { formatDuration } from '../../utils/format'
import { useVIntl } from '../../utils/i18n'
import { type ExtensionSettings, getSettings, isConfigured } from '../../utils/settings'
import { getLatestVersionTag } from '../../utils/update-check'
import DisablePresets from './components/DisablePresets.vue'
import DomainCard from './components/DomainCard.vue'
import GroupsCard from './components/GroupsCard.vue'
import ListsCard from './components/ListsCard.vue'
import StatsCard from './components/StatsCard.vue'
import StatusCard from './components/StatusCard.vue'
import StatusCards from './components/StatusCards.vue'

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
	'popup.statusSub.reenables': {
		id: 'popup.statusSub.reenables',
		defaultMessage: 'Re-enables in {duration}',
	},
	'popup.statusSub.clients': {
		id: 'popup.statusSub.clients',
		defaultMessage: '{count} client(s) active',
	},
	'popup.error.fix': { id: 'popup.error.fix', defaultMessage: 'Fix' },
	'popup.donatePrompt.title': {
		id: 'popup.donatePrompt.title',
		defaultMessage: 'Support the extension',
	},
	'popup.donatePrompt.message': {
		id: 'popup.donatePrompt.message',
		defaultMessage:
			'Pi-hole In One will always be free, open source, and ad-free. If you find it useful, consider supporting its development with a small donation.',
	},
	'popup.donatePrompt.dismiss': {
		id: 'popup.donatePrompt.dismiss',
		defaultMessage: 'Dismiss',
	},
	'popup.footer.donate': { id: 'popup.footer.donate', defaultMessage: 'Donate' },
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
		defaultMessage: 'On GitHub',
	},
	'options.piholeselector.instance.fallbackName': {
		id: 'options.piholeselector.instance.fallbackName',
		defaultMessage: 'Pi-hole',
	},
	'popup.openInstance': { id: 'popup.openInstance', defaultMessage: 'Open {name}' },
	'popup.error.fetchFailed': {
		id: 'popup.error.fetchFailed',
		defaultMessage: 'Failed to fetch status',
	},
	'popup.error.actionFailed': { id: 'popup.error.actionFailed', defaultMessage: 'Action failed' },
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

const DONATE_PROMPT_DELAY_MS = 5 * 24 * 60 * 60 * 1000 // 5 days

interface DonatePromptState {
	installedAt: number
	dismissed: boolean
}

const donatePromptItem = storage.defineItem<DonatePromptState>('local:donatePrompt')

const donateVisible = ref(false)

let intervals: (ReturnType<typeof setInterval> | null)[] = []

function isEnabled(i: number): boolean {
	return states.value[i]?.summary?.blocking.blocking === 'enabled'
}

async function conditionallyShowDonate(): Promise<void> {
	const existing = await donatePromptItem.getValue()
	if (existing?.dismissed) return

	const state = existing ?? { installedAt: Date.now(), dismissed: false }
	if (!existing) await donatePromptItem.setValue(state)

	if (Date.now() - state.installedAt >= DONATE_PROMPT_DELAY_MS) donateVisible.value = true
}

async function dismissDonate(): Promise<void> {
	donateVisible.value = false
	const existing = await donatePromptItem.getValue()
	await donatePromptItem.setValue({
		installedAt: existing?.installedAt ?? Date.now(),
		dismissed: true,
	})
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
		const summary = await getPiHoleClient(inst).getSummary()
		states.value[i].summary = summary
		syncTimer(i, summary.blocking)
	} catch (e) {
		const apiMessage = getApiMessageForError(e)
		states.value[i].error = apiMessage
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
	if (!inst || !state.summary) return
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
	if (!inst || !state.summary) return
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

function openPihole(): void {
	const baseUrl = settings.value?.instances[activeInstance.value]?.baseUrl
	if (!baseUrl) return

	const adminUrl = new URL(baseUrl)
	adminUrl.pathname = `${adminUrl.pathname.replace(/\/$/, '')}/admin/`
	void browser.tabs.create({ url: adminUrl.toString() })
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
		void conditionallyShowDonate()
	}
	loading.value = false

	try {
		const tag = await getLatestVersionTag()
		if (tag && tag !== version) latestVersion.value = tag
		else if (tag) isLatest.value = true
	} catch (err) {
		console.error('[Pi-hole In One] Failed to check for updates:', err)
	} finally {
		updateChecking.value = false
	}
})
</script>
