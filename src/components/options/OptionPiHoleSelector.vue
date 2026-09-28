<script setup lang="ts">
import { AlertTriangle, Eye, EyeOff, Loader2, Pencil, Plus, Server, Trash2 } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { browser } from 'wxt/browser'

import { useErrorMessage } from '../../composables/useApiMessages'
import { endSession, getPiHoleClient } from '../../utils/api'
import { INSTANCE_ICON_IDS, INSTANCE_ICONS, instanceIcon } from '../../utils/instance-icons'
import { generateInstanceId, type PiholeInstance } from '../../utils/settings'
import Modal from '../Modal.vue'
import Button from '../ui/Button.vue'
import InfoTip from '../ui/InfoTip.vue'
import Input from '../ui/Input.vue'

const props = defineProps<{
	modelValue: PiholeInstance[]
}>()

const emit = defineEmits<{
	'update:modelValue': [instances: PiholeInstance[]]
}>()

const { t } = useI18n()
const describeError = useErrorMessage()

interface Draft extends PiholeInstance {
	isNew: boolean
}

interface TestState {
	status: 'testing' | 'ok' | 'error'
	message: string
}

const draft = ref<Draft | null>(null)
const urlError = ref('')
const permissionError = ref('')
const showPassword = ref(false)
const removing = ref<PiholeInstance | null>(null)
const testStates = ref<Record<string, TestState>>({})

const rows = computed(() =>
	draft.value?.isNew ? [...props.modelValue, draft.value] : props.modelValue,
)

function displayName(inst: PiholeInstance): string {
	return inst.name || t('options.piholeselector.instance.fallbackName')
}

function toOrigin(baseUrl: string): string | null {
	try {
		const u = new URL(baseUrl)
		return `${u.protocol}//${u.host}/*`
	} catch {
		return null
	}
}

function normalizeUrl(value: string): string | null {
	const trimmed = value.trim()
	if (!trimmed) return null
	const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
	try {
		const url = new URL(withScheme)
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
		const path = url.pathname.replace(/\/+$/, '').replace(/\/api$/, '')
		return `${url.origin}${path}`
	} catch {
		return null
	}
}

function openForm(next: Draft): void {
	draft.value = next
	urlError.value = ''
	permissionError.value = ''
	showPassword.value = false
	void nextTick(() => document.getElementById(`url-${next.id}`)?.focus())
}

function addInstance(): void {
	openForm({
		id: generateInstanceId(),
		name: '',
		baseUrl: 'http://pi.hole',
		apiPassword: '',
		isNew: true,
	})
}

function toggleEdit(inst: PiholeInstance): void {
	if (draft.value?.id === inst.id) {
		closeForm()
	} else {
		openForm({ ...inst, isNew: false })
	}
}

function closeForm(): void {
	draft.value = null
}

async function releaseOrigin(baseUrl: string, remaining: PiholeInstance[]): Promise<void> {
	const origin = toOrigin(baseUrl)
	if (origin && !remaining.some((i) => toOrigin(i.baseUrl) === origin)) {
		await browser.permissions.remove({ origins: [origin] })
	}
}

async function save(): Promise<void> {
	const current = draft.value
	if (!current) return

	const baseUrl = normalizeUrl(current.baseUrl)
	const origin = baseUrl && toOrigin(baseUrl)
	if (!baseUrl || !origin) {
		urlError.value = t('options.piholeselector.instance.url.invalid')
		return
	}

	const granted = await browser.permissions.request({ origins: [origin] })
	if (!granted) {
		permissionError.value = t('options.piholeselector.permissionDenied')
		return
	}

	const { isNew, ...fields } = current
	const saved: PiholeInstance = { ...fields, name: fields.name.trim(), baseUrl }
	const previous = props.modelValue.find((i) => i.id === saved.id)
	const next = isNew
		? [...props.modelValue, saved]
		: props.modelValue.map((i) => (i.id === saved.id ? saved : i))

	emit('update:modelValue', next)
	closeForm()
	if (
		previous &&
		(previous.baseUrl !== saved.baseUrl || previous.apiPassword !== saved.apiPassword)
	) {
		await endSession(previous)
	}
	void runTest(saved)
	if (previous) await releaseOrigin(previous.baseUrl, next)
}

async function confirmRemove(): Promise<void> {
	const inst = removing.value
	if (!inst) return
	removing.value = null
	if (draft.value?.id === inst.id) closeForm()
	delete testStates.value[inst.id]

	const next = props.modelValue.filter((i) => i.id !== inst.id)
	emit('update:modelValue', next)
	await endSession(inst)
	await releaseOrigin(inst.baseUrl, next)
}

async function runTest(inst: PiholeInstance): Promise<void> {
	testStates.value[inst.id] = {
		status: 'testing',
		message: t('options.piholeselector.instance.testing'),
	}
	try {
		await getPiHoleClient(inst).getSummary()
		testStates.value[inst.id] = {
			status: 'ok',
			message: t('options.piholeselector.instance.connected'),
		}
	} catch (e) {
		testStates.value[inst.id] = {
			status: 'error',
			message: describeError(e, 'options.piholeselector.instance.connectionFailed'),
		}
	}
}

watch(
	() => props.modelValue,
	(instances) => {
		for (const inst of instances) {
			if (!testStates.value[inst.id]) void runTest(inst)
		}
	},
	{ immediate: true },
)
</script>

<template>
	<div class="flex flex-col gap-3 rounded-lg border border-border bg-surface-3 px-3 py-2">
		<div class="flex min-w-0 items-center gap-3">
			<Server :size="18" class="shrink-0 text-secondary" />
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">{{ t('options.piholeselector.title') }}</p>
				<p class="mt-0.5 text-xs text-secondary">
					{{ t('options.piholeselector.description') }}
				</p>
			</div>
			<Button :disabled="draft?.isNew" @click="addInstance">
				<Plus class="size-4" />
				{{ t('options.piholeselector.addButton') }}
			</Button>
		</div>

		<p
			v-if="rows.length === 0"
			class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-secondary"
		>
			{{ t('options.piholeselector.empty') }}
		</p>

		<ul v-else class="flex flex-col gap-2 pb-1">
			<li
				v-for="inst in rows"
				:key="inst.id"
				class="rounded-lg border border-border bg-surface-control"
			>
				<div class="flex min-w-0 items-center gap-3 px-3 py-2">
					<button
						type="button"
						class="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface-3 text-secondary disabled:cursor-default"
						:title="testStates[inst.id]?.message ?? t('options.piholeselector.instance.retest')"
						:aria-label="t('options.piholeselector.instance.retest')"
						:disabled="draft?.isNew && draft.id === inst.id"
						@click="runTest(inst)"
					>
						<component
							:is="instanceIcon(draft?.id === inst.id ? draft.icon : inst.icon)"
							class="size-4.5"
						/>
						<span
							class="absolute -inset-e-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-surface-control"
						>
							<Loader2
								v-if="testStates[inst.id]?.status === 'testing'"
								class="size-3 animate-spin text-secondary"
							/>
							<span
								v-else
								class="size-2 rounded-full"
								:class="
									testStates[inst.id]?.status === 'ok'
										? 'bg-pihole-green'
										: testStates[inst.id]?.status === 'error'
											? 'bg-pihole-red'
											: 'bg-border'
								"
							/>
						</span>
					</button>

					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{{ displayName(inst) }}</p>
						<p class="truncate text-xs text-secondary">{{ inst.baseUrl }}</p>
						<p
							v-if="testStates[inst.id]?.status === 'error' && draft?.id !== inst.id"
							class="truncate text-xs text-pihole-red"
						>
							{{ testStates[inst.id]?.message }}
						</p>
					</div>

					<div v-if="!(draft?.isNew && draft.id === inst.id)" class="flex shrink-0 gap-1.5">
						<Button
							size="sm"
							:title="t('options.piholeselector.instance.edit')"
							:aria-label="t('options.piholeselector.instance.edit')"
							@click="toggleEdit(inst)"
						>
							<Pencil class="size-4" />
						</Button>
						<Button
							size="sm"
							:title="t('options.piholeselector.remove.button')"
							:aria-label="t('options.piholeselector.remove.button')"
							@click="removing = inst"
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				</div>

				<form
					v-if="draft && draft.id === inst.id"
					class="flex flex-col gap-3 border-t border-border px-3 pt-3 pb-3"
					@submit.prevent="save"
				>
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-medium text-secondary" :for="`url-${inst.id}`">
							{{ t('options.piholeselector.instance.url.label') }}
						</label>
						<Input
							:id="`url-${inst.id}`"
							v-model="draft.baseUrl"
							type="text"
							inputmode="url"
							autocomplete="off"
							spellcheck="false"
							placeholder="http://pi.hole"
							class="w-full"
							@input="urlError = ''"
						/>
						<p v-if="urlError" class="text-xs text-pihole-red">{{ urlError }}</p>
					</div>

					<div class="grid items-start gap-3 sm:grid-cols-2">
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-medium text-secondary" :for="`name-${inst.id}`">
								{{ t('options.piholeselector.instance.name.label') }}
							</label>
							<Input
								:id="`name-${inst.id}`"
								v-model="draft.name"
								type="text"
								autocomplete="off"
								class="w-full"
								:placeholder="t('options.piholeselector.instance.name.placeholder')"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-center gap-1.5">
								<label class="text-xs font-medium text-secondary" :for="`pass-${inst.id}`">
									{{ t('options.piholeselector.instance.apiPassword.label') }}
								</label>
								<InfoTip :text="t('options.piholeselector.instance.apiPassword.hint')" />
							</div>
							<div class="relative">
								<Input
									:id="`pass-${inst.id}`"
									v-model="draft.apiPassword"
									:type="showPassword ? 'text' : 'password'"
									autocomplete="off"
									class="w-full pe-9"
									:placeholder="t('options.piholeselector.instance.apiPassword.placeholder')"
								/>
								<button
									type="button"
									class="absolute inset-e-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-secondary transition-colors hover:text-primary"
									:title="
										showPassword
											? t('options.piholeselector.instance.apiPassword.hide')
											: t('options.piholeselector.instance.apiPassword.show')
									"
									@click="showPassword = !showPassword"
								>
									<EyeOff v-if="showPassword" class="size-4" />
									<Eye v-else class="size-4" />
								</button>
							</div>
						</div>
					</div>

					<div class="flex flex-col gap-1.5">
						<span :id="`icon-${inst.id}`" class="text-xs font-medium text-secondary">
							{{ t('options.piholeselector.instance.icon.label') }}
						</span>
						<div
							class="flex flex-wrap gap-1.5"
							role="radiogroup"
							:aria-labelledby="`icon-${inst.id}`"
						>
							<Button
								v-for="id in INSTANCE_ICON_IDS"
								:key="id"
								size="icon"
								role="radio"
								:active="(draft.icon ?? 'server') === id"
								:aria-checked="(draft.icon ?? 'server') === id"
								:title="t(`options.piholeselector.instance.icon.options.${id}`)"
								:aria-label="t(`options.piholeselector.instance.icon.options.${id}`)"
								@click="draft.icon = id"
							>
								<component :is="INSTANCE_ICONS[id]" class="size-4" />
							</Button>
						</div>
					</div>

					<p
						v-if="permissionError"
						class="rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-xs text-pihole-red"
					>
						{{ permissionError }}
					</p>

					<div class="flex justify-end gap-2">
						<Button @click="closeForm">
							{{ t('options.piholeselector.instance.cancel') }}
						</Button>
						<Button type="submit" variant="primary">
							{{ t('options.piholeselector.instance.save') }}
						</Button>
					</div>
				</form>
			</li>
		</ul>
	</div>

	<Modal :model-value="removing !== null" @update:model-value="removing = null">
		<div class="mb-5 flex items-start gap-3">
			<AlertTriangle class="mt-0.5 size-5 shrink-0 text-yellow-500" />
			<div>
				<h2 class="mb-1.5 text-sm font-semibold">
					{{
						t('options.piholeselector.remove.title', { name: removing && displayName(removing) })
					}}
				</h2>
				<p class="text-xs text-secondary">{{ t('options.piholeselector.remove.description') }}</p>
			</div>
		</div>
		<div class="flex justify-end gap-2">
			<Button @click="removing = null">{{ t('options.piholeselector.remove.cancel') }}</Button>
			<Button variant="primary" @click="confirmRemove">
				{{ t('options.piholeselector.remove.confirm') }}
			</Button>
		</div>
	</Modal>
</template>
