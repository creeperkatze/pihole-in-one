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
						:active="activeTab === tab.id"
						@click="activeTab = tab.id"
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
			<!-- Search results -->
			<section v-if="searchQuery" class="flex flex-col">
				<SectionHeader
					title="Search results"
					:description="`Showing options matching &quot;${searchQuery}&quot;`"
				/>
				<div class="px-8 py-4 max-w-xl">
					<div v-if="searchResults.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
						No options found
					</div>
					<div v-else class="flex flex-col">
						<template v-for="opt in searchResults" :key="opt.id">
							<OptionToggle
								v-if="opt.type === 'toggle'"
								:label="opt.label"
								:description="opt.description"
								:model-value="form[opt.formKey]"
								@update:model-value="setOption(opt.formKey, $event)"
							/>
							<OptionSlider
								v-else-if="opt.type === 'slider'"
								:label="opt.label"
								:description="opt.description"
								:model-value="form[opt.formKey]"
								:min="opt.min"
								:max="opt.max"
								:step="opt.step"
								:format="opt.format"
								@update:model-value="setOption(opt.formKey, $event)"
							/>
						</template>
					</div>
				</div>
			</section>

			<!-- Connection -->
			<section v-else-if="activeTab === 'connection'" class="flex flex-col">
				<SectionHeader
					title="Connection"
					description="Manage your Pi-hole instances and badge refresh settings."
				/>
				<div class="px-8 py-4 max-w-xl flex flex-col">
					<OptionPiHoleSelector
						:model-value="form.instances"
						@update:model-value="form.instances = $event"
					/>
					<OptionSlider
						label="Badge Refresh Interval"
						description="Minimum 60s in Chrome (MV3 alarm constraint). Firefox allows lower values."
						:model-value="form.refreshInterval"
						:min="60"
						:max="3600"
						:step="30"
						:format="formatSeconds"
						@update:model-value="form.refreshInterval = $event"
					/>
					<div
						v-if="saveError"
						class="px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
					>
						{{ saveError }}
					</div>
				</div>
			</section>

			<!-- Customization -->
			<section v-else-if="activeTab === 'customization'" class="flex flex-col">
				<SectionHeader
					title="Customization"
					description="Adjust the appearance and behavior of the extension."
				/>
				<div class="px-8 py-4 max-w-xl flex flex-col">
					<OptionToggle
						label="Show badge"
						description="Display an ON / OFF badge on the extension icon reflecting the current blocking state."
						:model-value="form.showBadge"
						@update:model-value="form.showBadge = $event"
					/>
					<div
						v-if="saveError"
						class="mt-3 px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
					>
						{{ saveError }}
					</div>
				</div>
			</section>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { browser } from 'wxt/browser'

import Card from '../../components/Card.vue'
import OptionPiHoleSelector from '../../components/options/OptionPiHoleSelector.vue'
import OptionSlider from '../../components/options/OptionSlider.vue'
import OptionToggle from '../../components/options/OptionToggle.vue'
import SectionHeader from '../../components/options/SectionHeader.vue'
import SidebarTab from '../../components/options/SidebarTab.vue'
import { DEFAULTS, getSettings, type PiholeSettings, saveSettings } from '../../helpers/settings'

function formatSeconds(s: number): string {
	if (s < 60) return `${s}s`
	if (s % 3600 === 0) return `${s / 3600}h`
	return `${Math.round(s / 60)}min`
}

type ToggleOption = {
	id: string
	type: 'toggle'
	label: string
	description: string
	formKey: 'showBadge'
}

type SliderOption = {
	id: string
	type: 'slider'
	label: string
	description: string
	formKey: 'refreshInterval'
	min: number
	max: number
	step: number
	format: (v: number) => string
}

type SimpleOption = ToggleOption | SliderOption

const simpleOptions: SimpleOption[] = [
	{
		id: 'showBadge',
		type: 'toggle',
		label: 'Show badge',
		description:
			'Display an ON / OFF badge on the extension icon reflecting the current blocking state.',
		formKey: 'showBadge',
	},
	{
		id: 'refreshInterval',
		type: 'slider',
		label: 'Badge Refresh Interval',
		description: 'Minimum 60s in Chrome (MV3 alarm constraint). Firefox allows lower values.',
		formKey: 'refreshInterval',
		min: 60,
		max: 3600,
		step: 30,
		format: formatSeconds,
	},
]

const tabs = [
	{ id: 'connection', label: 'Connection', icon: Server },
	{ id: 'customization', label: 'Customization', icon: SlidersHorizontal },
]

const activeTab = ref('connection')
const searchQuery = ref('')

const searchResults = computed(() => {
	const q = searchQuery.value.toLowerCase().trim()
	if (!q) return []
	return simpleOptions.filter(
		(o) => o.label.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
	)
})

const form = reactive<PiholeSettings>({ ...DEFAULTS, instances: [] })
const saveError = ref('')
const initialized = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | null = null

watch(
	form,
	() => {
		if (!initialized.value) return
		if (saveTimer) clearTimeout(saveTimer)
		saveTimer = setTimeout(async () => {
			try {
				await saveSettings({ ...form, instances: [...form.instances] })
				saveError.value = ''
			} catch (e) {
				saveError.value = e instanceof Error ? e.message : 'Failed to save settings.'
			}
		}, 600)
	},
	{ deep: true },
)

function setOption(key: 'showBadge' | 'refreshInterval', value: boolean | number): void {
	;(form as Record<string, unknown>)[key] = value
}

onMounted(async () => {
	const settings = await getSettings()
	form.instances = settings.instances.map((inst) => ({ ...inst }))
	form.refreshInterval = settings.refreshInterval
	form.showBadge = settings.showBadge
	initialized.value = true
})
</script>
