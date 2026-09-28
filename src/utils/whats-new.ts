import { storage } from '@wxt-dev/storage'

// Users updating from this version or older get the redesign notice once
const LAST_VERSION_BEFORE_REDESIGN = '1.3.4'

export const redesignNoticeItem = storage.defineItem<boolean>('local:redesignNotice', {
	fallback: false,
})

function compareVersions(a: string, b: string): number {
	const pa = a.split('.').map(Number)
	const pb = b.split('.').map(Number)
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
		if (diff !== 0) return diff
	}
	return 0
}

export function isUpdateFromBeforeRedesign(previousVersion: string): boolean {
	return compareVersions(previousVersion, LAST_VERSION_BEFORE_REDESIGN) <= 0
}
