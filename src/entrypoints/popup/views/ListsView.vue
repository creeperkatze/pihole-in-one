<script setup lang="ts">
import { Shield } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import GravityUpdate from '../components/GravityUpdate.vue'
import ListsCard from '../components/ListsCard.vue'
import { usePopupInstances } from '../usePopupInstances'

const { t } = useI18n()

const { settings, states, activeInstance } = usePopupInstances()
</script>

<template>
	<div v-if="states[activeInstance]?.summary" class="flex flex-col gap-3">
		<template v-if="settings!.showGravityUpdate">
			<GravityUpdate
				:key="settings!.instances[activeInstance]!.id"
				:instance="settings!.instances[activeInstance]!"
			/>
			<hr class="border-border" />
		</template>

		<ListsCard
			v-if="states[activeInstance]!.summary!.lists.length"
			:lists="states[activeInstance]!.summary!.lists"
			:base-url="settings!.instances[activeInstance]!.baseUrl"
			:api-password="settings!.instances[activeInstance]!.apiPassword"
		/>
		<div v-else class="flex flex-col items-center gap-2 px-4 py-8 text-center">
			<Shield class="size-6 text-muted" />
			<p class="m-0 text-xs text-secondary">{{ t('popup.lists.empty') }}</p>
		</div>
	</div>
</template>
