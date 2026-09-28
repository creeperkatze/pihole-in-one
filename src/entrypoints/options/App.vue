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
					sidebarOpen ? t('options.sidebar.toggle.close') : t('options.sidebar.toggle.open')
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
			class="fixed inset-y-0 inset-s-0 z-40 flex w-52 max-w-[85vw] flex-col border-e border-border-subtle bg-surface-2 transition-transform duration-200 ease-out sm:static sm:z-auto sm:h-screen sm:max-w-none"
			:class="{ 'max-sm:-translate-x-full max-sm:rtl:translate-x-full': !sidebarOpen }"
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
					:aria-label="t('options.sidebar.toggle.close')"
					@click="sidebarOpen = false"
				>
					<ChevronLeft class="size-4 rtl:-scale-x-100" />
				</button>
			</div>
			<div class="flex min-h-0 flex-1 flex-col">
				<nav class="flex flex-1 flex-col gap-1.5 px-3 py-3 sm:p-2">
					<SidebarTab
						v-for="tab in tabs"
						:key="tab.id"
						:icon="tab.icon"
						:label="tab.label"
						:active="route.path === '/' + tab.id"
						@click="handleTabClick('/' + tab.id)"
					/>
				</nav>

				<!-- Bottom cards -->
				<div class="flex flex-col gap-1.5 border-t border-border-subtle p-2">
					<Card
						as="a"
						href="https://ko-fi.com/creeperkatze"
						target="_blank"
						rel="noopener"
						color="#FF5E5B"
						:title="t('options.sidebar.kofi.title')"
						:description="t('options.sidebar.kofi.description')"
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
						:title="t('options.sidebar.crowdin.title')"
						:description="t('options.sidebar.crowdin.description')"
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
						:title="t('options.sidebar.github.title')"
						:description="t('options.sidebar.github.description')"
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
						<span class="truncate">{{ t('options.footer.checking') }}</span>
					</span>
					<a
						v-else-if="isLatest"
						href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
						target="_blank"
						rel="noopener"
						class="flex min-w-0 items-center gap-1 text-xs text-green-500 no-underline transition-colors hover:text-green-400"
					>
						<CheckCircle2 class="size-3.5 shrink-0" aria-hidden="true" />
						<span class="truncate">{{ t('options.footer.latestVersion') }}</span>
					</a>
					<a
						v-else-if="latestVersion"
						href="https://github.com/creeperkatze/pihole-in-one/releases/latest"
						target="_blank"
						rel="noopener"
						class="flex min-w-0 items-center gap-1 text-xs text-yellow-500 no-underline transition-colors hover:text-yellow-400"
					>
						<Clock class="size-3.5 shrink-0" aria-hidden="true" />
						<span class="truncate">{{ t('options.footer.updateAvailable') }}</span>
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
import {
	CheckCircle2,
	ChevronLeft,
	Clock,
	Database,
	Loader2,
	Menu,
	Server,
	SlidersHorizontal,
} from '@lucide/vue'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { browser } from 'wxt/browser'

import CrowdinLogo from '../../assets/icons/crowdin.svg?component'
import GitHubLogo from '../../assets/icons/github.svg?component'
import KofiLogo from '../../assets/icons/kofi.svg?component'
import Logo from '../../assets/logo.svg?component'
import Card from '../../components/Card.vue'
import SidebarTab from '../../components/options/SidebarTab.vue'
import { useSettings } from '../../composables/useSettings'
import { getLatestVersionTag } from '../../utils/update-check'

useSettings()

const router = useRouter()
const route = useRoute()

const { t } = useI18n()

const tabs = computed(() => [
	{ id: 'connection', label: t('options.tabs.connection'), icon: Server },
	{
		id: 'customization',
		label: t('options.tabs.customization'),
		icon: SlidersHorizontal,
	},
	{ id: 'data', label: t('options.tabs.data'), icon: Database },
])

const currentTabTitle = computed(() => {
	return tabs.value.find((tab) => '/' + tab.id === route.path)?.label ?? t('options.title')
})

watchEffect(() => {
	document.title = `Pi-hole In One | ${currentTabTitle.value}`
})

const sidebarOpen = ref(false)

const version = browser.runtime.getManifest().version
const latestVersion = ref<string | null>(null)
const isLatest = ref(false)
const checking = ref(true)

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
