<template>
	<div class="flex min-h-screen flex-col bg-surface-1 sm:h-screen sm:flex-row sm:overflow-hidden">
		<div
			class="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-4 py-4 sm:hidden"
		>
			<Logo class="text-primary" width="108" height="36" />
			<button
				type="button"
				class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-secondary transition-colors hover:bg-surface-3 hover:text-primary"
				:aria-expanded="sidebarOpen"
				:aria-label="
					sidebarOpen
						? formatMessage(messages['options.sidebar.toggle.close'])
						: formatMessage(messages['options.sidebar.toggle.open'])
				"
				@click="sidebarOpen = !sidebarOpen"
			>
				<Menu class="size-4" />
			</button>
		</div>

		<div
			v-if="sidebarOpen"
			class="fixed inset-0 z-30 bg-black/50 sm:hidden"
			@click="sidebarOpen = false"
		/>

		<!-- Sidebar -->
		<aside
			class="fixed inset-y-0 left-0 z-40 flex w-52 max-w-[85vw] flex-col border-r border-border-subtle bg-surface-2 transition-transform duration-200 ease-out sm:static sm:z-auto sm:h-screen sm:max-w-none sm:translate-x-0"
			:class="sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'"
		>
			<div class="flex items-center justify-between border-b border-border-subtle px-4 py-4">
				<a
					href="https://github.com/creeperkatze/pihole-in-one"
					target="_blank"
					rel="noopener"
					class="min-w-0"
				>
					<Logo class="text-primary" width="108" height="36" />
				</a>
				<button
					type="button"
					class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-secondary transition-colors hover:bg-surface-3 hover:text-primary sm:hidden"
					:aria-label="formatMessage(messages['options.sidebar.toggle.close'])"
					@click="sidebarOpen = false"
				>
					<ChevronLeft class="size-4" />
				</button>
			</div>
			<div class="flex min-h-0 flex-1 flex-col">
				<div class="border-b border-border-subtle px-3 py-3 sm:px-2 sm:py-2">
					<div class="relative">
						<Search
							class="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
						/>
						<Input
							v-model="searchQuery"
							type="text"
							:placeholder="formatMessage(messages['options.search.placeholder'])"
							class="w-full rounded-lg pl-9 text-sm py-2"
							:class="searchQuery ? 'pr-8' : 'pr-3'"
						/>
						<button
							v-if="searchQuery"
							type="button"
							class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
							@click="searchQuery = ''"
						>
							<XIcon class="size-4" />
						</button>
					</div>
				</div>
				<nav class="flex flex-1 flex-col gap-1.5 px-3 py-3 sm:p-2">
					<template v-if="!searchQuery">
						<SidebarTab
							v-for="tab in tabs"
							:key="tab.id"
							:icon="tab.icon"
							:label="tab.label"
							:active="route.path === '/' + tab.id"
							@click="handleTabClick('/' + tab.id)"
						/>
					</template>
				</nav>

				<!-- Bottom cards -->
				<div class="flex flex-col gap-1.5 border-t border-border-subtle p-2">
					<Card
						as="a"
						href="https://ko-fi.com/creeperkatze"
						target="_blank"
						rel="noopener"
						color="#FF5E5B"
						:title="formatMessage(messages['options.sidebar.kofi.title'])"
						:description="formatMessage(messages['options.sidebar.kofi.description'])"
						class="no-underline"
					>
						<template #icon>
							<KofiLogo class="size-5 shrink-0 text-[#FF5E5B] opacity-75 group-hover:opacity-100" />
						</template>
					</Card>
					<Card
						as="a"
						href="https://crowdin.com/project/pihole-in-one"
						target="_blank"
						rel="noopener"
						:title="formatMessage(messages['options.sidebar.crowdin.title'])"
						:description="formatMessage(messages['options.sidebar.crowdin.description'])"
						class="no-underline"
					>
						<template #icon>
							<CrowdinLogo
								class="size-5 shrink-0 text-secondary opacity-75 group-hover:opacity-100"
							/>
						</template>
					</Card>
					<Card
						as="a"
						href="https://github.com/creeperkatze/pihole-in-one"
						target="_blank"
						rel="noopener"
						:title="formatMessage(messages['options.sidebar.github.title'])"
						:description="formatMessage(messages['options.sidebar.github.description'])"
						class="no-underline"
					>
						<template #icon>
							<GitHubLogo
								class="size-5 shrink-0 text-secondary opacity-75 group-hover:opacity-100"
							/>
						</template>
					</Card>
				</div>

				<!-- Footer -->
				<div
					class="flex shrink-0 items-center gap-2 border-t border-border-subtle px-3 py-2 sm:py-1.5"
				>
					<span class="shrink-0 text-xs text-secondary">v{{ version }}</span>
					<span v-if="checking" class="flex min-w-0 items-center gap-1 text-xs text-muted">
						<Loader2 class="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
						<span class="truncate">{{ formatMessage(messages['options.footer.checking']) }}</span>
					</span>
					<a
						v-else-if="isLatest"
						href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
						target="_blank"
						rel="noopener"
						class="flex min-w-0 items-center gap-1 text-xs text-green-500 no-underline transition-colors hover:text-green-400"
					>
						<CheckCircle2 class="size-3.5 shrink-0" aria-hidden="true" />
						<span class="truncate">{{
							formatMessage(messages['options.footer.latestVersion'])
						}}</span>
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
							formatMessage(messages['options.footer.updateAvailable'])
						}}</span>
					</a>
				</div>
			</div>
		</aside>

		<!-- Content -->
		<main class="min-w-0 flex-1 overflow-y-auto">
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import {
	AppWindow,
	CheckCircle2,
	ChevronLeft,
	Clock,
	Database,
	Loader2,
	Menu,
	Search,
	Server,
	SlidersHorizontal,
	X as XIcon,
} from '@lucide/vue'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { browser } from 'wxt/browser'

import CrowdinLogo from '../../assets/icons/crowdin.svg?component'
import GitHubLogo from '../../assets/icons/github.svg?component'
import KofiLogo from '../../assets/icons/kofi.svg?component'
import Logo from '../../assets/logo.svg?component'
import Card from '../../components/Card.vue'
import Input from '../../components/Input.vue'
import SidebarTab from '../../components/options/SidebarTab.vue'
import { useSettings } from '../../composables/useSettings'
import { useVIntl } from '../../utils/i18n'
import { getLatestVersionTag } from '../../utils/update-check'

useSettings()

const router = useRouter()
const route = useRoute()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'options.search.placeholder': {
		id: 'options.search.placeholder',
		defaultMessage: 'Search options...',
	},
	'options.sidebar.kofi.title': {
		id: 'options.sidebar.kofi.title',
		defaultMessage: 'Donate on Ko-fi',
	},
	'options.sidebar.toggle.open': {
		id: 'options.sidebar.toggle.open',
		defaultMessage: 'Show sidebar',
	},
	'options.sidebar.toggle.close': {
		id: 'options.sidebar.toggle.close',
		defaultMessage: 'Hide sidebar',
	},
	'options.sidebar.kofi.description': {
		id: 'options.sidebar.kofi.description',
		defaultMessage: 'Buy me a coffee',
	},
	'options.sidebar.crowdin.title': {
		id: 'options.sidebar.crowdin.title',
		defaultMessage: 'View on Crowdin',
	},
	'options.sidebar.crowdin.description': {
		id: 'options.sidebar.crowdin.description',
		defaultMessage: 'Help translate',
	},
	'options.sidebar.github.title': {
		id: 'options.sidebar.github.title',
		defaultMessage: 'View on GitHub',
	},
	'options.sidebar.github.description': {
		id: 'options.sidebar.github.description',
		defaultMessage: 'Leave a star',
	},
	'options.footer.checking': { id: 'options.footer.checking', defaultMessage: 'Checking' },
	'options.footer.latestVersion': {
		id: 'options.footer.latestVersion',
		defaultMessage: 'Latest version',
	},
	'options.footer.updateAvailable': {
		id: 'options.footer.updateAvailable',
		defaultMessage: 'Update available',
	},
	'options.tabs.connection': { id: 'options.tabs.connection', defaultMessage: 'Connection' },
	'options.tabs.customization': {
		id: 'options.tabs.customization',
		defaultMessage: 'Customization',
	},
	'options.tabs.popup': { id: 'options.tabs.popup', defaultMessage: 'Popup' },
	'options.tabs.data': { id: 'options.tabs.data', defaultMessage: 'Data' },
	'options.search.title': { id: 'options.search.title', defaultMessage: 'Search results' },
})

const tabs = computed(() => [
	{ id: 'connection', label: formatMessage(messages['options.tabs.connection']), icon: Server },
	{
		id: 'customization',
		label: formatMessage(messages['options.tabs.customization']),
		icon: SlidersHorizontal,
	},
	{ id: 'popup', label: formatMessage(messages['options.tabs.popup']), icon: AppWindow },
	{ id: 'data', label: formatMessage(messages['options.tabs.data']), icon: Database },
])

const currentTabTitle = computed(() => {
	if (route.path === '/search') return formatMessage(messages['options.search.title'])
	return tabs.value.find((t) => '/' + t.id === route.path)?.label ?? 'Settings'
})

watchEffect(() => {
	document.title = `Pi-hole In One | ${currentTabTitle.value}`
})

const searchQuery = ref('')
const lastTabPath = ref('/connection')
const sidebarOpen = ref(false)

const version = browser.runtime.getManifest().version
const latestVersion = ref<string | null>(null)
const isLatest = ref(false)
const checking = ref(true)

watch(
	route,
	(r) => {
		if (r.path !== '/search') {
			lastTabPath.value = r.path
			searchQuery.value = ''
		} else {
			searchQuery.value = String(r.query.q ?? '')
		}
	},
	{ immediate: true },
)

watch(searchQuery, (q) => {
	if (q) {
		router.push({ path: '/search', query: { q } })
	} else {
		router.push(lastTabPath.value)
	}
})

function handleTabClick(path: string) {
	router.push(path)
	sidebarOpen.value = false
}

onMounted(async () => {
	try {
		const tag = await getLatestVersionTag()

		if (tag && tag !== version) latestVersion.value = tag
		else if (tag) isLatest.value = true
	} catch (err) {
		console.error('[Pi-hole In One] Failed to check for updates:', err)
	} finally {
		checking.value = false
	}
})
</script>
