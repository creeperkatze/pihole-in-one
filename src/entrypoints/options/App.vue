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
					<SearchIcon
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
		</aside>

		<!-- Content -->
		<main class="flex-1 overflow-y-auto">
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import {
	Coffee,
	ExternalLink,
	Search as SearchIcon,
	Server,
	SlidersHorizontal,
	X as XIcon,
} from 'lucide-vue-next'
import { ref, watch } from 'vue'
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
</script>
