import {
	Briefcase,
	Building2,
	Cloud,
	Cpu,
	HardDrive,
	House,
	Laptop,
	Monitor,
	Router,
	Server,
	Wifi,
} from '@lucide/vue'
import type { Component } from 'vue'

export const INSTANCE_ICONS = {
	server: Server,
	house: House,
	building: Building2,
	briefcase: Briefcase,
	laptop: Laptop,
	monitor: Monitor,
	router: Router,
	wifi: Wifi,
	cloud: Cloud,
	hardDrive: HardDrive,
	cpu: Cpu,
} satisfies Record<string, Component>

export type InstanceIconId = keyof typeof INSTANCE_ICONS

export const INSTANCE_ICON_IDS = Object.keys(INSTANCE_ICONS) as InstanceIconId[]

export function instanceIcon(id: string | undefined): Component {
	return INSTANCE_ICONS[id as InstanceIconId] ?? Server
}
