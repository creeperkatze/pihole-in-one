<template>
	<GroupsCard
		v-if="states[activeInstance]?.summary?.groups?.length"
		:groups="states[activeInstance]!.summary!.groups"
		:base-url="settings!.instances[activeInstance]!.baseUrl"
		:api-password="settings!.instances[activeInstance]!.apiPassword"
	/>
	<div v-else class="flex flex-col items-center gap-2 py-8 px-4 text-center">
		<Users class="size-6 text-muted" />
		<p class="m-0 text-xs text-secondary">{{ t('popup.groups.empty') }}</p>
	</div>
</template>

<script setup lang="ts">
import { Users } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import GroupsCard from '../components/GroupsCard.vue'
import { usePopupInstances } from '../usePopupInstances'

const { t } = useI18n()

const { settings, states, activeInstance } = usePopupInstances()
</script>
