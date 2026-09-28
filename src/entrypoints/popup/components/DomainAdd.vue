<script setup lang="ts">
import { Regex, ShieldBan, ShieldCheck } from '@lucide/vue'
import type { DomainKind, DomainType } from 'pihole-js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import Input from '../../../components/ui/Input.vue'
import { useErrorMessage } from '../../../composables/useApiMessages'
import { getPiHoleClient } from '../../../utils/api'
import type { PiholeInstance } from '../../../utils/settings'

const props = defineProps<{
	instances: PiholeInstance[]
}>()

const emit = defineEmits<{
	added: []
}>()

const { t } = useI18n()
const describeError = useErrorMessage()

const value = ref('')
const regex = ref(false)
const adding = ref(false)
const error = ref('')

async function addToInstance(
	inst: PiholeInstance,
	type: DomainType,
	kind: DomainKind,
	domain: string,
): Promise<void> {
	const client = getPiHoleClient(inst)
	const opposite: DomainType = type === 'allow' ? 'deny' : 'allow'
	await client.domains.delete(opposite, kind, domain).catch(() => {})
	const result = await client.domains.create(type, kind, { domain })
	const failure = result.processed?.errors?.[0] ?? result.processed?.failed?.[0]
	if (failure) throw new Error(failure.error)
}

async function add(type: DomainType): Promise<void> {
	const domain = regex.value ? value.value.trim() : value.value.trim().toLowerCase()
	if (!domain || adding.value) return
	adding.value = true
	error.value = ''
	try {
		const kind: DomainKind = regex.value ? 'regex' : 'exact'
		await Promise.all(props.instances.map((inst) => addToInstance(inst, type, kind, domain)))
		value.value = ''
		emit('added')
	} catch (e) {
		error.value = describeError(e, 'popup.domains.list.addError')
	} finally {
		adding.value = false
	}
}
</script>

<template>
	<section class="flex flex-col gap-2 rounded-lg border border-border bg-surface-3 px-3 py-2.5">
		<p class="text-sm font-medium">{{ t('popup.domains.add.title') }}</p>
		<form class="flex gap-1.5" @submit.prevent="add('deny')">
			<Input
				v-model="value"
				type="text"
				autocomplete="off"
				spellcheck="false"
				:placeholder="regex ? '(\\.|^)example\\.com$' : 'example.com'"
				:disabled="adding"
				class="min-w-0 flex-1"
				@input="error = ''"
			/>
			<Button
				size="icon"
				:active="regex"
				:title="t('popup.domains.regex')"
				:aria-label="t('popup.domains.regex')"
				:aria-pressed="regex"
				@click="regex = !regex"
			>
				<Regex class="size-4" />
			</Button>
			<Button
				size="icon"
				:disabled="adding || !value.trim()"
				:title="t('popup.domain.whitelist')"
				:aria-label="t('popup.domain.whitelist')"
				@click="add('allow')"
			>
				<ShieldCheck class="size-4 text-pihole-green" />
			</Button>
			<Button
				type="submit"
				size="icon"
				:disabled="adding || !value.trim()"
				:title="t('popup.domain.block')"
				:aria-label="t('popup.domain.block')"
			>
				<ShieldBan class="size-4 text-pihole-red" />
			</Button>
		</form>
		<p v-if="error" class="text-xs text-pihole-red">{{ error }}</p>
	</section>
</template>
