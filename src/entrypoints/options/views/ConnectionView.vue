<script setup lang="ts">
import { Timer, Wifi } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import OptionPiHoleSelector from '../../../components/options/OptionPiHoleSelector.vue'
import OptionSlider from '../../../components/options/OptionSlider.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { formatSeconds } from '../../../utils/format'

const { form, saveError } = useSettings()
const { t } = useI18n()
</script>

<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="t('options.connection.title')"
			:description="t('options.connection.description')"
		/>
		<div class="flex max-w-xl flex-col gap-2 p-4">
			<OptionPiHoleSelector v-model="form.instances" />
			<OptionSlider
				v-model="form.connectionTimeout"
				:icon="Wifi"
				:label="t('options.connection.connectionTimeout.label')"
				:description="t('options.connection.connectionTimeout.description')"
				:min="3"
				:max="60"
				:step="1"
				suffix="s"
				:format="formatSeconds"
			/>
			<OptionSlider
				v-model="form.refreshInterval"
				:icon="Timer"
				:label="t('options.connection.refreshInterval.label')"
				:description="t('options.connection.refreshInterval.description')"
				:min="60"
				:max="3600"
				:step="30"
				suffix="s"
				:format="formatSeconds"
			/>
			<div
				v-if="saveError"
				class="rounded-lg border border-danger-border bg-danger-bg px-3.5 py-2.5 text-[13px] text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>
