<template>
	<div
		class="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg border transition-colors duration-150"
		:class="
			allowlistedByUser
				? 'bg-success-bg border-success-border'
				: isEffectivelyBlocked
					? 'bg-danger-bg border-danger-border'
					: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
		"
	>
		<div class="min-w-0">
			<div class="text-[13px] font-semibold truncate max-w-45" :title="domain">
				{{ domain }}
			</div>
			<div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-px">{{ statusText }}</div>
		</div>
		<div
			v-if="loading"
			class="w-4 h-4 border-2 border-zinc-200 dark:border-zinc-700 border-t-pihole-red rounded-full animate-spin shrink-0"
		></div>
		<div v-else class="flex gap-1.5 shrink-0">
			<Button
				size="small"
				:variant="allowlistedByUser ? 'success' : 'outline'"
				:disabled="acting"
				:title="allowlistedByUser ? 'Remove from whitelist' : 'Whitelist'"
				@click="toggleAllowlist"
			>
				<Check :size="13" />
			</Button>
			<Button
				size="small"
				:variant="blockedByUser ? 'danger' : 'outline'"
				:disabled="acting"
				:title="blockedByUser ? 'Unblock' : 'Block'"
				@click="toggleBlock"
			>
				<X :size="13" />
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import Button from '../../../components/Button.vue'
import {
	allowlistDomain,
	blockDomain,
	deleteDomainEntry,
	type DomainEntry,
	searchDomain,
} from '../../../helpers/api'
import type { PiholeInstance } from '../../../helpers/settings'

const props = defineProps<{
	domain: string
	instances: PiholeInstance[]
}>()

const loading = ref(true)
const acting = ref(false)
const denyEntries = ref<DomainEntry[]>([])
const allowEntries = ref<DomainEntry[]>([])
const gravityListNames = ref<string[]>([])

const blockedByUser = computed(() => denyEntries.value.length > 0)
const allowlistedByUser = computed(() => allowEntries.value.length > 0)
const blockedByGravity = computed(() => gravityListNames.value.length > 0)

const isEffectivelyBlocked = computed(
	() => (blockedByUser.value || blockedByGravity.value) && !allowlistedByUser.value,
)

function listName(address: string, comment: string | null): string {
	if (comment) return comment
	try {
		const url = new URL(address)
		const parts = url.pathname.split('/').filter(Boolean)
		return parts.at(-1) ?? url.hostname
	} catch {
		return address
	}
}

const statusText = computed(() => {
	if (allowlistedByUser.value) return 'Whitelisted by user'
	if (blockedByUser.value) return 'Blocked by user'
	if (gravityListNames.value.length === 1) return gravityListNames.value[0]
	if (gravityListNames.value.length > 1)
		return `Blocked by "${gravityListNames.value[0]}" +${gravityListNames.value.length - 1} more`
	return 'Not blocked'
})

const primary = computed(() => props.instances[0])

async function fetchStatus(): Promise<void> {
	if (!primary.value) return
	const result = await searchDomain(primary.value.baseUrl, primary.value.apiPassword, props.domain)
	denyEntries.value = result.domains.filter((d) => d.type === 'deny' && d.enabled)
	allowEntries.value = result.domains.filter((d) => d.type === 'allow' && d.enabled)
	gravityListNames.value = result.gravity.map((g) => listName(g.address, g.comment))
}

async function deleteEntries(inst: PiholeInstance, entries: DomainEntry[]): Promise<void> {
	await Promise.all(
		entries.map((e) => deleteDomainEntry(inst.baseUrl, inst.apiPassword, e.type, e.kind, e.domain)),
	)
}

async function toggleAllowlist(): Promise<void> {
	acting.value = true
	try {
		await Promise.all(
			props.instances.map(async (inst) => {
				if (allowlistedByUser.value) {
					await deleteEntries(inst, allowEntries.value)
				} else {
					await deleteEntries(inst, denyEntries.value)
					await allowlistDomain(inst.baseUrl, inst.apiPassword, props.domain)
				}
			}),
		)
		await fetchStatus()
	} finally {
		acting.value = false
	}
}

async function toggleBlock(): Promise<void> {
	acting.value = true
	try {
		await Promise.all(
			props.instances.map(async (inst) => {
				if (blockedByUser.value) {
					await deleteEntries(inst, denyEntries.value)
				} else {
					await deleteEntries(inst, allowEntries.value)
					await blockDomain(inst.baseUrl, inst.apiPassword, props.domain)
				}
			}),
		)
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
