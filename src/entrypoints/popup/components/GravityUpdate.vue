<script setup lang="ts">
import { Check, RefreshCw } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '../../../components/ui/Button.vue'
import { updateGravity } from '../../../utils/api'
import type { PiholeInstance } from '../../../utils/settings'

const props = defineProps<{
	instance: PiholeInstance
}>()

const { t } = useI18n()

const updating = ref(false)
const updated = ref(false)
const error = ref('')

let resetTimer: ReturnType<typeof setTimeout> | undefined

async function run(): Promise<void> {
	updating.value = true
	updated.value = false
	error.value = ''
	clearTimeout(resetTimer)
	try {
		await updateGravity(props.instance)
		updated.value = true
		resetTimer = setTimeout(() => {
			updated.value = false
		}, 3000)
	} catch (e) {
		error.value = e instanceof Error ? e.message : t('popup.lists.gravity.error')
	} finally {
		updating.value = false
	}
}
</script>

<template>
	<section class="flex flex-col gap-2 rounded-lg border border-border bg-surface-3 px-3 py-2.5">
		<p class="text-sm font-medium">{{ t('popup.lists.gravity.title') }}</p>
		<Button class="w-full" :disabled="updating" @click="run">
			<Check v-if="updated" class="size-4 text-pihole-green" />
			<RefreshCw v-else class="size-4" :class="{ 'animate-spin': updating }" />
			{{
				updating
					? t('popup.lists.gravity.running')
					: updated
						? t('popup.lists.gravity.done')
						: t('popup.lists.gravity.button')
			}}
		</Button>
		<p v-if="error" class="text-xs text-pihole-red">{{ error }}</p>
	</section>
</template>
