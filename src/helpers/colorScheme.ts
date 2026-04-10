import type { ColorScheme } from './settings'

export function applyColorScheme(scheme: ColorScheme): void {
	localStorage.setItem('colorScheme', scheme)
	document.documentElement.classList.toggle('dark', scheme === 'dark')
	document.documentElement.classList.toggle('light', scheme === 'light')
}
