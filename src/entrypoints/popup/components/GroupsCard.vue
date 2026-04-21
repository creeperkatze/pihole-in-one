<template>
	<div v-if="groups.length > 0" class="flex flex-col gap-1.5">
		<div class="text-[11px] font-semibold text-secondary uppercase tracking-[0.5px]">
			{{ formatMessage(messages['popup.groups.title']) }}
		</div>

		<div v-if="toggleError" class="text-xs text-pihole-red py-1">
			{{ toggleError }}
		</div>

		<div class="grid grid-cols-2 gap-1.5">
			<div
				v-for="group in groups"
				:key="group.id"
				class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-border bg-surface-3"
			>
				<div class="flex flex-col min-w-0">
					<span class="text-xs font-medium text-primary truncate">{{ group.name }}</span>
					<span v-if="group.comment" class="text-[11px] text-secondary truncate">{{
						group.comment
					}}</span>
				</div>
				<Toggle
					:model-value="group.enabled"
					:disabled="toggling === group.name"
					@update:model-value="toggle(group)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { ref } from 'vue'

import Toggle from '../../../components/Toggle.vue'
import { type PiholeGroup, setGroupEnabled } from '../../../helpers/api'
import { useVIntl } from '../../../helpers/i18n'

const props = defineProps<{
	groups: PiholeGroup[]
	baseUrl: string
	apiPassword: string
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.groups.title': { id: 'popup.groups.title', defaultMessage: 'Groups' },
	'popup.groups.updateError': {
		id: 'popup.groups.updateError',
		defaultMessage: 'Failed to update group',
	},
})

const toggleError = ref('')
const toggling = ref<string | null>(null)

async function toggle(group: PiholeGroup): Promise<void> {
	toggling.value = group.name
	toggleError.value = ''
	try {
		await setGroupEnabled(props.baseUrl, props.apiPassword, group, !group.enabled)
		group.enabled = !group.enabled
	} catch (e) {
		toggleError.value =
			e instanceof Error ? e.message : formatMessage(messages['popup.groups.updateError'])
	} finally {
		toggling.value = null
	}
}
</script>
