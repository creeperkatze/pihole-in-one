<template>
	<div class="min-h-screen bg-white dark:bg-zinc-900 px-4 py-8">
		<div class="max-w-130 mx-auto">
			<header class="mb-7">
				<img :src="browser.runtime.getURL('/logo.svg')" width="128" alt="Pi-hole In One" />
				<p class="m-0 text-zinc-500 dark:text-zinc-400 text-sm mt-2">
					Configure your Pi-hole connection settings.
				</p>
			</header>

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
						Base URL of your Pi-hole (no trailing slash or <code>/api</code>). Pi-hole v6 uses HTTPS
						by default, e.g. <code>https://pi.hole</code>.
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
						Found in the Pi-hole admin panel under Settings → API / Web interface.
					</p>
				</div>

				<div class="flex flex-col gap-1.5">
					<label class="font-semibold text-[13px]" for="interval">
						Badge Refresh Interval (seconds)
					</label>
					<input
						id="interval"
						v-model.number="form.refreshInterval"
						class="input w-35"
						type="number"
						min="60"
						max="3600"
						step="10"
					/>
					<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						Minimum is 60 seconds in Chrome due to MV3 alarm constraints. Firefox allows lower.
					</p>
				</div>

				<div class="flex gap-2.5 mt-1">
					<button
						type="button"
						class="btn btn-outline"
						:disabled="testing || !form.baseUrl"
						@click="testConnection"
					>
						{{ testing ? 'Testing…' : 'Test Connection' }}
					</button>
					<button type="submit" class="btn btn-primary" :disabled="saving">
						{{ saving ? 'Saving…' : 'Save Settings' }}
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
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { browser } from 'wxt/browser'

import { getSummary } from '../../helpers/api'
import { DEFAULTS, getSettings, type PiholeSettings, saveSettings } from '../../helpers/settings'

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
		showMessage('Settings saved successfully.', 'success')
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
		const status = summary.blocking.blocking ? 'enabled' : 'disabled'
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
