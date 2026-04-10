<template>
	<div class="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
		<!-- Sidebar -->
		<aside
			class="w-52 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
		>
			<div class="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
				<a href="https://github.com/creeperkatze/pihole-in-one" target="_blank" rel="noopener">
					<img :src="browser.runtime.getURL('/logo.svg')" width="108" alt="Pi-hole In One" />
				</a>
			</div>
			<div class="px-2 pt-2">
				<div class="relative">
					<Search
						:size="15"
						class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-50 pointer-events-none"
					/>
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Search options…"
						class="input pl-9 text-sm py-2"
						:class="searchQuery ? 'pr-8' : ''"
					/>
					<button
						v-if="searchQuery"
						type="button"
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
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
				<div
					v-else
					class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400"
				>
					<SearchIcon :size="16" />
					Search results
				</div>
			</nav>

			<!-- Bottom cards -->
			<div class="border-t border-zinc-200 dark:border-zinc-800 p-2 flex flex-col gap-1.5">
				<Card
					as="a"
					href="https://ko-fi.com/creeperkatze"
					target="_blank"
					rel="noopener"
					color="#FF5E5B"
					title="Support on Ko-fi"
					description="Every tip is truly appreciated"
					class="no-underline"
				>
					<template #icon>
						<Coffee :size="16" class="shrink-0 text-[#FF5E5B] opacity-75 group-hover:opacity-100" />
					</template>
				</Card>
				<Card
					as="a"
					href="https://github.com/creeperkatze/pihole-in-one"
					target="_blank"
					rel="noopener"
					title="View on GitHub"
					description="Star if you like it"
					class="no-underline"
				>
					<template #icon>
						<ExternalLink
							:size="16"
							class="shrink-0 text-zinc-500 dark:text-zinc-400 opacity-75 group-hover:opacity-100"
						/>
					</template>
				</Card>
			</div>

			<!-- Footer -->
			<div
				class="flex shrink-0 items-center gap-2 px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-800"
			>
				<span class="text-xs text-zinc-400">v{{ version }}</span>
				<span v-if="checking" class="flex items-center gap-1 text-xs text-zinc-400">
					<Loader2 :size="12" class="animate-spin" aria-hidden="true" />
					Checking
				</span>
				<a
					v-else-if="isLatest"
					href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
					target="_blank"
					rel="noopener"
					class="flex items-center gap-1 text-xs text-green-500 no-underline transition-colors hover:text-green-400"
				>
					<CheckCircle2 :size="12" aria-hidden="true" />
					Latest version
				</a>
				<a
					v-else-if="latestVersion"
					href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
					target="_blank"
					rel="noopener"
					class="flex items-center gap-1 text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-400"
				>
					<Clock :size="12" aria-hidden="true" />
					Update available
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
import {
	CheckCircle2,
	Clock,
	Coffee,
	ExternalLink,
	Loader2,
	Search,
	Server,
	SlidersHorizontal,
	X as XIcon,
} from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { browser } from 'wxt/browser'

import Card from '../../components/Card.vue'
import SidebarTab from '../../components/options/SidebarTab.vue'

const router = useRouter()
const route = useRoute()

const tabs = [
	{ id: 'connection', label: 'Connection', icon: Server },
	{ id: 'customization', label: 'Customization', icon: SlidersHorizontal },
]

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
