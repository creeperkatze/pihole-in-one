<template>
	<div v-if="groups.length > 0" class="flex flex-col gap-1.5">
		<div v-if="toggleError" class="text-xs text-pihole-red py-1">
			{{ toggleError }}
		</div>

		<div class="grid grid-cols-2 gap-1.5">
			<ItemRow v-for="group in groups" :key="group.id">
				<div class="flex flex-col">
					<span class="text-xs font-medium text-primary truncate">{{ group.name }}</span>
					<span v-if="group.comment" class="text-[11px] text-secondary truncate">{{
						group.comment
					}}</span>
				</div>
				<template #trailing>
					<Toggle
						:model-value="group.enabled"
						:disabled="toggling === group.name"
						@update:model-value="toggle(group)"
					/>
				</template>
			</ItemRow>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PiholeGroup } from 'pihole-js'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemRow from '../../../components/ui/ItemRow.vue'
import Toggle from '../../../components/ui/Toggle.vue'
import { getPiHoleClient } from '../../../utils/api'

const props = defineProps<{
	groups: PiholeGroup[]
	baseUrl: string
	apiPassword: string
}>()

const { t } = useI18n()

const toggleError = ref('')
const toggling = ref<string | null>(null)

async function toggle(group: PiholeGroup): Promise<void> {
	toggling.value = group.name
	toggleError.value = ''
	try {
		await getPiHoleClient(props).groups.update(group.name, {
			name: group.name,
			comment: group.comment,
			enabled: !group.enabled,
		})
		group.enabled = !group.enabled
	} catch (e) {
		toggleError.value = e instanceof Error ? e.message : t('popup.groups.updateError')
	} finally {
		toggling.value = null
	}
}
</script>
