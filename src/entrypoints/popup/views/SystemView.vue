<template>
	<StatusCards
		v-if="states[activeInstance]?.summary?.diagnosis"
		:status="states[activeInstance]!.summary!.diagnosis!"
	/>
	<div v-else class="flex flex-col items-center gap-2 py-8 px-4 text-center">
		<Activity class="size-6 text-muted" />
		<p class="m-0 text-xs text-secondary">{{ t('popup.system.empty') }}</p>
	</div>
</template>

<script setup lang="ts">
import { Activity } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import StatusCards from '../components/StatusCards.vue'
import { usePopupInstances } from '../usePopupInstances'

const { t } = useI18n()

const { states, activeInstance } = usePopupInstances()
</script>
