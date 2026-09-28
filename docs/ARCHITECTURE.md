# Architecture

- `src/entrypoints/popup/`: browser action popup (Vue SPA)
- `src/entrypoints/options/`: extension options page (Vue SPA + vue-router)
- `src/entrypoints/background.ts`: service worker (badge updates, refresh)
- `src/components/`: shared Vue components used by both entrypoints
- `src/composables/`: shared Vue composables
- `src/utils/`: shared utilities (API client, formatting, i18n setup, settings)
- `src/locales/`: one message file per locale (`en-US.json` is the source, others via Crowdin)
