<template>
	<section class="flex flex-col">
		<SectionHeader
			title="Customization"
			description="Adjust the appearance and behavior of the extension."
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col">
			<OptionToggle
				label="Show badge"
				description="Display an ON / OFF badge on the extension icon reflecting the current blocking state."
				:model-value="form.showBadge"
				@update:model-value="form.showBadge = $event"
			/>
			<div
				v-if="saveError"
				class="mt-3 px-3.5 py-2.5 rounded-lg text-[13px] border bg-danger-bg border-danger-border text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'

const { form, saveError } = useSettings()
</script>
