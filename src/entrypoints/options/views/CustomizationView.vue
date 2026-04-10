<template>
	<section class="flex flex-col">
		<SectionHeader
			title="Customization"
			description="Adjust the appearance and behavior of the extension."
		/>
		<div class="px-8 py-4 max-w-xl flex flex-col gap-2">
			<OptionSelect
				label="Badge appearance"
				description="What to display on the extension icon badge."
				:model-value="form.badgeMode"
				:options="badgeModeOptions"
				@update:model-value="form.badgeMode = $event as BadgeMode"
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
import OptionSelect from '../../../components/options/OptionSelect.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'
import type { BadgeMode } from '../../../helpers/settings'

const { form, saveError } = useSettings()

const badgeModeOptions: { value: BadgeMode; label: string }[] = [
	{ value: 'off', label: 'Off' },
	{ value: 'state', label: 'State' },
	{ value: 'percentage', label: 'Percentage blocked' },
	{ value: 'clients', label: 'Active clients' },
]
</script>
