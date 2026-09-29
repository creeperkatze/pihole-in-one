# Pi-hole In One

Pi-hole In One is a browser extension to control Pi-holes from the browser, built with WXT, Vue 3, TypeScript, and Tailwind CSS.

This project uses pnpm.

## Commands

- `pnpm build` / `pnpm build:firefox` build for Chrome/Edge or Firefox.
- `pnpm zip` / `pnpm zip:firefox` package a zip for Chrome/Edge or Firefox.
- `pnpm lint` / `pnpm lint:fix` lint, optionally auto-fixing.
- `pnpm typecheck` checks the types. CI runs it together with `pnpm lint`.
- `pnpm intl:generate` regenerates `src/public/_locales` from `meta.summary` in each website locale file.
- Never run the `release:*` scripts or push tags. Releases are done by the maintainer.

## Rules

- Add and change strings only in `src/locales/en-US.json` (extension) or `website/src/locales/en-US.json` (website and store listing) and use them with `t('key')`. Other languages are managed via Crowdin and pulled automatically, so never edit them by hand.
- New features should be quick, glanceable actions that save a trip to the Pi-hole admin website, not screens that replicate what the admin website already does. Favor toggles and single-action buttons over anything needing its own list, search/filter, or multi-field form.
- Settings are stored in `browser.storage.local` via the settings helper.
- All Pi-hole requests go through the API client in `src/utils/api.ts`. The GitHub release check in `src/utils/update-check.ts` is the only other `fetch`.
- Build UI from the controls in `src/components/ui` before writing new ones.
- SVGs are imported as Vue components via the `?component` suffix (vite-svg-loader).
- Only write a comment when the code can't explain something itself. Keep it short and simple: no em dashes, no semicolons, no nested clauses.

For the folder layout, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
For the API client, sessions and host permissions, see [docs/API.md](docs/API.md).
For translations and the Crowdin sync, see [docs/LOCALIZATION.md](docs/LOCALIZATION.md).
