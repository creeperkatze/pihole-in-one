<template>
	<div v-if="lists.length > 0" class="flex flex-col gap-1.5">
		<div class="text-[11px] font-semibold text-secondary uppercase">
			{{ formatMessage(messages['popup.lists.title']) }}
		</div>

		<div v-if="toggleError" class="text-xs text-pihole-red py-1">
			{{ toggleError }}
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
import { ref } from 'vue'

import Toggle from '../../../components/Toggle.vue'
import { type PiholeList, setListEnabled } from '../../../helpers/api'
import { useVIntl } from '../../../helpers/i18n'

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
})

const toggleError = ref('')
const toggling = ref<string | null>(null)

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
	toggleError.value = ''
	try {
		await setListEnabled(props.baseUrl, props.apiPassword, list, !list.enabled)
		list.enabled = !list.enabled
	} catch (e) {
		toggleError.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.lists.updateError'])
	} finally {
		toggling.value = null
	}
}
</script>
