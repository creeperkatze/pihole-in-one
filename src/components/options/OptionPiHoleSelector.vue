<template>
	<div class="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border bg-surface-3">
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<Server class="size-5 shrink-0 text-muted" />
				<div>
					<div class="text-sm font-medium">
						{{ formatMessage(messages['options.piholeselector.title']) }}
					</div>
					<div class="text-xs text-secondary mt-0.5">
						{{ formatMessage(messages['options.piholeselector.description']) }}
					</div>
				</div>
			</div>
			<Button class="shrink-0" @click="addInstance">
				<Plus class="size-4" />
				{{ formatMessage(messages['options.piholeselector.addButton']) }}
			</Button>
		</div>

		<div class="flex flex-col gap-2 pl-7">
			<div
				v-if="modelValue.length === 0"
				class="flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-border text-muted text-sm"
			>
				{{ formatMessage(messages['options.piholeselector.empty']) }}
			</div>

			<div
				v-for="inst in modelValue"
				:key="inst.id"
				class="rounded-lg border border-border overflow-hidden"
			>
				<!-- Header row (always visible) -->
				<div class="flex items-center gap-3 px-3.5 py-2.5 bg-surface-raised">
					<div class="min-w-0 flex-1">
						<div class="text-sm font-medium truncate">
							{{
								inst.name || formatMessage(messages['options.piholeselector.instance.fallbackName'])
							}}
						</div>
						<div class="text-xs text-secondary truncate">
							{{ inst.baseUrl || formatMessage(messages['options.piholeselector.instance.noUrl']) }}
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Loader2
							v-if="testStates[inst.id]?.status === 'testing'"
							class="size-4 animate-spin text-zinc-400"
						/>
						<CheckCircle2
							v-else-if="testStates[inst.id]?.status === 'ok'"
							class="size-4 text-green-500"
						/>
						<XCircle
							v-else-if="testStates[inst.id]?.status === 'error'"
							class="size-4 text-pihole-red"
						/>
						<Button size="small" variant="outline" @click="removeInstance(inst.id)">
							<Trash2 class="size-4" />
						</Button>
						<Button size="small" variant="outline" @click="toggleEdit(inst.id)">
							<ChevronDown
								class="size-4 transition-transform duration-200"
								:class="editingId === inst.id ? 'rotate-180' : ''"
							/>
						</Button>
					</div>
				</div>

				<!-- Expanded form -->
				<div v-if="editingId === inst.id" class="flex flex-col gap-4 p-4 border-t border-border">
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" :for="`name-${inst.id}`">
							{{ formatMessage(messages['options.piholeselector.instance.name.label']) }}
						</label>
						<Input
							:id="`name-${inst.id}`"
							v-model="inst.name"
							type="text"
							class="w-full"
							:placeholder="
								formatMessage(messages['options.piholeselector.instance.name.placeholder'])
							"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" :for="`url-${inst.id}`">
							{{ formatMessage(messages['options.piholeselector.instance.url.label']) }}
						</label>
						<Input
							:id="`url-${inst.id}`"
							v-model="inst.baseUrl"
							type="url"
							class="w-full"
							placeholder=""
							@input="scheduleTest(inst.id)"
						/>
						<p class="m-0 text-xs text-secondary">
							No trailing slash or <code class="font-mono">/api</code>.
						</p>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" :for="`pass-${inst.id}`">
							{{ formatMessage(messages['options.piholeselector.instance.apiPassword.label']) }}
						</label>
						<Input
							:id="`pass-${inst.id}`"
							v-model="inst.apiPassword"
							type="password"
							class="w-full"
							:placeholder="
								formatMessage(messages['options.piholeselector.instance.apiPassword.placeholder'])
							"
							autocomplete="off"
							@input="scheduleTest(inst.id)"
						/>
						<p class="m-0 text-xs text-secondary">
							{{ formatMessage(messages['options.piholeselector.instance.apiPassword.hint']) }}
						</p>
					</div>

					<div
						v-if="testStates[inst.id]?.status === 'testing'"
						class="flex items-center gap-1.5 text-xs text-zinc-400"
					>
						<Loader2 class="size-4 animate-spin" />
						{{ formatMessage(messages['options.piholeselector.instance.testing']) }}
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
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import { CheckCircle2, ChevronDown, Loader2, Plus, Server, Trash2, XCircle } from '@lucide/vue'
import { ref, watch } from 'vue'

import { getSummary } from '../../helpers/api'
import { useVIntl } from '../../helpers/i18n'
import { generateInstanceId, type PiholeInstance } from '../../helpers/settings'
import Button from '../Button.vue'
import Input from '../Input.vue'

const props = defineProps<{
	modelValue: PiholeInstance[]
}>()

const emit = defineEmits<{
	'update:modelValue': [instances: PiholeInstance[]]
}>()

const { formatMessage } = useVIntl()
const messages = defineMessages({
	'options.piholeselector.title': {
		id: 'options.piholeselector.title',
		defaultMessage: 'Pi-holes',
	},
	'options.piholeselector.description': {
		id: 'options.piholeselector.description',
		defaultMessage: 'Configure one or more Pi-hole instances.',
	},
	'options.piholeselector.empty': {
		id: 'options.piholeselector.empty',
		defaultMessage: 'No Pi-holes configured. Add one to get started.',
	},
	'options.piholeselector.instance.fallbackName': {
		id: 'options.piholeselector.instance.fallbackName',
		defaultMessage: 'Pi-hole',
	},
	'options.piholeselector.instance.noUrl': {
		id: 'options.piholeselector.instance.noUrl',
		defaultMessage: 'No URL set',
	},
	'options.piholeselector.instance.name.label': {
		id: 'options.piholeselector.instance.name.label',
		defaultMessage: 'Name',
	},
	'options.piholeselector.instance.name.placeholder': {
		id: 'options.piholeselector.instance.name.placeholder',
		defaultMessage: 'Pi-hole',
	},
	'options.piholeselector.instance.url.label': {
		id: 'options.piholeselector.instance.url.label',
		defaultMessage: 'URL',
	},
	'options.piholeselector.instance.apiPassword.label': {
		id: 'options.piholeselector.instance.apiPassword.label',
		defaultMessage: 'API Password',
	},
	'options.piholeselector.instance.apiPassword.placeholder': {
		id: 'options.piholeselector.instance.apiPassword.placeholder',
		defaultMessage: 'Leave empty if none is set',
	},
	'options.piholeselector.instance.apiPassword.hint': {
		id: 'options.piholeselector.instance.apiPassword.hint',
		defaultMessage: 'Found under Settings > API.',
	},
	'options.piholeselector.instance.testing': {
		id: 'options.piholeselector.instance.testing',
		defaultMessage: 'Testing connection...',
	},
	'options.piholeselector.instance.connected': {
		id: 'options.piholeselector.instance.connected',
		defaultMessage: 'Connected!',
	},
	'options.piholeselector.instance.connectionFailed': {
		id: 'options.piholeselector.instance.connectionFailed',
		defaultMessage: 'Connection failed',
	},
	'options.piholeselector.addButton': {
		id: 'options.piholeselector.addButton',
		defaultMessage: 'Add Pi-hole',
	},
})

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
		baseUrl: 'http://pi.hole',
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
		await getSummary(inst.baseUrl, inst.apiPassword)
		testStates.value[id] = {
			status: 'ok',
			message: formatMessage(messages['options.piholeselector.instance.connected']),
		}
	} catch (e) {
		testStates.value[id] = {
			status: 'error',
			message:
				e instanceof Error
					? e.message
					: formatMessage(messages['options.piholeselector.instance.connectionFailed']),
		}
	}
}

watch(
	() => props.modelValue,
	(instances) => {
		for (const inst of instances) {
			if (!testStates.value[inst.id]) void runTest(inst.id)
		}
	},
	{ immediate: true },
)
</script>
