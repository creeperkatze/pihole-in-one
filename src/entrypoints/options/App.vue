<template>
	<div class="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
		<!-- Sidebar -->
		<aside
			class="w-52 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
		>
			<div class="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
				<img :src="browser.runtime.getURL('/logo.svg')" width="108" alt="Pi-hole In One" />
			</div>
			<nav class="flex flex-col gap-0.5 p-2 flex-1">
				<button
					v-for="tab in tabs"
					:key="tab.id"
					class="flex items-center gap-2.5 px-3 py-2 rounded-[5px] text-sm font-medium text-left w-full transition-colors duration-150 cursor-pointer"
					:class="
						activeTab === tab.id
							? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200 dark:border-zinc-700'
							: 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-50 border border-transparent'
					"
					@click="activeTab = tab.id"
				>
					<component :is="tab.icon" :size="16" />
					{{ tab.label }}
				</button>
			</nav>
		</aside>

		<!-- Content -->
		<main class="flex-1 overflow-y-auto">
			<!-- Connection -->
			<section v-if="activeTab === 'connection'" class="p-8 max-w-xl">
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
					<div class="flex flex-col gap-1.5">
						<label class="font-semibold text-[13px]" for="interval">Badge Refresh Interval</label>
						<div class="flex items-center gap-2">
							<input
								id="interval"
								v-model.number="form.refreshInterval"
								class="input w-28"
								type="number"
								min="60"
								max="3600"
								step="10"
							/>
							<span class="text-sm text-zinc-500 dark:text-zinc-400">seconds</span>
						</div>
						<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
							Minimum 60 s in Chrome (MV3 alarm constraint). Firefox allows lower values.
						</p>
					</div>

					<div class="flex gap-2.5">
						<button type="button" class="btn btn-primary" :disabled="saving" @click="save">
							{{ saving ? 'Saving…' : 'Save' }}
						</button>
					</div>

					<div
						v-if="message"
						class="px-3.5 py-2.5 rounded-[5px] text-[13px] border"
						:class="
							messageType === 'success'
								? 'bg-success-bg border-success-border text-pihole-green'
								: 'bg-danger-bg border-danger-border text-pihole-red'
						"
					>
						{{ message }}
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

				<div class="flex flex-col gap-5">
					<div
						class="flex items-center justify-between gap-4 py-3 border-b border-zinc-200 dark:border-zinc-800"
					>
						<div>
							<div class="text-sm font-medium">Show badge</div>
							<div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
								Display an ON / OFF badge on the extension icon reflecting the current blocking
								state.
							</div>
						</div>
						<button
							type="button"
							role="switch"
							:aria-checked="form.showBadge"
							class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none"
							:class="form.showBadge ? 'bg-pihole-red' : 'bg-zinc-300 dark:bg-zinc-600'"
							@click="form.showBadge = !form.showBadge"
						>
							<span
								class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
								:class="form.showBadge ? 'translate-x-4' : 'translate-x-0'"
							></span>
						</button>
					</div>

					<div class="flex gap-2.5">
						<button type="button" class="btn btn-primary" :disabled="saving" @click="save">
							{{ saving ? 'Saving…' : 'Save' }}
						</button>
					</div>

					<div
						v-if="message"
						class="px-3.5 py-2.5 rounded-[5px] text-[13px] border"
						:class="
							messageType === 'success'
								? 'bg-success-bg border-success-border text-pihole-green'
								: 'bg-danger-bg border-danger-border text-pihole-red'
						"
					>
						{{ message }}
					</div>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
import { Pencil, Plus, Server, SlidersHorizontal, Trash2 } from 'lucide-vue-next'
import { onMounted, reactive, ref } from 'vue'
import { browser } from 'wxt/browser'

import { getSummary } from '../../helpers/api'
import {
	DEFAULTS,
	generateInstanceId,
	getSettings,
	type PiholeInstance,
	type PiholeSettings,
	saveSettings,
} from '../../helpers/settings'

const tabs = [
	{ id: 'connection', label: 'Connection', icon: Server },
	{ id: 'customization', label: 'Customization', icon: SlidersHorizontal },
]

const activeTab = ref('connection')

const form = reactive<PiholeSettings>({ ...DEFAULTS, instances: [] })
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const editingId = ref<string | null>(null)
const testingId = ref<string | null>(null)
const testMessages = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

function showMessage(text: string, type: 'success' | 'error'): void {
	message.value = text
	messageType.value = type
	setTimeout(() => {
		message.value = ''
	}, 4000)
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

async function save(): Promise<void> {
	saving.value = true
	try {
		await saveSettings({ ...form, instances: [...form.instances] })
		showMessage('Settings saved.', 'success')
	} catch (e) {
		showMessage(e instanceof Error ? e.message : 'Failed to save settings.', 'error')
	} finally {
		saving.value = false
	}
}

onMounted(async () => {
	const settings = await getSettings()
	form.instances = settings.instances.map((inst) => ({ ...inst }))
	form.refreshInterval = settings.refreshInterval
	form.showBadge = settings.showBadge
})
</script>
