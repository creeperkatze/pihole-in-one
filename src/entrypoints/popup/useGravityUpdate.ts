import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import { updateGravity } from '../../utils/api'
import type { PiholeInstance } from '../../utils/settings'

interface GravityState {
	updating: boolean
	updated: boolean
	error: string
}

// Module-level so a running update survives switching tabs or Pi-holes
const states = reactive<Record<string, GravityState>>({})
const resetTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export function useGravityUpdate(instance: () => PiholeInstance) {
	const { t } = useI18n()

	const state = computed<GravityState>(
		() => states[instance().id] ?? { updating: false, updated: false, error: '' },
	)

	async function run(): Promise<void> {
		const inst = instance()
		states[inst.id] = { updating: true, updated: false, error: '' }
		const current = states[inst.id]!
		clearTimeout(resetTimers[inst.id])
		try {
			await updateGravity(inst)
			current.updated = true
			resetTimers[inst.id] = setTimeout(() => {
				current.updated = false
			}, 3000)
		} catch (e) {
			current.error = e instanceof Error ? e.message : t('popup.lists.gravity.error')
		} finally {
			current.updating = false
		}
	}

	return { state, run }
}
