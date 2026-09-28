<script setup lang="ts">
import { Check, RefreshCw } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import type { PiholeInstance } from '../../../utils/settings'
import { useGravityUpdate } from '../useGravityUpdate'

const props = defineProps<{
	instance: PiholeInstance
}>()

const { t } = useI18n()

const { state, run } = useGravityUpdate(() => props.instance)
</script>

<template>
	<section class="flex flex-col gap-2 rounded-lg border border-border bg-surface-3 px-3 py-2.5">
		<p class="text-sm font-medium">{{ t('popup.lists.gravity.title') }}</p>
		<Button class="w-full" :disabled="state.updating" @click="run">
			<Check v-if="state.updated" class="size-4 text-pihole-green" />
			<RefreshCw v-else class="size-4" :class="{ 'animate-spin': state.updating }" />
			{{
				state.updating
					? t('popup.lists.gravity.running')
					: state.updated
						? t('popup.lists.gravity.done')
						: t('popup.lists.gravity.button')
			}}
		</Button>
		<p v-if="state.error" class="text-xs text-pihole-red">{{ state.error }}</p>
	</section>
</template>
