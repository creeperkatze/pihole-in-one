<template>
	<div class="flex flex-col gap-2 py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-sm font-medium">Pi-holes</div>
				<div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
					Configure one or more Pi-hole instances.
				</div>
			</div>
			<button type="button" class="btn btn-sm btn-outline shrink-0" @click="addInstance">
				<Plus :size="13" />
				Add
			</button>
		</div>

		<div
			v-if="modelValue.length === 0"
			class="flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 text-sm"
		>
			<Server :size="22" class="opacity-40" />
			No Pi-holes configured. Add one to get started.
		</div>

		<div
			v-for="inst in modelValue"
			:key="inst.id"
			class="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
		>
			<!-- Collapsed row -->
			<div
				v-if="editingId !== inst.id"
				class="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50"
			>
				<div class="min-w-0">
					<div class="text-sm font-medium truncate">{{ inst.name || 'Pi-hole' }}</div>
					<div class="text-xs text-zinc-500 dark:text-zinc-400 truncate">
						{{ inst.baseUrl || 'No URL set' }}
					</div>
				</div>
				<div class="flex gap-1.5 shrink-0">
					<button type="button" class="btn btn-sm btn-outline" @click="editingId = inst.id">
						<Pencil :size="12" />
						Edit
					</button>
					<button
						type="button"
						class="btn btn-sm btn-outline text-pihole-red border-pihole-red/30 hover:bg-pihole-red/10"
						@click="removeInstance(inst.id)"
					>
						<Trash2 :size="12" />
					</button>
				</div>
			</div>

			<!-- Expanded edit form -->
			<div v-else class="flex flex-col gap-4 p-4">
				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium" :for="`name-${inst.id}`">Name</label>
					<input
						:id="`name-${inst.id}`"
						v-model="inst.name"
						class="input"
						type="text"
						placeholder="Pi-hole"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium" :for="`url-${inst.id}`">URL</label>
					<input
						:id="`url-${inst.id}`"
						v-model="inst.baseUrl"
						class="input"
						type="url"
						placeholder="https://pi.hole"
					/>
					<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						No trailing slash or <code class="font-mono">/api</code>.
					</p>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium" :for="`pass-${inst.id}`">API Password</label>
					<input
						:id="`pass-${inst.id}`"
						v-model="inst.apiPassword"
						class="input"
						type="password"
						placeholder="Leave empty if none is set"
						autocomplete="off"
					/>
					<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						Found in Pi-hole → Settings → API.
					</p>
				</div>

				<div class="flex items-center gap-2 flex-wrap">
					<button
						type="button"
						class="btn btn-outline"
						:disabled="testingId === inst.id || !inst.baseUrl"
						@click="testInstance(inst.id)"
					>
						{{ testingId === inst.id ? 'Testing…' : 'Test Connection' }}
					</button>
					<button type="button" class="btn" @click="editingId = null">Done</button>
				</div>

				<div
					v-if="testMessages[inst.id]"
					class="px-3 py-2 rounded-[5px] text-xs border"
					:class="
						testMessages[inst.id].type === 'success'
							? 'bg-success-bg border-success-border text-pihole-green'
							: 'bg-danger-bg border-danger-border text-pihole-red'
					"
				>
					{{ testMessages[inst.id].text }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Pencil, Plus, Server, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

import { getSummary } from '../../helpers/api'
import { generateInstanceId, type PiholeInstance } from '../../helpers/settings'

const props = defineProps<{
	modelValue: PiholeInstance[]
}>()

const emit = defineEmits<{
	'update:modelValue': [instances: PiholeInstance[]]
}>()

const editingId = ref<string | null>(null)
const testingId = ref<string | null>(null)
const testMessages = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

function addInstance(): void {
	const inst: PiholeInstance = {
		id: generateInstanceId(),
		name: '',
		baseUrl: '',
		apiPassword: '',
	}
	emit('update:modelValue', [...props.modelValue, inst])
	editingId.value = inst.id
}

function removeInstance(id: string): void {
	if (editingId.value === id) editingId.value = null
	delete testMessages.value[id]
	emit(
		'update:modelValue',
		props.modelValue.filter((i) => i.id !== id),
	)
}

async function testInstance(id: string): Promise<void> {
	const inst = props.modelValue.find((i) => i.id === id)
	if (!inst) return
	testingId.value = id
	delete testMessages.value[id]
	try {
		const summary = await getSummary(inst.baseUrl, inst.apiPassword)
		const blocked = summary.queries.blocked.toLocaleString()
		const total = summary.queries.total.toLocaleString()
		const status = summary.blocking.blocking === 'enabled' ? 'enabled' : 'disabled'
		testMessages.value[id] = {
			text: `Connected! Blocking ${status}. ${blocked} / ${total} queries blocked today.`,
			type: 'success',
		}
	} catch (e) {
		testMessages.value[id] = {
			text: e instanceof Error ? e.message : 'Connection failed.',
			type: 'error',
		}
	} finally {
		testingId.value = null
	}
}
</script>
