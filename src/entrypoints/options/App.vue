<template>
	<div class="flex h-screen overflow-hidden bg-surface-1">
		<!-- Sidebar -->
		<aside class="w-52 shrink-0 flex flex-col border-r border-border-subtle bg-surface-2">
			<div class="px-4 py-4 border-b border-border-subtle">
				<a href="https://github.com/creeperkatze/pihole-in-one" target="_blank" rel="noopener">
					<Logo class="text-primary" width="108" height="36" />
				</a>
			</div>
			<div class="px-2 py-2 border-b border-border-subtle">
				<div class="relative">
					<Search
						:size="15"
						class="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
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
						<XIcon :size="14" />
					</button>
				</div>
			</div>
			<nav class="flex flex-col gap-1.5 p-2 flex-1">
				<template v-if="!searchQuery">
					<SidebarTab
						v-for="tab in tabs"
						:key="tab.id"
						:icon="tab.icon"
						:label="tab.label"
						:active="route.path === '/' + tab.id"
						@click="router.push('/' + tab.id)"
					/>
				</template>
			</nav>

			<!-- Bottom cards -->
			<div class="border-t border-border-subtle p-2 flex flex-col gap-1.5">
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
						<Kofi class="size-5 shrink-0 text-[#FF5E5B] opacity-75 group-hover:opacity-100" />
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
						<ExternalLink
							class="size-5 shrink-0 text-secondary opacity-75 group-hover:opacity-100"
						/>
					</template>
				</Card>
			</div>

			<!-- Footer -->
			<div class="flex shrink-0 items-center gap-2 px-3 py-1.5 border-t border-border-subtle">
				<span class="text-xs text-secondary">v{{ version }}</span>
				<span v-if="checking" class="flex items-center gap-1 text-xs text-muted">
					<Loader2 :size="12" class="animate-spin" aria-hidden="true" />
					{{ formatMessage(messages['options.footer.checking']) }}
				</span>
				<a
					v-else-if="isLatest"
					href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
					target="_blank"
					rel="noopener"
					class="flex items-center gap-1 text-xs text-green-500 no-underline transition-colors hover:text-green-400"
				>
					<CheckCircle2 :size="12" aria-hidden="true" />
					{{ formatMessage(messages['options.footer.latestVersion']) }}
				</a>
				<a
					v-else-if="latestVersion"
					href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
					target="_blank"
					rel="noopener"
					class="flex items-center gap-1 text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-400"
				>
					<Clock :size="12" aria-hidden="true" />
					{{ formatMessage(messages['options.footer.updateAvailable']) }}
				</a>
			</div>
		</aside>

		<!-- Content -->
		<main class="flex-1 overflow-y-auto">
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import {
	Activity,
	CheckCircle2,
	Clock,
	ExternalLink,
	Loader2,
	Search,
	Server,
	SlidersHorizontal,
	X as XIcon,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { browser } from 'wxt/browser'

import Kofi from '../../assets/icons/kofi.svg?component'
import Logo from '../../assets/logo.svg?component'
import Card from '../../components/Card.vue'
import Input from '../../components/Input.vue'
import SidebarTab from '../../components/options/SidebarTab.vue'
import { useSettings } from '../../composables/useSettings'
import { useVIntl } from '../../helpers/i18n'

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
		defaultMessage: 'Support on Ko-fi',
	},
	'options.sidebar.kofi.description': {
		id: 'options.sidebar.kofi.description',
		defaultMessage: 'Buy me a coffee',
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
	'options.tabs.privacy': { id: 'options.tabs.privacy', defaultMessage: 'Diagnostics' },
})

const tabs = computed(() => [
	{ id: 'connection', label: formatMessage(messages['options.tabs.connection']), icon: Server },
	{
		id: 'customization',
		label: formatMessage(messages['options.tabs.customization']),
		icon: SlidersHorizontal,
	},
	{ id: 'diagnostics', label: formatMessage(messages['options.tabs.privacy']), icon: Activity },
])

const searchQuery = ref('')
const lastTabPath = ref('/connection')

const version = browser.runtime.getManifest().version
const latestVersion = ref<string | null>(null)
const isLatest = ref(false)
const checking = ref(true)

watch(route, (r) => {
	if (r.path !== '/search') lastTabPath.value = r.path
})

watch(searchQuery, (q) => {
	if (q) {
		router.push({ path: '/search', query: { q } })
	} else {
		router.push(lastTabPath.value)
	}
})

onMounted(async () => {
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
		checking.value = false
	}
})
</script>
