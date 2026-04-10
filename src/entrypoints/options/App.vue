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
						type="search"
						placeholder="Search options…"
						class="input pl-9 text-sm py-2"
					/>
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
			<section v-if="searchQuery" class="p-8 max-w-xl">
				<div class="mb-6">
					<h1 class="text-base font-semibold m-0">Search results</h1>
					<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
						Showing options matching "{{ searchQuery }}"
					</p>
				</div>
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
			</section>

			<!-- Connection -->
			<section v-else-if="activeTab === 'connection'" class="p-8 max-w-xl">
				<div class="mb-6">
					<h1 class="text-base font-semibold m-0">Connection</h1>
					<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
						Manage your Pi-hole instances and badge refresh settings.
					</p>
				</div>

				<div class="flex flex-col gap-6">
					<!-- Instance list -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between mb-1">
							<span class="font-semibold text-[13px]">Pi-holes</span>
							<button type="button" class="btn btn-sm btn-outline" @click="addInstance">
								<Plus :size="13" />
								Add Pi-hole
							</button>
						</div>

						<div
							v-if="form.instances.length === 0"
							class="flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 text-sm"
						>
							<Server :size="22" class="opacity-40" />
							No Pi-holes configured. Add one to get started.
						</div>

						<div
							v-for="inst in form.instances"
							:key="inst.id"
							class="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
						>
							<!-- Collapsed row -->
							<div
								v-if="editingId !== inst.id"
								class="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50"
							>
								<div class="min-w-0">
									<div class="text-sm font-medium truncate">
										{{ inst.name || 'Pi-hole' }}
									</div>
									<div class="text-xs text-zinc-500 dark:text-zinc-400 truncate">
										{{ inst.baseUrl || 'No URL set' }}
									</div>
								</div>
								<div class="flex gap-1.5 shrink-0">
									<button type="button" class="btn btn-sm btn-outline" @click="startEdit(inst.id)">
										<Pencil :size="12" />
										Edit
									</button>
									<button
										type="button"
										class="btn btn-sm btn-outline text-pihole-red border-pihole-red/30 hover:bg-pihole-red/10"
										@click="removeInstance(inst.id)"
									>
										<Trash2 :size="12" />
									</button>
								</div>
							</div>

							<!-- Expanded edit form -->
							<div v-else class="flex flex-col gap-4 p-4">
								<div class="flex flex-col gap-1.5">
									<label class="font-semibold text-[13px]" :for="`name-${inst.id}`">Name</label>
									<input
										:id="`name-${inst.id}`"
										v-model="inst.name"
										class="input"
										type="text"
										placeholder="Pi-hole"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label class="font-semibold text-[13px]" :for="`url-${inst.id}`">URL</label>
									<input
										:id="`url-${inst.id}`"
										v-model="inst.baseUrl"
										class="input"
										type="url"
										placeholder="https://pi.hole"
									/>
									<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
										No trailing slash or
										<code class="font-mono">/api</code>.
									</p>
								</div>
								<div class="flex flex-col gap-1.5">
									<label class="font-semibold text-[13px]" :for="`pass-${inst.id}`"
										>API Password</label
									>
									<input
										:id="`pass-${inst.id}`"
										v-model="inst.apiPassword"
										class="input"
										type="password"
										placeholder="Leave empty if none is set"
										autocomplete="off"
									/>
									<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
										Found in Pi-hole → Settings → API.
									</p>
								</div>

								<div class="flex items-center gap-2 flex-wrap">
									<button
										type="button"
										class="btn btn-outline"
										:disabled="testingId === inst.id || !inst.baseUrl"
										@click="testInstance(inst.id)"
									>
										{{ testingId === inst.id ? 'Testing…' : 'Test Connection' }}
									</button>
									<button type="button" class="btn" @click="editingId = null">Done</button>
								</div>

								<div
									v-if="testMessages[inst.id]"
									class="px-3 py-2 rounded-[5px] text-xs border"
									:class="
										testMessages[inst.id].type === 'success'
											? 'bg-success-bg border-success-border text-pihole-green'
											: 'bg-danger-bg border-danger-border text-pihole-red'
									"
								>
									{{ testMessages[inst.id].text }}
								</div>
							</div>
						</div>
					</div>

					<div class="h-px bg-zinc-200 dark:bg-zinc-700"></div>

					<!-- Refresh interval -->
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
			<section v-if="activeTab === 'customization'" class="p-8 max-w-xl">
				<div class="mb-6">
					<h1 class="text-base font-semibold m-0">Customization</h1>
					<p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
						Adjust the appearance and behavior of the extension.
					</p>
				</div>

				<div class="flex flex-col">
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
	Pencil,
	Plus,
	Search as SearchIcon,
	Server,
	SlidersHorizontal,
	Trash2,
} from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { browser } from 'wxt/browser'

import Card from '../../components/Card.vue'
import OptionSlider from '../../components/options/OptionSlider.vue'
import OptionToggle from '../../components/options/OptionToggle.vue'
import SidebarTab from '../../components/options/SidebarTab.vue'
import { getSummary } from '../../helpers/api'
import {
	DEFAULTS,
	generateInstanceId,
	getSettings,
	type PiholeInstance,
	type PiholeSettings,
	saveSettings,
} from '../../helpers/settings'

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

const editingId = ref<string | null>(null)
const testingId = ref<string | null>(null)
const testMessages = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

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

function addInstance(): void {
	const inst: PiholeInstance = {
		id: generateInstanceId(),
		name: '',
		baseUrl: '',
		apiPassword: '',
	}
	form.instances.push(inst)
	editingId.value = inst.id
}

function startEdit(id: string): void {
	editingId.value = id
}

function removeInstance(id: string): void {
	const idx = form.instances.findIndex((inst) => inst.id === id)
	if (idx !== -1) form.instances.splice(idx, 1)
	if (editingId.value === id) editingId.value = null
	delete testMessages.value[id]
}

async function testInstance(id: string): Promise<void> {
	const inst = form.instances.find((i) => i.id === id)
	if (!inst) return
	testingId.value = id
	delete testMessages.value[id]
	try {
		const summary = await getSummary(inst.baseUrl, inst.apiPassword)
		const blocked = summary.queries.blocked.toLocaleString()
		const total = summary.queries.total.toLocaleString()
		const status = summary.blocking.blocking === 'enabled' ? 'enabled' : 'disabled'
		testMessages.value[id] = {
			text: `Connected! Blocking ${status}. ${blocked} / ${total} queries blocked today.`,
			type: 'success',
		}
	} catch (e) {
		testMessages.value[id] = {
			text: e instanceof Error ? e.message : 'Connection failed.',
			type: 'error',
		}
	} finally {
		testingId.value = null
	}
}

onMounted(async () => {
	const settings = await getSettings()
	form.instances = settings.instances.map((inst) => ({ ...inst }))
	form.refreshInterval = settings.refreshInterval
	form.showBadge = settings.showBadge
	initialized.value = true
})
</script>
