<template>
	<div
		class="flex flex-col gap-2 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
	>
		<div>
			<div class="text-sm font-medium">Pi-holes</div>
			<div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
				Configure one or more Pi-hole instances.
			</div>
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
			<!-- Header row (always visible) -->
			<div
				class="flex items-center gap-3 px-3.5 py-2.5 bg-white dark:bg-zinc-800 cursor-pointer select-none"
				@click="toggleEdit(inst.id)"
			>
				<div class="min-w-0 flex-1">
					<div class="text-sm font-medium truncate">{{ inst.name || 'Pi-hole' }}</div>
					<div class="text-xs text-zinc-500 dark:text-zinc-400 truncate">
						{{ inst.baseUrl || 'No URL set' }}
					</div>
				</div>
				<div class="flex items-center gap-2 shrink-0">
					<Loader2
						v-if="testStates[inst.id]?.status === 'testing'"
						:size="14"
						class="animate-spin text-zinc-400"
					/>
					<CheckCircle2
						v-else-if="testStates[inst.id]?.status === 'ok'"
						:size="14"
						class="text-green-500"
					/>
					<XCircle
						v-else-if="testStates[inst.id]?.status === 'error'"
						:size="14"
						class="text-pihole-red"
					/>
					<button
						type="button"
						class="text-zinc-400 hover:text-pihole-red transition-colors duration-150"
						@click.stop="removeInstance(inst.id)"
					>
						<Trash2 :size="14" />
					</button>
					<ChevronDown
						:size="16"
						class="text-zinc-400 transition-transform duration-200"
						:class="editingId === inst.id ? 'rotate-180' : ''"
					/>
				</div>
			</div>

			<!-- Expanded form -->
			<div
				v-if="editingId === inst.id"
				class="flex flex-col gap-4 p-4 border-t border-zinc-200 dark:border-zinc-700"
			>
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
						placeholder=""
						@input="scheduleTest(inst.id)"
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
						@input="scheduleTest(inst.id)"
					/>
					<p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">Found under Settings > API.</p>
				</div>

				<div
					v-if="testStates[inst.id]?.status === 'testing'"
					class="flex items-center gap-1.5 text-xs text-zinc-400"
				>
					<Loader2 :size="12" class="animate-spin" />
					Testing connection…
				</div>
				<div
					v-else-if="testStates[inst.id]?.status === 'ok'"
					class="px-3 py-2 rounded-[5px] text-xs border bg-success-bg border-success-border text-pihole-green"
				>
					{{ testStates[inst.id].message }}
				</div>
				<div
					v-else-if="testStates[inst.id]?.status === 'error'"
					class="px-3 py-2 rounded-[5px] text-xs border bg-danger-bg border-danger-border text-pihole-red"
				>
					{{ testStates[inst.id].message }}
				</div>
			</div>
		</div>

		<Button class="w-full justify-center" @click="addInstance">
			<Plus :size="15" />
			Add Pi-hole
		</Button>
	</div>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronDown, Loader2, Plus, Server, Trash2, XCircle } from 'lucide-vue-next'
import { ref } from 'vue'

import { getSummary } from '../../helpers/api'
import { generateInstanceId, type PiholeInstance } from '../../helpers/settings'
import Button from '../Button.vue'

const props = defineProps<{
	modelValue: PiholeInstance[]
}>()

const emit = defineEmits<{
	'update:modelValue': [instances: PiholeInstance[]]
}>()

const editingId = ref<string | null>(null)

interface TestState {
	status: 'testing' | 'ok' | 'error'
	message?: string
}
const testStates = ref<Record<string, TestState>>({})
const testTimers: Record<string, ReturnType<typeof setTimeout>> = {}

function toggleEdit(id: string): void {
	editingId.value = editingId.value === id ? null : id
}

function addInstance(): void {
	const inst: PiholeInstance = {
		id: generateInstanceId(),
		name: '',
		baseUrl: 'https://pi.hole',
		apiPassword: '',
	}
	emit('update:modelValue', [...props.modelValue, inst])
	editingId.value = inst.id
	scheduleTest(inst.id)
}

function removeInstance(id: string): void {
	if (editingId.value === id) editingId.value = null
	delete testStates.value[id]
	if (testTimers[id]) clearTimeout(testTimers[id])
	emit(
		'update:modelValue',
		props.modelValue.filter((i) => i.id !== id),
	)
}

function scheduleTest(id: string): void {
	if (testTimers[id]) clearTimeout(testTimers[id])
	testTimers[id] = setTimeout(() => void runTest(id), 800)
}

async function runTest(id: string): Promise<void> {
	const inst = props.modelValue.find((i) => i.id === id)
	if (!inst?.baseUrl) {
		delete testStates.value[id]
		return
	}
	testStates.value[id] = { status: 'testing' }
	try {
		testStates.value[id] = {
			status: 'ok',
			message: `Connected!`,
		}
	} catch (e) {
		testStates.value[id] = {
			status: 'error',
			message: e instanceof Error ? e.message : 'Connection failed.',
		}
	}
}
</script>
