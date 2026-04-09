<template>
	<div
		class="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
	>
		<div class="flex items-center gap-2.5 min-w-0">
			<span
				class="w-2 h-2 rounded-full shrink-0"
				:class="dotClass === 'allowed' ? 'bg-pihole-green' : 'bg-pihole-red'"
			></span>
			<div class="min-w-0">
				<div class="text-[13px] font-semibold truncate max-w-45" :title="domain">
					{{ domain }}
				</div>
				<div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-px">{{ statusText }}</div>
			</div>
		</div>
		<div
			v-if="loading"
			class="w-4 h-4 border-2 border-zinc-200 dark:border-zinc-700 border-t-pihole-red rounded-full animate-spin shrink-0"
		></div>
		<button v-else-if="!gravityOnly" class="btn btn-sm" :disabled="acting" @click="toggle">
			{{ blockedByUser ? 'Unblock' : 'Block' }}
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { blockDomain, searchDomain, unblockDomain } from '../../../helpers/api'
import type { PiholeInstance } from '../../../helpers/settings'

const props = defineProps<{
	domain: string
	instances: PiholeInstance[]
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

// Search on the first instance; block/unblock applies to all
const primary = computed(() => props.instances[0])

async function fetchStatus(): Promise<void> {
	if (!primary.value) return
	const result = await searchDomain(primary.value.baseUrl, primary.value.apiPassword, props.domain)
	blockedByUser.value = result.domains.some(
		(d) => d.type === 'deny' && d.kind === 'exact' && d.enabled,
	)
	blockedByGravity.value = result.gravity.length > 0
}

async function toggle(): Promise<void> {
	acting.value = true
	try {
		await Promise.all(
			props.instances.map((inst) =>
				blockedByUser.value
					? unblockDomain(inst.baseUrl, inst.apiPassword, props.domain)
					: blockDomain(inst.baseUrl, inst.apiPassword, props.domain),
			),
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
