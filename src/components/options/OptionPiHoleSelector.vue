<template>
	<div class="flex flex-col gap-2 rounded-lg border border-border bg-surface-3 px-3 py-2">
		<div class="flex min-w-0 items-center gap-3">
			<Server :size="18" class="shrink-0 text-secondary" />
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">{{ t('options.piholeselector.title') }}</p>
				<p class="mt-0.5 text-xs text-secondary">
					{{ t('options.piholeselector.description') }}
				</p>
			</div>
			<Button @click="addInstance">
				<Plus class="size-4" />
				{{ t('options.piholeselector.addButton') }}
			</Button>
		</div>

		<div class="flex flex-col gap-2 ps-7.5">
			<div
				v-if="localValue.length === 0"
				class="flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-border text-muted text-sm"
			>
				{{ t('options.piholeselector.empty') }}
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
							{{ inst.name || t('options.piholeselector.instance.fallbackName') }}
						</div>
						<div class="text-xs text-secondary truncate">
							{{ inst.baseUrl || t('options.piholeselector.instance.noUrl') }}
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
						<Button size="sm" @click="void removeInstance(inst.id)">
							<Trash2 class="size-4" />
						</Button>
						<Button size="sm" @click="toggleEdit(inst.id)">
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
							{{ t('options.piholeselector.instance.name.label') }}
						</label>
						<Input
							:id="`name-${inst.id}`"
							v-model="inst.name"
							type="text"
							class="w-full"
							:placeholder="t('options.piholeselector.instance.name.placeholder')"
							@input="isDirty = true"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" :for="`url-${inst.id}`">
							{{ t('options.piholeselector.instance.url.label') }}
						</label>
						<Input
							:id="`url-${inst.id}`"
							v-model="inst.baseUrl"
							type="url"
							class="w-full"
							placeholder=""
							@input="isDirty = true"
						/>
						<i18n-t
							keypath="options.piholeselector.instance.url.hint"
							tag="p"
							class="m-0 text-xs text-secondary"
						>
							<template #api><code class="font-mono">/api</code></template>
						</i18n-t>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" :for="`pass-${inst.id}`">
							{{ t('options.piholeselector.instance.apiPassword.label') }}
						</label>
						<Input
							:id="`pass-${inst.id}`"
							v-model="inst.apiPassword"
							type="password"
							class="w-full"
							:placeholder="t('options.piholeselector.instance.apiPassword.placeholder')"
							autocomplete="off"
							@input="isDirty = true"
						/>
						<p class="m-0 text-xs text-secondary">
							{{ t('options.piholeselector.instance.apiPassword.hint') }}
						</p>
					</div>

					<div
						v-if="testStates[inst.id]?.status === 'testing'"
						class="flex items-center gap-1.5 text-xs text-zinc-400"
					>
						<Loader2 class="size-4 animate-spin" />
						{{ t('options.piholeselector.instance.testing') }}
					</div>
					<div
						v-else-if="testStates[inst.id]?.status === 'ok'"
						class="px-3 py-2 rounded-[5px] text-xs border bg-success-bg border-success-border text-pihole-green"
					>
						{{ testStates[inst.id]?.message }}
					</div>
					<div
						v-else-if="testStates[inst.id]?.status === 'error'"
						class="px-3 py-2 rounded-[5px] text-xs border bg-danger-bg border-danger-border text-pihole-red"
					>
						{{ testStates[inst.id]?.message }}
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
							{{ t('options.piholeselector.instance.save') }}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
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
import { PiHoleError } from 'pihole-js'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { browser } from 'wxt/browser'

import { getApiMessageForError } from '../../composables/useApiMessages'
import { getPiHoleClient } from '../../utils/api'
import { generateInstanceId, type PiholeInstance } from '../../utils/settings'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'

const props = defineProps<{
	modelValue: PiholeInstance[]
}>()

const emit = defineEmits<{
	'update:modelValue': [instances: PiholeInstance[]]
}>()

const { t } = useI18n()

// Local working copy, only committed to parent on explicit Save
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
		await getPiHoleClient(inst).getSummary()
		testStates.value[id] = {
			status: 'ok',
			message: t('options.piholeselector.instance.connected'),
		}
	} catch (e) {
		const apiMessage = getApiMessageForError(e)
		testStates.value[id] = {
			status: 'error',
			message: apiMessage
				? t(apiMessage)
				: e instanceof PiHoleError
					? e.message
					: e instanceof Error
						? e.message
						: t('options.piholeselector.instance.connectionFailed'),
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
