<template>
	<div class="page">
		<div class="container">
			<header class="page-header">
				<div class="page-title">
					<span class="pihole-dot"></span>
					Pi-hole Controller
				</div>
				<p class="page-sub">Configure your Pi-hole connection settings.</p>
			</header>

			<form class="form" @submit.prevent="save">
				<div class="form-group">
					<label class="label" for="baseUrl">Pi-hole URL</label>
					<input
						id="baseUrl"
						v-model="form.baseUrl"
						class="input"
						type="url"
						placeholder="https://pi.hole"
						required
					/>
					<p class="hint">
						Base URL of your Pi-hole (no trailing slash or <code>/api</code>). Pi-hole v6
						uses HTTPS by default, e.g. <code>https://pi.hole</code>.
					</p>
				</div>

				<div class="form-group">
					<label class="label" for="password">API Password</label>
					<input
						id="password"
						v-model="form.apiPassword"
						class="input"
						type="password"
						placeholder="Leave empty if none is set"
						autocomplete="current-password"
					/>
					<p class="hint">
						Found in the Pi-hole admin panel under Settings → API / Web interface.
					</p>
				</div>

				<div class="form-group">
					<label class="label" for="interval">Badge Refresh Interval (seconds)</label>
					<input
						id="interval"
						v-model.number="form.refreshInterval"
						class="input input-sm"
						type="number"
						min="60"
						max="3600"
						step="10"
					/>
					<p class="hint">
						Minimum is 60 seconds in Chrome due to MV3 alarm constraints. Firefox allows lower.
					</p>
				</div>

				<div class="form-actions">
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

				<div v-if="message" class="message" :class="messageType">
					{{ message }}
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

import { getSummary } from '../../helpers/api'
import { DEFAULTS, getSettings, saveSettings, type PiholeSettings } from '../../helpers/settings'

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
		showMessage(`Connected! Blocking ${status}. ${blocked} / ${total} queries blocked today.`, 'success')
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

<style scoped>
.page {
	min-height: 100vh;
	background: var(--bg);
	padding: 32px 16px;
}

.container {
	max-width: 520px;
	margin: 0 auto;
}

.page-header {
	margin-bottom: 28px;
}

.page-title {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 20px;
	font-weight: 700;
	margin-bottom: 6px;
}

.pihole-dot {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: var(--accent);
	flex-shrink: 0;
}

.page-sub {
	margin: 0;
	color: var(--text-muted);
	font-size: 14px;
}

.form {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.label {
	font-weight: 600;
	font-size: 13px;
}

.input {
	padding: 8px 12px;
	border: 1px solid var(--border);
	border-radius: var(--radius-sm);
	background: var(--bg-secondary);
	transition: border-color 0.15s;
	outline: none;
	width: 100%;
}

.input:focus {
	border-color: var(--accent);
}

.input-sm {
	width: 140px;
}

.hint {
	margin: 0;
	font-size: 12px;
	color: var(--text-muted);
}

.form-actions {
	display: flex;
	gap: 10px;
	margin-top: 4px;
}

.message {
	padding: 10px 14px;
	border-radius: var(--radius-sm);
	font-size: 13px;
}

.message.success {
	background: var(--success-bg);
	border: 1px solid var(--success-border);
	color: var(--success);
}

.message.error {
	background: var(--danger-bg);
	border: 1px solid var(--danger-border);
	color: var(--danger);
}
</style>
