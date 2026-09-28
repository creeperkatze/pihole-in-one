<template>
	<section class="rounded-lg border border-border bg-surface-3">
		<div class="flex items-center gap-3 px-3 py-2.5">
			<Loader2 v-if="loading" class="size-5 shrink-0 animate-spin text-secondary" />
			<component
				:is="allowlistedByUser ? ShieldCheck : isEffectivelyBlocked ? ShieldBan : Shield"
				v-else
				class="size-5 shrink-0"
				:class="toneClass"
			/>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold" :title="domain">{{ domain }}</p>
				<p class="min-h-4 truncate text-xs" :class="toneClass">
					{{ loading ? '' : statusText }}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-2 border-t border-border px-3 py-2">
			<Button
				:variant="allowlistedByUser ? 'success' : 'default'"
				:disabled="loading || acting"
				:aria-pressed="allowlistedByUser"
				:title="
					allowlistedByUser ? t('popup.domain.removeFromWhitelist') : t('popup.domain.whitelist')
				"
				@click="toggleAllowlist"
			>
				<ShieldCheck class="size-4" :class="{ 'text-pihole-green': !allowlistedByUser }" />
				{{ t('popup.domain.whitelist') }}
			</Button>
			<Button
				:variant="blockedByUser ? 'primary' : 'default'"
				:disabled="loading || acting"
				:aria-pressed="blockedByUser"
				:title="blockedByUser ? t('popup.domain.unblock') : t('popup.domain.block')"
				@click="toggleBlock"
			>
				<ShieldBan class="size-4" :class="{ 'text-pihole-red': !blockedByUser }" />
				{{ t('popup.domain.block') }}
			</Button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Loader2, Shield, ShieldBan, ShieldCheck } from '@lucide/vue'
import type { DomainEntry } from 'pihole-js'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import { getPiHoleClient } from '../../../utils/api'
import type { PiholeInstance } from '../../../utils/settings'

const { t } = useI18n()

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

const toneClass = computed(() =>
	allowlistedByUser.value
		? 'text-pihole-green'
		: isEffectivelyBlocked.value
			? 'text-pihole-red'
			: 'text-secondary',
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
	if (allowlistedByUser.value) return t('popup.domain.whitelistedByUser')
	if (blockedByUser.value) return t('popup.domain.blockedByUser')
	if (gravityListNames.value.length === 1)
		return t('popup.domain.blockedByList', { list: gravityListNames.value[0] })
	if (gravityListNames.value.length > 1)
		return t('popup.domain.blockedByListPlural', {
			list: gravityListNames.value[0],
			count: gravityListNames.value.length - 1,
		})
	return t('popup.domain.notBlocked')
})

const primary = computed(() => props.instances[0])

function domainRegex(domain: string): string {
	const escaped = domain.replace(/\./g, '\\.')
	return `(^|\\.)(${escaped})$`
}

async function fetchStatus(): Promise<void> {
	if (!primary.value) return
	const result = await getPiHoleClient(primary.value).domains.search(props.domain, {
		partial: false,
	})
	const search = result.search
	denyEntries.value = search.domains.filter((d) => d.type === 'deny' && d.enabled)
	allowEntries.value = search.domains.filter((d) => d.type === 'allow' && d.enabled)
	gravityListNames.value = search.gravity.map((g) => listName(g.address, g.comment))
}

async function deleteEntries(inst: PiholeInstance, entries: DomainEntry[]): Promise<void> {
	await Promise.all(
		entries.map((e) => getPiHoleClient(inst).domains.delete(e.type, e.kind, e.domain)),
	)
}

async function toggleAllowlist(): Promise<void> {
	acting.value = true
	const wasAllowlisted = allowlistedByUser.value
	try {
		await Promise.all(
			props.instances.map(async (inst) => {
				if (wasAllowlisted) {
					await deleteEntries(inst, allowEntries.value)
				} else {
					await deleteEntries(inst, denyEntries.value)
					await getPiHoleClient(inst).domains.allowRegex(domainRegex(props.domain))
				}
			}),
		)
		// Optimistic update
		if (wasAllowlisted) {
			allowEntries.value = []
		} else {
			denyEntries.value = []
			allowEntries.value = [
				{
					domain: domainRegex(props.domain),
					type: 'allow',
					kind: 'regex',
					enabled: true,
					comment: null,
					id: -1,
					groups: [0],
					date_added: 0,
					date_modified: 0,
				},
			]
		}
	} finally {
		acting.value = false
	}
}

async function toggleBlock(): Promise<void> {
	acting.value = true
	const wasBlocked = blockedByUser.value
	try {
		await Promise.all(
			props.instances.map(async (inst) => {
				if (wasBlocked) {
					await deleteEntries(inst, denyEntries.value)
				} else {
					await deleteEntries(inst, allowEntries.value)
					await getPiHoleClient(inst).domains.denyRegex(domainRegex(props.domain))
				}
			}),
		)
		// Optimistic update
		if (wasBlocked) {
			denyEntries.value = []
		} else {
			allowEntries.value = []
			denyEntries.value = [
				{
					domain: domainRegex(props.domain),
					type: 'deny',
					kind: 'regex',
					enabled: true,
					comment: null,
					id: -1,
					groups: [0],
					date_added: 0,
					date_modified: 0,
				},
			]
		}
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
