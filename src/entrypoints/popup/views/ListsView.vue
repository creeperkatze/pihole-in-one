<template>
	<ListsCard
		v-if="states[activeInstance]?.summary?.lists?.length"
		:lists="states[activeInstance]!.summary!.lists"
		:base-url="settings!.instances[activeInstance]!.baseUrl"
		:api-password="settings!.instances[activeInstance]!.apiPassword"
	/>
	<div v-else class="flex flex-col items-center gap-2 py-8 px-4 text-center">
		<Shield class="size-6 text-muted" />
		<p class="m-0 text-xs text-secondary">{{ formatMessage(messages['popup.lists.empty']) }}</p>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { Shield } from '@lucide/vue'

import { useVIntl } from '../../../utils/i18n'
import ListsCard from '../components/ListsCard.vue'
import { usePopupInstances } from '../usePopupInstances'

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.lists.empty': { id: 'popup.lists.empty', defaultMessage: 'No lists found.' },
})

const { settings, states, activeInstance } = usePopupInstances()
</script>
