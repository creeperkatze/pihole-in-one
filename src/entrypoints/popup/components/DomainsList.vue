<template>
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center gap-1.5">
			<input
				v-model="newDomain"
				type="text"
				:placeholder="formatMessage(messages['popup.domains.list.placeholder'])"
				:disabled="adding"
				class="min-w-0 flex-1 px-2.5 py-1.5 rounded-[5px] border border-border bg-surface-1 text-xs text-primary placeholder:text-muted outline-none focus:border-pihole-red disabled:opacity-50"
				@keydown.enter="addDomain"
			/>
			<div class="flex gap-0.5 p-0.5 rounded-[5px] bg-surface-3 shrink-0">
				<button
					type="button"
					class="px-2 py-1 rounded-[3px] text-[11px] font-medium transition-colors duration-150 cursor-pointer"
					:class="
						newType === 'allow'
							? 'bg-surface-raised text-primary shadow-xs'
							: 'text-secondary hover:text-primary'
					"
					@click="newType = 'allow'"
				>
					{{ formatMessage(messages['popup.domains.action.whitelist']) }}
				</button>
				<button
					type="button"
					class="px-2 py-1 rounded-[3px] text-[11px] font-medium transition-colors duration-150 cursor-pointer"
					:class="
						newType === 'deny'
							? 'bg-surface-raised text-primary shadow-xs'
							: 'text-secondary hover:text-primary'
					"
					@click="newType = 'deny'"
				>
					{{ formatMessage(messages['popup.domains.action.block']) }}
				</button>
			</div>
			<Button size="small" :disabled="!newDomain.trim() || adding" @click="addDomain">
				{{ formatMessage(messages['popup.domains.list.add']) }}
			</Button>
		</div>

		<div v-if="addError" class="text-xs text-pihole-red py-0.5">{{ addError }}</div>

		<div v-if="loading" class="flex items-center justify-center py-4">
			<div
				class="w-4 h-4 border-2 border-border border-t-pihole-red rounded-full animate-spin"
			></div>
		</div>

		<div v-else-if="loadError" class="text-xs text-pihole-red py-1">{{ loadError }}</div>

		<div v-else-if="entries.length === 0" class="text-xs text-secondary py-1 text-center">
			{{ formatMessage(messages['popup.domains.list.empty']) }}
		</div>

		<div v-else class="flex flex-col gap-1.5 max-h-45 overflow-y-auto">
			<div
				v-for="entry in entries"
				:key="`${entry.type}:${entry.kind}:${entry.domain}`"
				class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-border bg-surface-3"
			>
				<div class="flex min-w-0 items-center gap-2">
					<span
						class="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
						:class="
							entry.type === 'allow'
								? 'bg-success-bg text-pihole-green'
								: 'bg-danger-bg text-pihole-red'
						"
					>
						{{
							entry.type === 'allow'
								? formatMessage(messages['popup.domains.whitelisted'])
								: formatMessage(messages['popup.domains.blocked'])
						}}
					</span>
					<span
						class="text-xs font-medium text-primary truncate"
						:class="{ 'font-mono': entry.kind === 'regex' }"
						:title="entry.domain"
					>
						{{ entry.domain }}
					</span>
				</div>
				<button
					type="button"
					class="flex shrink-0 items-center justify-center size-6 border-0 rounded-[5px] bg-transparent text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					:disabled="removing === entry.domain"
					:title="formatMessage(messages['popup.domains.list.remove'])"
					@click="removeEntry(entry)"
				>
					<X class="size-3.5" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { X } from '@lucide/vue'
import type { DomainEntry, DomainType } from 'pihole-js'
import { onMounted, ref } from 'vue'

import Button from '../../../components/Button.vue'
import { getPiHoleClient } from '../../../utils/api'
import { useVIntl } from '../../../utils/i18n'
import type { PiholeInstance } from '../../../utils/settings'

const props = defineProps<{
	instances: PiholeInstance[]
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.domains.list.placeholder': {
		id: 'popup.domains.list.placeholder',
		defaultMessage: 'example.com',
	},
	'popup.domains.action.whitelist': {
		id: 'popup.domains.action.whitelist',
		defaultMessage: 'Whitelist',
	},
	'popup.domains.action.block': { id: 'popup.domains.action.block', defaultMessage: 'Block' },
	'popup.domains.list.add': { id: 'popup.domains.list.add', defaultMessage: 'Add' },
	'popup.domains.list.remove': { id: 'popup.domains.list.remove', defaultMessage: 'Remove' },
	'popup.domains.list.empty': {
		id: 'popup.domains.list.empty',
		defaultMessage: 'No domains added yet.',
	},
	'popup.domains.whitelisted': { id: 'popup.domains.whitelisted', defaultMessage: 'Whitelisted' },
	'popup.domains.blocked': { id: 'popup.domains.blocked', defaultMessage: 'Blocked' },
	'popup.domains.list.loadError': {
		id: 'popup.domains.list.loadError',
		defaultMessage: 'Failed to load domains',
	},
	'popup.domains.list.addError': {
		id: 'popup.domains.list.addError',
		defaultMessage: 'Failed to add domain',
	},
	'popup.domains.list.removeError': {
		id: 'popup.domains.list.removeError',
		defaultMessage: 'Failed to remove domain',
	},
})

const entries = ref<DomainEntry[]>([])
const loading = ref(true)
const loadError = ref('')

const newDomain = ref('')
const newType = ref<DomainType>('deny')
const adding = ref(false)
const addError = ref('')

const removing = ref<string | null>(null)

const primary = () => props.instances[0]

async function load(): Promise<void> {
	const inst = primary()
	if (!inst) return
	loadError.value = ''
	try {
		const result = await getPiHoleClient(inst).domains.list()
		entries.value = result.domains
			.filter((d) => d.enabled)
			.sort((a, b) => b.date_added - a.date_added)
	} catch (e) {
		loadError.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.domains.list.loadError'])
	}
}

async function addDomain(): Promise<void> {
	const domain = newDomain.value.trim()
	if (!domain || adding.value) return
	adding.value = true
	addError.value = ''
	const type = newType.value
	const opposite: DomainType = type === 'allow' ? 'deny' : 'allow'
	try {
		await Promise.all(
			props.instances.map(async (inst) => {
				const client = getPiHoleClient(inst)
				await client.domains.delete(opposite, 'exact', domain).catch(() => {})
				await (type === 'allow' ? client.domains.allow(domain) : client.domains.deny(domain))
			}),
		)
		newDomain.value = ''
		await load()
	} catch (e) {
		addError.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.domains.list.addError'])
	} finally {
		adding.value = false
	}
}

async function removeEntry(entry: DomainEntry): Promise<void> {
	removing.value = entry.domain
	loadError.value = ''
	try {
		await Promise.all(
			props.instances.map((inst) =>
				getPiHoleClient(inst)
					.domains.delete(entry.type, entry.kind, entry.domain)
					.catch(() => {}),
			),
		)
		entries.value = entries.value.filter(
			(e) => !(e.type === entry.type && e.kind === entry.kind && e.domain === entry.domain),
		)
	} catch (e) {
		loadError.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.domains.list.removeError'])
	} finally {
		removing.value = null
	}
}

onMounted(async () => {
	try {
		await load()
	} finally {
		loading.value = false
	}
})
</script>
