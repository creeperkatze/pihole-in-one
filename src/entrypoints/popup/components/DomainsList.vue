<template>
	<div class="flex flex-col gap-3">
		<DomainAdd :instances="instances" @added="load" />

		<hr class="border-border" />

		<div v-if="loading" class="flex items-center justify-center py-4">
			<div
				class="w-4 h-4 border-2 border-border border-t-pihole-red rounded-full animate-spin"
			></div>
		</div>

		<div v-else-if="loadError" class="text-xs text-pihole-red py-1">{{ loadError }}</div>

		<div v-else-if="entries.length === 0" class="text-xs text-secondary py-1 text-center">
			{{ t('popup.domains.list.empty') }}
		</div>

		<div v-else class="flex flex-col gap-1.5">
			<ItemRow v-for="entry in entries" :key="`${entry.type}:${entry.kind}:${entry.domain}`">
				<template #leading>
					<span
						class="shrink-0"
						:title="
							entry.type === 'allow' ? t('popup.domains.whitelisted') : t('popup.domains.blocked')
						"
					>
						<component
							:is="entry.type === 'allow' ? ShieldCheck : ShieldBan"
							class="size-4"
							:class="entry.type === 'allow' ? 'text-pihole-green' : 'text-pihole-red'"
							aria-hidden="true"
						/>
					</span>
					<span v-if="entry.kind === 'regex'" class="shrink-0" :title="t('popup.domains.regex')">
						<Regex class="size-3.5 text-secondary" aria-hidden="true" />
					</span>
				</template>
				<div
					class="text-xs font-medium text-primary truncate"
					:class="{ 'font-mono': entry.kind === 'regex' }"
					:title="entry.domain"
				>
					{{ entry.domain }}
				</div>
				<template #trailing>
					<button
						type="button"
						class="flex shrink-0 items-center justify-center size-6 border-0 rounded-[5px] bg-transparent text-secondary hover:bg-surface-hover hover:text-primary transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						:disabled="removing === entry.domain"
						:title="t('popup.domains.list.remove')"
						@click="removeEntry(entry)"
					>
						<X class="size-3.5" />
					</button>
				</template>
			</ItemRow>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Regex, ShieldBan, ShieldCheck, X } from '@lucide/vue'
import type { DomainEntry } from 'pihole-js'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemRow from '../../../components/ui/ItemRow.vue'
import { getPiHoleClient } from '../../../utils/api'
import type { PiholeInstance } from '../../../utils/settings'
import DomainAdd from './DomainAdd.vue'

const props = defineProps<{
	instances: PiholeInstance[]
}>()

const { t } = useI18n()

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
		loadError.value = e instanceof Error ? e.message : t('popup.domains.list.loadError')
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
		loadError.value = e instanceof Error ? e.message : t('popup.domains.list.removeError')
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
