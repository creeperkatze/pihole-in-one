import { PostHog } from 'posthog-js/dist/module.no-external'
import { browser } from 'wxt/browser'

import { getSettings } from './settings'

const POSTHOG_TOKEN = 'phc_vQMdbX9Vmj3HAmXXyGHDAmEovw9zqjB7CXd72YUp6JJr'
const POSTHOG_HOST = 'https://hedgehog.creeperkatze.dev'

let posthog: PostHog | null = null
let enabled = true
const queue: Array<{ event: string; properties?: Record<string, unknown> }> = []

export function setTelemetryEnabled(value: boolean): void {
	enabled = value
	if (!value) posthog?.opt_out_capturing()
	else posthog?.opt_in_capturing()
}

async function getSharedDistinctId(): Promise<string> {
	const stored = await browser.storage.local.get(['posthog_distinct_id'])
	if (stored.posthog_distinct_id) {
		return stored.posthog_distinct_id as string
	}
	const distinctId = crypto.randomUUID()
	await browser.storage.local.set({ posthog_distinct_id: distinctId })
	return distinctId
}

export async function initTelemetry(): Promise<void> {
	if (import.meta.env.VITE_IS_TESTING) {
		enabled = false
		return
	}
	const settings = await getSettings()
	if (!settings.telemetry) {
		enabled = false
		return
	}

	// On Firefox, respect the built-in data collection consent experience
	const perms = await browser.permissions.getAll()
	if ('data_collection' in perms) {
		const granted = (perms as unknown as { data_collection: string[] }).data_collection
		if (!granted.includes('technicalAndInteraction')) {
			enabled = false
			return
		}
	}

	const distinctId = await getSharedDistinctId()
	const userAgent = navigator.userAgent
	let browserName = 'unknown'
	if (userAgent.includes('Firefox')) browserName = 'firefox'
	else if (userAgent.includes('Edg')) browserName = 'edge'
	else if (userAgent.includes('Chrome')) browserName = 'chrome'
	else if (userAgent.includes('Safari')) browserName = 'safari'

	posthog = new PostHog()
	posthog.init(POSTHOG_TOKEN, {
		api_host: POSTHOG_HOST,
		bootstrap: { distinctID: distinctId },
		disable_external_dependency_loading: true,
		persistence: 'localStorage',
		autocapture: false,
		capture_pageview: false,
		capture_pageleave: false,
		disable_session_recording: true,
		sanitize_properties: (properties) => {
			for (const key of Object.keys(properties)) {
				if (key.startsWith('$')) delete properties[key]
			}
			return properties
		},
	})
	const version = browser.runtime.getManifest().version
	posthog.register({ extension_version: version, browser: browserName })

	for (const { event, properties } of queue.splice(0)) {
		posthog.capture(event, properties)
	}
}

export function capture(event: string, properties?: Record<string, unknown>): void {
	if (!enabled) return
	if (posthog) {
		posthog.capture(event, properties)
	} else {
		queue.push({ event, properties })
	}
}
