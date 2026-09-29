<script setup lang="ts">
import { Shield } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import EmptyState from '../components/EmptyState.vue'
import GravityUpdate from '../components/GravityUpdate.vue'
import ListsCard from '../components/ListsCard.vue'
import { usePopupInstances } from '../usePopupInstances'

const { t } = useI18n()

const { settings, states, activeInstance } = usePopupInstances()
</script>

<template>
	<div v-if="states[activeInstance]?.summary" class="flex flex-col gap-2">
		<GravityUpdate
			v-if="settings!.showGravityUpdate"
			:key="settings!.instances[activeInstance]!.id"
			:instance="settings!.instances[activeInstance]!"
		/>

		<ListsCard
			v-if="states[activeInstance]!.summary!.lists.length"
			:lists="states[activeInstance]!.summary!.lists"
			:base-url="settings!.instances[activeInstance]!.baseUrl"
			:api-password="settings!.instances[activeInstance]!.apiPassword"
		/>
		<EmptyState v-else :icon="Shield" :text="t('popup.lists.empty')" />
	</div>
</template>
