import type { ColorScheme } from './settings'

let mediaQuery: MediaQueryList | null = null
let mediaHandler: (() => void) | null = null

function applyDark(dark: boolean): void {
	document.documentElement.classList.toggle('dark', dark)
}

export function applyColorScheme(scheme: ColorScheme): void {
	if (mediaQuery && mediaHandler) {
		mediaQuery.removeEventListener('change', mediaHandler)
		mediaQuery = null
		mediaHandler = null
	}

	if (scheme === 'dark') {
		applyDark(true)
	} else if (scheme === 'light') {
		applyDark(false)
	} else {
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		mediaHandler = () => applyDark(mediaQuery!.matches)
		applyDark(mediaQuery.matches)
		mediaQuery.addEventListener('change', mediaHandler)
	}
}
