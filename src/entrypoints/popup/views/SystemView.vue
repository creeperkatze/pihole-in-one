<template>
	<StatusCards
		v-if="states[activeInstance]?.summary?.diagnosis"
		:status="states[activeInstance]!.summary!.diagnosis!"
	/>
	<div v-else class="flex flex-col items-center gap-2 py-8 px-4 text-center">
		<Activity class="size-6 text-muted" />
		<p class="m-0 text-xs text-secondary">{{ formatMessage(messages['popup.system.empty']) }}</p>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { Activity } from '@lucide/vue'

import { useVIntl } from '../../../utils/i18n'
import StatusCards from '../components/StatusCards.vue'
import { usePopupInstances } from '../usePopupInstances'

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'popup.system.empty': { id: 'popup.system.empty', defaultMessage: 'No system data available.' },
})

const { states, activeInstance } = usePopupInstances()
</script>
