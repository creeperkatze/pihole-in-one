<template>
	<div class="domain-card">
		<div class="domain-info">
			<span class="domain-dot" :class="dotClass"></span>
			<div class="domain-text">
				<div class="domain-name" :title="domain">{{ domain }}</div>
				<div class="domain-status">{{ statusText }}</div>
			</div>
		</div>
		<div v-if="loading" class="domain-spinner"></div>
		<button
			v-else-if="!gravityOnly"
			class="btn btn-sm"
			:class="blockedByUser ? 'btn-success' : 'btn-danger'"
			:disabled="acting"
			@click="toggle"
		>
			{{ blockedByUser ? 'Unblock' : 'Block' }}
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { blockDomain, searchDomain, unblockDomain } from '../../../helpers/api'
import type { PiholeSettings } from '../../../helpers/settings'

const props = defineProps<{
	domain: string
	settings: PiholeSettings
}>()

const loading = ref(true)
const acting = ref(false)
const blockedByUser = ref(false)
const blockedByGravity = ref(false)

const gravityOnly = computed(() => blockedByGravity.value && !blockedByUser.value)

const dotClass = computed(() => {
	if (blockedByUser.value) return 'user'
	if (blockedByGravity.value) return 'gravity'
	return 'allowed'
})

const statusText = computed(() => {
	if (blockedByUser.value) return 'Blocked by you'
	if (blockedByGravity.value) return 'Blocked by list'
	return 'Not blocked'
})

async function fetchStatus(): Promise<void> {
	const result = await searchDomain(props.settings.baseUrl, props.settings.apiPassword, props.domain)
	blockedByUser.value = result.domains.some((d) => d.type === 'deny' && d.kind === 'exact' && d.enabled)
	blockedByGravity.value = result.gravity.length > 0
}

async function toggle(): Promise<void> {
	acting.value = true
	try {
		if (blockedByUser.value) {
			await unblockDomain(props.settings.baseUrl, props.settings.apiPassword, props.domain)
		} else {
			await blockDomain(props.settings.baseUrl, props.settings.apiPassword, props.domain)
		}
		await fetchStatus()
	} finally {
		acting.value = false
	}
}

onMounted(async () => {
	try {
		await fetchStatus()
	} finally {
		loading.value = false
	}
})
</script>

<style scoped>
.domain-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	padding: 10px 14px;
	border-radius: var(--radius);
	border: 1px solid var(--border);
	background: var(--bg-secondary);
}

.domain-info {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 0;
}

.domain-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	flex-shrink: 0;
	background: var(--text-muted);
}

.domain-dot.user {
	background: var(--danger);
}

.domain-dot.gravity {
	background: var(--accent);
}

.domain-dot.allowed {
	background: var(--success);
}

.domain-text {
	min-width: 0;
}

.domain-name {
	font-size: 13px;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 180px;
}

.domain-status {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 1px;
}

.domain-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid var(--border);
	border-top-color: var(--accent);
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
	flex-shrink: 0;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
