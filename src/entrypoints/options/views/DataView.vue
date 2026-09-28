<script setup lang="ts">
import { AlertTriangle, Download, RotateCcw, Upload } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import Modal from '../../../components/Modal.vue'
import OptionButton from '../../../components/options/OptionButton.vue'
import SectionHeader from '../../../components/options/SectionHeader.vue'
import Button from '../../../components/ui/Button.vue'
import {
	importFeedback,
	showExportWarning,
	showResetConfirm,
	useDataActions,
} from '../../../composables/useDataActions'
import { useSettings } from '../../../composables/useSettings'

const { initialized } = useSettings()
const { triggerExport, confirmExport, triggerImport, triggerReset, confirmReset } = useDataActions()
const { t } = useI18n()
</script>

<template>
	<section class="flex flex-col">
		<SectionHeader :title="t('options.data.title')" :description="t('options.data.description')" />
		<div v-if="initialized" class="flex max-w-xl flex-col gap-2 p-4">
			<OptionButton
				:icon="Download"
				:label="t('options.data.export.label')"
				:description="t('options.data.export.description')"
				:button-label="t('options.data.export.button')"
				@click="triggerExport"
			/>
			<OptionButton
				:icon="Upload"
				:label="t('options.data.import.label')"
				:description="t('options.data.import.description')"
				:button-label="t('options.data.import.button')"
				@click="triggerImport"
			/>
			<OptionButton
				:icon="RotateCcw"
				:label="t('options.data.reset.label')"
				:description="t('options.data.reset.description')"
				:button-label="t('options.data.reset.button')"
				@click="triggerReset"
			/>
			<div
				v-if="importFeedback"
				:class="[
					'mt-1 px-3.5 py-2.5 rounded-lg text-[13px] border',
					importFeedback.type === 'success'
						? 'bg-success-bg border-success-border text-pihole-green'
						: 'bg-danger-bg border-danger-border text-pihole-red',
				]"
			>
				{{ importFeedback.message }}
			</div>
		</div>
	</section>

	<Modal v-model="showExportWarning">
		<div class="flex items-start gap-3 mb-5">
			<AlertTriangle class="size-5 shrink-0 text-yellow-500 mt-0.5" />
			<div>
				<h2 class="text-sm font-semibold mb-1.5">
					{{ t('options.data.export.warning.title') }}
				</h2>
				<p class="text-xs text-secondary">
					{{ t('options.data.export.warning.description') }}
				</p>
			</div>
		</div>
		<div class="flex justify-end gap-2">
			<Button @click="showExportWarning = false">
				{{ t('options.data.export.warning.cancel') }}
			</Button>
			<Button variant="primary" @click="confirmExport">
				{{ t('options.data.export.warning.confirm') }}
			</Button>
		</div>
	</Modal>

	<Modal v-model="showResetConfirm">
		<div class="flex items-start gap-3 mb-5">
			<AlertTriangle class="size-5 shrink-0 text-yellow-500 mt-0.5" />
			<div>
				<h2 class="text-sm font-semibold mb-1.5">
					{{ t('options.data.reset.confirm.title') }}
				</h2>
				<p class="text-xs text-secondary">
					{{ t('options.data.reset.confirm.description') }}
				</p>
			</div>
		</div>
		<div class="flex justify-end gap-2">
			<Button @click="showResetConfirm = false">
				{{ t('options.data.reset.confirm.cancel') }}
			</Button>
			<Button variant="primary" @click="confirmReset">
				{{ t('options.data.reset.confirm.confirm') }}
			</Button>
		</div>
	</Modal>
</template>
