# Pi-hole In One

A browser extension (WXT + Vue 3 + TypeScript) to control Pi-hole from the browser.

## Commands

```bash
pnpm build # Build for Chrome/Edge
pnpm build:firefox # Build for Firefox
pnpm zip # Packaged zip for Chrome/Edge
pnpm zip:firefox # Packaged zip for Firefox
pnpm lint # Lint
pnpm lint:fix # Lint and auto-fix fixable issues
```

## Locales

**Never edit locale JSON files by hand.** They are generated from `defineMessages` calls in source files.

After adding or changing any `defineMessages` entry, regenerate:

```bash
pnpm intl:extract
```

This writes `src/locales/en-US/popup.json` and `src/locales/en-US/options.json`. Other languages are managed via Crowdin and pulled automatically.

## Architecture

- `src/entrypoints/popup/`: browser action popup (Vue SPA)
- `src/entrypoints/options/`: extension options page (Vue SPA + vue-router)
- `src/entrypoints/background.ts`: service worker (badge updates, refresh)
- `src/components/`: shared Vue components used by both entrypoints
- `src/composables/`: shared Vue composables
- `src/helpers/`: pure helpers (API client, formatting, i18n setup, settings)
- `src/locales/`: i18n message files (en-US is the source; others via Crowdin)

## Key conventions

- Settings are stored in `browser.storage.local` via `src/helpers/settings.ts`
- All API calls go through `src/helpers/api.ts`
- Tailwind CSS v4 for styling; `src/assets/main.css` defines CSS variables for theming
- SVGs imported as Vue components via `vite-svg-loader` (`?component` suffix)
