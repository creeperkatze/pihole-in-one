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
						Configure how the extension connects to your Pi-hole.
					</p>
				</div>

				<form class="flex flex-col gap-5" @submit.prevent="save">
					<div class="flex flex-col gap-1.5">
						<label class="font-semibold text-[13px]" for="baseUrl">Pi-hole URL</label>
						<input
							id="baseUrl"
							v-model="form.baseUrl"
							class="input"
							type="url"
							placeholder="https://pi.hole"
							required
						/>
						<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
							Base URL of your Pi-hole — no trailing slash or
							<code class="font-mono">/api</code>. Pi-hole v6 uses HTTPS by default, e.g.
							<code class="font-mono">https://pi.hole</code>.
						</p>
					</div>

					<div class="flex flex-col gap-1.5">
						<label class="font-semibold text-[13px]" for="password">API Password</label>
						<input
							id="password"
							v-model="form.apiPassword"
							class="input"
							type="password"
							placeholder="Leave empty if none is set"
							autocomplete="current-password"
						/>
						<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
							Found in Pi-hole → Settings → API. Leave blank for passwordless installations.
						</p>
					</div>

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

					<div class="h-px bg-zinc-200 dark:bg-zinc-700 -mx-0.5"></div>

					<div class="flex gap-2.5">
						<button
							type="button"
							class="btn btn-outline"
							:disabled="testing || !form.baseUrl"
							@click="testConnection"
						>
							{{ testing ? 'Testing…' : 'Test Connection' }}
						</button>
						<button type="submit" class="btn btn-primary" :disabled="saving">
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
				</form>
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
import { Server, SlidersHorizontal } from 'lucide-vue-next'
import { onMounted, reactive, ref } from 'vue'
import { browser } from 'wxt/browser'

import { getSummary } from '../../helpers/api'
import { DEFAULTS, getSettings, type PiholeSettings, saveSettings } from '../../helpers/settings'

const tabs = [
	{ id: 'connection', label: 'Connection', icon: Server },
	{ id: 'customization', label: 'Customization', icon: SlidersHorizontal },
]

const activeTab = ref('connection')

const form = reactive<PiholeSettings>({ ...DEFAULTS })
const saving = ref(false)
const testing = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

function showMessage(text: string, type: 'success' | 'error'): void {
	message.value = text
	messageType.value = type
	setTimeout(() => {
		message.value = ''
	}, 4000)
}

async function save(): Promise<void> {
	saving.value = true
	try {
		await saveSettings({ ...form })
		showMessage('Settings saved.', 'success')
	} catch (e) {
		showMessage(e instanceof Error ? e.message : 'Failed to save settings.', 'error')
	} finally {
		saving.value = false
	}
}

async function testConnection(): Promise<void> {
	testing.value = true
	message.value = ''
	try {
		const summary = await getSummary(form.baseUrl, form.apiPassword)
		const blocked = summary.queries.blocked.toLocaleString()
		const total = summary.queries.total.toLocaleString()
		const status = summary.blocking.blocking === 'enabled' ? 'enabled' : 'disabled'
		showMessage(
			`Connected! Blocking ${status}. ${blocked} / ${total} queries blocked today.`,
			'success',
		)
	} catch (e) {
		showMessage(e instanceof Error ? e.message : 'Connection failed.', 'error')
	} finally {
		testing.value = false
	}
}

onMounted(async () => {
	const settings = await getSettings()
	Object.assign(form, settings)
})
</script>
