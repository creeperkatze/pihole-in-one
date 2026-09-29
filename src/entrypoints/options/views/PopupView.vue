<script setup lang="ts">
import {
	Activity,
	ArrowUpCircle,
	ChartColumn,
	Globe,
	History,
	Info,
	Plus,
	RefreshCw,
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import OptionToggle from '../../../components/options/OptionToggle.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import { useSettings } from '../../../composables/useSettings'

const { form, saveError, initialized } = useSettings()
const { t } = useI18n()
</script>

<template>
	<section class="flex flex-col">
		<SectionHeader
			:title="t('options.popup.title')"
			:description="t('options.popup.description')"
		/>
		<div v-if="initialized" class="flex max-w-xl flex-col gap-5 p-4">
			<div class="flex flex-col gap-2">
				<h2 class="text-sm text-secondary">
					{{ t('options.popup.general') }}
				</h2>
				<OptionToggle
					v-model="form.showDiagnosisBadge"
					:icon="Info"
					:label="t('options.customization.diagnosisBadge.label')"
					:description="t('options.customization.diagnosisBadge.description')"
				/>
				<OptionToggle
					v-model="form.showUpdateBadge"
					:icon="ArrowUpCircle"
					:label="t('options.popup.updateBadge.label')"
					:description="t('options.popup.updateBadge.description')"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<h2 class="text-sm text-secondary">
					{{ t('popup.tabs.home') }}
				</h2>
				<OptionToggle
					v-model="form.showStats"
					:icon="ChartColumn"
					:label="t('options.popup.stats.label')"
					:description="t('options.popup.stats.description')"
				/>
				<OptionToggle
					v-model="form.showCurrentSite"
					:icon="Globe"
					:label="t('options.popup.currentSite.label')"
					:description="t('options.popup.currentSite.description')"
				/>
				<OptionToggle
					v-model="form.showSystemInfo"
					:icon="Activity"
					:label="t('options.popup.systemInfo.label')"
					:description="t('options.popup.systemInfo.description')"
				/>
				<OptionToggle
					v-model="form.showRecentlyBlocked"
					:icon="History"
					:label="t('popup.recentlyBlocked.title')"
					:description="t('options.popup.recentlyBlocked.description')"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<h2 class="text-sm text-secondary">
					{{ t('popup.tabs.lists') }}
				</h2>
				<OptionToggle
					v-model="form.showGravityUpdate"
					:icon="RefreshCw"
					:label="t('popup.lists.gravity.title')"
					:description="t('options.popup.gravityUpdate.description')"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<h2 class="text-sm text-secondary">
					{{ t('popup.tabs.domains') }}
				</h2>
				<OptionToggle
					v-model="form.showDomainAdd"
					:icon="Plus"
					:label="t('popup.domains.add.title')"
					:description="t('options.popup.domainAdd.description')"
				/>
			</div>
			<div
				v-if="saveError"
				class="rounded-lg border border-danger-border bg-danger-bg px-3.5 py-2.5 text-[13px] text-pihole-red"
			>
				{{ saveError }}
			</div>
		</div>
	</section>
</template>
