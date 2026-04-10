<template>
	<section class="flex flex-col">
		<SectionHeader
			title="Connection"
			description="Manage your Pi-hole instances and badge refresh settings."
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionPiHoleSelector
				:model-value="form.instances"
				@update:model-value="form.instances = $event"
			/>
			<OptionSlider
				label="Badge Refresh Interval"
				description="Minimum 60s in Chrome (MV3 alarm constraint). Firefox allows lower values."
				:model-value="form.refreshInterval"
				:min="60"
				:max="3600"
				:step="30"
				:format="formatSeconds"
				@update:model-value="form.refreshInterval = $event"
			/>
			<div
				v-if="saveError"
				class="px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import OptionPiHoleSelector from '../../../components/options/OptionPiHoleSelector.vue'
import OptionSlider from '../../../components/options/OptionSlider.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import { formatSeconds } from '../../../helpers/format'

const { form, saveError } = useSettings()
</script>
