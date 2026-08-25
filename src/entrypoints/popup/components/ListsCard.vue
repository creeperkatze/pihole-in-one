<template>
	<div v-if="lists.length > 0" class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between gap-2">
			<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
				{{ formatMessage(messages['popup.lists.title']) }}
			</div>
			<button
				class="flex items-center gap-1 text-[11px] font-medium text-secondary hover:text-primary transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				:disabled="updating"
				:title="formatMessage(messages['popup.lists.update.title'])"
				@click="runGravityUpdate"
			>
				<RefreshCw class="size-3" :class="{ 'animate-spin': updating }" />
				<span v-if="updated">{{ formatMessage(messages['popup.lists.update.done']) }}</span>
				<span v-else>{{ formatMessage(messages['popup.lists.update.label']) }}</span>
			</button>
		</div>

		<div v-if="error" class="text-xs text-pihole-red py-1">
			{{ error }}
		</div>

		<div class="grid grid-cols-2 gap-1.5">
			<div
				v-for="list in lists"
				:key="list.id"
				class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-border bg-surface-3"
			>
				<div class="flex flex-col min-w-0">
					<span class="text-xs font-medium text-primary truncate">{{
						list.comment || fileName(list)
					}}</span>
					<span class="text-[11px] text-secondary truncate">{{ fileName(list) }}</span>
				</div>
				<Toggle
					:model-value="list.enabled"
					:disabled="toggling === list.address"
					@update:model-value="toggle(list)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { RefreshCw } from '@lucide/vue'
import type { PiholeList } from 'pihole-js'
import { ref } from 'vue'

import Toggle from '../../../components/Toggle.vue'
import { getPiHoleClient, updateGravity } from '../../../utils/api'
import { useVIntl } from '../../../utils/i18n'

const props = defineProps<{
	lists: PiholeList[]
	baseUrl: string
	apiPassword: string
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.lists.title': { id: 'popup.lists.title', defaultMessage: 'Lists' },
	'popup.lists.updateError': {
		id: 'popup.lists.updateError',
		defaultMessage: 'Failed to update list',
	},
	'popup.lists.update.label': { id: 'popup.lists.update.label', defaultMessage: 'Update' },
	'popup.lists.update.title': {
		id: 'popup.lists.update.title',
		defaultMessage: 'Update lists (run gravity)',
	},
	'popup.lists.update.done': { id: 'popup.lists.update.done', defaultMessage: 'Updated' },
	'popup.lists.update.error': {
		id: 'popup.lists.update.error',
		defaultMessage: 'Failed to update lists',
	},
})

const error = ref('')
const toggling = ref<string | null>(null)
const updating = ref(false)
const updated = ref(false)

function fileName(list: PiholeList): string {
	try {
		const url = new URL(list.address)
		const filename = url.pathname.split('/').pop()
		return filename || url.hostname
	} catch {
		return list.address
	}
}

async function toggle(list: PiholeList): Promise<void> {
	toggling.value = list.address
	error.value = ''
	try {
		await getPiHoleClient(props).lists.update(list.address, {
			type: list.type,
			comment: list.comment,
			groups: list.groups,
			enabled: !list.enabled,
		})
		list.enabled = !list.enabled
	} catch (e) {
		error.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.lists.updateError'])
	} finally {
		toggling.value = null
	}
}

async function runGravityUpdate(): Promise<void> {
	updating.value = true
	updated.value = false
	error.value = ''
	try {
		await updateGravity(props)
		updated.value = true
		setTimeout(() => {
			updated.value = false
		}, 3000)
	} catch (e) {
		error.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.lists.update.error'])
	} finally {
		updating.value = false
	}
}
</script>
