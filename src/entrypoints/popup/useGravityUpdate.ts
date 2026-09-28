import { computed, reactive } from 'vue'

import { useErrorMessage } from '../../composables/useApiMessages'
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
	const describeError = useErrorMessage()

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
			current.error = describeError(e, 'popup.lists.gravity.error')
		} finally {
			current.updating = false
		}
	}

	return { state, run }
}
