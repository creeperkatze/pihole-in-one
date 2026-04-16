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
				v-if="localValue.length === 0"
				class="flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-border text-muted text-sm"
			>
				{{ formatMessage(messages['options.piholeselector.empty']) }}
			</div>

			<div
				v-for="inst in localValue"
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
						<Button size="small" variant="outline" @click="void removeInstance(inst.id)">
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
				<div
					v-if="editingId === inst.id"
					class="flex flex-col gap-4 p-4 border-t border-border bg-surface-raised"
				>
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
							@input="isDirty = true"
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
							@input="isDirty = true"
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
							@input="isDirty = true"
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
					<div
						v-if="permissionError"
						class="px-3 py-2 rounded-[5px] text-xs border bg-danger-bg border-danger-border text-pihole-red"
					>
						{{ permissionError }}
					</div>
					<div class="flex justify-start">
						<Button variant="primary" :disabled="!isDirty" @click="save">
							<Save class="size-4" />
							Save
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export type PiHoleOption = {
	id: string
	type: 'pihole'
	label: string
	description: string
}
</script>

<script setup lang="ts">
import { defineMessages } from '@formatjs/intl'
import {
	CheckCircle2,
	ChevronDown,
	Loader2,
	Plus,
	Save,
	Server,
	Trash2,
	XCircle,
} from '@lucide/vue'
import { ref, watch } from 'vue'
import { browser } from 'wxt/browser'

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

// Local working copy — only committed to parent on explicit Save
const localValue = ref<PiholeInstance[]>(props.modelValue.map((i) => ({ ...i })))
const isDirty = ref(false)
const permissionError = ref('')

const editingId = ref<string | null>(null)

interface TestState {
	status: 'testing' | 'ok' | 'error'
	message?: string
}
const testStates = ref<Record<string, TestState>>({})

function toOrigin(baseUrl: string): string | null {
	try {
		const u = new URL(baseUrl)
		return `${u.protocol}//${u.host}/*`
	} catch {
		return null
	}
}

async function save(): Promise<void> {
	const newOrigins = localValue.value
		.map((i) => toOrigin(i.baseUrl))
		.filter((o): o is string => o !== null)
	const oldOrigins = props.modelValue
		.map((i) => toOrigin(i.baseUrl))
		.filter((o): o is string => o !== null)
	const removedOrigins = oldOrigins.filter((o) => !newOrigins.includes(o))

	if (newOrigins.length > 0) {
		const granted = await browser.permissions.request({ origins: newOrigins })
		if (!granted) {
			permissionError.value = 'Permission denied. Grant access to your Pi-hole host to continue.'
			return
		}
	}

	if (removedOrigins.length > 0) {
		await browser.permissions.remove({ origins: removedOrigins })
	}

	permissionError.value = ''
	emit(
		'update:modelValue',
		localValue.value.map((i) => ({ ...i })),
	)
	isDirty.value = false
	for (const inst of localValue.value) {
		void runTest(inst.id)
	}
}

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
	localValue.value = [...localValue.value, inst]
	isDirty.value = true
	editingId.value = inst.id
}

async function removeInstance(id: string): Promise<void> {
	const inst = localValue.value.find((i) => i.id === id)
	if (editingId.value === id) editingId.value = null
	delete testStates.value[id]
	localValue.value = localValue.value.filter((i) => i.id !== id)

	if (inst?.baseUrl) {
		const origin = toOrigin(inst.baseUrl)
		const stillUsed = origin && localValue.value.some((i) => toOrigin(i.baseUrl) === origin)
		if (origin && !stillUsed) await browser.permissions.remove({ origins: [origin] })
	}

	emit(
		'update:modelValue',
		localValue.value.map((i) => ({ ...i })),
	)
}

async function runTest(id: string): Promise<void> {
	const inst = localValue.value.find((i) => i.id === id)
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
		if (!isDirty.value) {
			localValue.value = instances.map((i) => ({ ...i }))
		}
		for (const inst of instances) {
			if (!testStates.value[inst.id]) void runTest(inst.id)
		}
	},
	{ immediate: true },
)
</script>
