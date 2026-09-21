<template>
	<div class="flex flex-col gap-1.5">
		<div v-if="loading" class="flex items-center justify-center py-4">
			<div
				class="w-4 h-4 border-2 border-border border-t-pihole-red rounded-full animate-spin"
			></div>
		</div>

		<div v-else-if="loadError" class="text-xs text-pihole-red py-1">{{ loadError }}</div>

		<div v-else-if="entries.length === 0" class="text-xs text-secondary py-1 text-center">
			{{ formatMessage(messages['popup.domains.list.empty']) }}
		</div>

		<div v-else class="flex flex-col gap-1.5">
			<div
				v-for="entry in entries"
				:key="`${entry.type}:${entry.kind}:${entry.domain}`"
				class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-border bg-surface-3"
			>
				<div class="flex min-w-0 items-center gap-1.5">
					<span
						class="shrink-0"
						:title="
							entry.type === 'allow'
								? formatMessage(messages['popup.domains.whitelisted'])
								: formatMessage(messages['popup.domains.blocked'])
						"
					>
						<component
							:is="entry.type === 'allow' ? ShieldCheck : ShieldBan"
							class="size-4"
							:class="entry.type === 'allow' ? 'text-pihole-green' : 'text-pihole-red'"
							aria-hidden="true"
						/>
					</span>
					<span
						v-if="entry.kind === 'regex'"
						:title="formatMessage(messages['popup.domains.regex'])"
					>
						<Regex class="size-3.5 text-muted" aria-hidden="true" />
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
import { Regex, ShieldBan, ShieldCheck, X } from '@lucide/vue'
import type { DomainEntry } from 'pihole-js'
import { onMounted, ref } from 'vue'

import { getPiHoleClient } from '../../../utils/api'
import { useVIntl } from '../../../utils/i18n'
import type { PiholeInstance } from '../../../utils/settings'

const props = defineProps<{
	instances: PiholeInstance[]
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.domains.list.remove': { id: 'popup.domains.list.remove', defaultMessage: 'Remove' },
	'popup.domains.list.empty': {
		id: 'popup.domains.list.empty',
		defaultMessage: 'No domains added yet.',
	},
	'popup.domains.whitelisted': { id: 'popup.domains.whitelisted', defaultMessage: 'Whitelisted' },
	'popup.domains.blocked': { id: 'popup.domains.blocked', defaultMessage: 'Blocked' },
	'popup.domains.regex': { id: 'popup.domains.regex', defaultMessage: 'Regex pattern' },
	'popup.domains.list.loadError': {
		id: 'popup.domains.list.loadError',
		defaultMessage: 'Failed to load domains',
	},
	'popup.domains.list.removeError': {
		id: 'popup.domains.list.removeError',
		defaultMessage: 'Failed to remove domain',
	},
})

const entries = ref<DomainEntry[]>([])
const loading = ref(true)
const loadError = ref('')

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
