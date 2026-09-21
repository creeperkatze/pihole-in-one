<template>
	<div class="flex h-140 w-96 flex-col">
		<header class="flex shrink-0 items-center justify-between px-3.5 py-3">
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
					class="relative flex items-center justify-center p-1.5 border-0 rounded-[5px] bg-transparent text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150 cursor-pointer"
					:title="
						formatMessage(messages['popup.openInstance'], {
							name:
								settings.instances[activeInstance]?.name ||
								formatMessage(messages['options.piholeselector.instance.fallbackName']),
						})
					"
					@click="openPihole(activeInstance)"
				>
					<ExternalLink class="size-4" />
					<span
						v-if="messageCount > 0"
						class="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-yellow-500 px-0.75 text-[9px] leading-none font-bold text-black"
					>
						{{ messageCount > 99 ? '99+' : messageCount }}
					</span>
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

		<div class="flex min-h-0 flex-1 flex-col">
			<div v-if="loading" class="flex flex-1 flex-col items-center justify-center gap-3 py-8 px-5">
				<div
					class="w-7 h-7 border-[3px] border-border border-t-pihole-red rounded-full animate-spin"
				></div>
			</div>

			<div
				v-else-if="!configured"
				class="flex flex-1 flex-col items-center justify-center gap-3 py-8 px-5"
			>
				<p class="m-0 text-secondary text-center">
					{{ formatMessage(messages['popup.notConfigured.message']) }}
				</p>
				<Button variant="primary" @click="openOptions">
					{{ formatMessage(messages['popup.notConfigured.openSettings']) }}
				</Button>
			</div>

			<div v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto">
				<Card
					v-if="donateVisible"
					as="a"
					href="https://ko-fi.com/creeperkatze"
					target="_blank"
					rel="noopener"
					color="#FF5E5B"
					:title="formatMessage(messages['popup.donatePrompt.title'])"
					:description="formatMessage(messages['popup.donatePrompt.message'])"
					class="mx-3 mt-3 shrink-0 no-underline"
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
					class="mx-3 mt-3 flex shrink-0 items-center justify-between gap-2 rounded-[5px] border border-danger-border bg-danger-bg p-3 text-xs text-pihole-red"
				>
					<span>{{ states[activeInstance]?.error }}</span>
					<Button variant="outline" size="small" class="shrink-0" @click="openOptions">
						{{ formatMessage(messages['popup.error.fix']) }}
					</Button>
				</div>

				<div class="sticky top-0 z-10 flex shrink-0 flex-col gap-2 bg-surface-1 px-3 pt-3 pb-2">
					<template v-if="settings!.instances.length > 1">
						<PopupTabs
							:model-value="settings!.instances[activeInstance]?.id ?? ''"
							:tabs="instanceTabs"
							@update:model-value="switchInstance"
						/>
						<div class="h-px bg-border"></div>
					</template>

					<PopupTabs :model-value="currentTab" :tabs="tabs" @update:model-value="switchTab" />
					<div class="h-px bg-border"></div>
				</div>

				<div class="flex flex-col gap-2 p-3 pt-0">
					<RouterView />
				</div>
			</div>
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
import {
	CheckCircle2,
	Clock,
	ExternalLink,
	House,
	List,
	Loader2,
	RefreshCw,
	Settings,
	Shield,
	Star,
	Users,
} from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { browser } from 'wxt/browser'

import KofiIcon from '../../assets/icons/kofi.svg?component'
import Logo from '../../assets/logo.svg?component'
import Button from '../../components/Button.vue'
import Card from '../../components/Card.vue'
import { useVIntl } from '../../utils/i18n'
import { getLatestVersionTag } from '../../utils/update-check'
import PopupTabs, { type PopupTab } from './components/PopupTabs.vue'
import { usePopupInstances } from './usePopupInstances'

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
	'popup.tabs.home': { id: 'popup.tabs.home', defaultMessage: 'Home' },
	'popup.tabs.groups': { id: 'popup.tabs.groups', defaultMessage: 'Groups' },
	'popup.tabs.lists': { id: 'popup.tabs.lists', defaultMessage: 'Lists' },
	'popup.tabs.domains': { id: 'popup.tabs.domains', defaultMessage: 'Domains' },
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
})

const route = useRoute()

const version = browser.runtime.getManifest().version
const latestVersion = ref<string | null>(null)
const isLatest = ref(false)
const updateChecking = ref(true)

const {
	loading,
	refreshing,
	configured,
	settings,
	states,
	activeInstance,
	donateVisible,
	dismissDonate,
	refresh,
	openOptions,
	openPihole,
	switchInstance,
	switchTab,
	init,
	dispose,
} = usePopupInstances()

const currentTab = computed(() => {
	const name = route.name
	return name && name !== 'root' ? String(name) : 'home'
})

const messageCount = computed(() => states.value[activeInstance.value]?.summary?.messageCount ?? 0)

const tabs = computed<PopupTab[]>(() => [
	{ id: 'home', label: formatMessage(messages['popup.tabs.home']), icon: House },
	{ id: 'groups', label: formatMessage(messages['popup.tabs.groups']), icon: Users },
	{ id: 'lists', label: formatMessage(messages['popup.tabs.lists']), icon: Shield },
	{ id: 'domains', label: formatMessage(messages['popup.tabs.domains']), icon: List },
])

const instanceTabs = computed<PopupTab[]>(
	() =>
		settings.value?.instances.map((inst, i) => ({
			id: inst.id,
			label:
				inst.name ||
				`${formatMessage(messages['options.piholeselector.instance.fallbackName'])} ${i + 1}`,
			error: Boolean(states.value[i]?.error),
		})) ?? [],
)

onMounted(async () => {
	await init()

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

onUnmounted(() => {
	dispose()
})
</script>
