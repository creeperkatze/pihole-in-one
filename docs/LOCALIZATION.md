# Translations

Every locale is one nested JSON file in `src/locales`, named by its code, like `de-DE.json`. `en-US.json` is the source and the fallback for anything missing.

## Adding or changing strings

- Add strings to `src/locales/en-US.json` only. Other languages come from [Crowdin](https://crowdin.com/project/pihole-in-one) and are never edited by hand.
- Use them with `t('popup.status.title')` from `useI18n()`. Outside components, like in the background worker, use `i18n.global.t`.
- For links or formatting inside a string, use a placeholder and `<i18n-t>` with a slot, like the Crowdin link in the language setting.
- Strings use [ICU message syntax](https://formatjs.github.io/docs/core-concepts/icu-syntax/), compiled by `intl-messageformat`. Write plurals as `{count, plural, one {# message} other {# messages}}` so every language can use its own plural forms. An apostrophe before `{` or `}` escapes it.
- A key is either a string or a group of keys, never both.
- Top-level groups: `common` for shared words, `api` for API errors, and `options` and `popup` for the two pages.

## The Crowdin sync

- `i18n-push.yml` uploads the sources to Crowdin when they change on `main`: both `en-US.json` files and `website/faq.md`.
- `i18n-pull.yml` runs every Monday. It downloads the translations, runs `pnpm intl:prune` to drop empty strings and delete empty files, runs `pnpm intl:generate`, and opens a pull request.
- Renaming a key loses its translations in Crowdin. Avoid it unless the meaning changes.

## Enabling a language

A translated file does nothing on its own. To enable a language, import its file in `src/utils/i18n.ts`, add it to `messages`, and uncomment its entry in `LOCALES`. Then add its flag from `src/assets/icons/flags` to `FLAGS` in `CustomizationView.vue`. The typecheck fails until you do. Set `dir: 'rtl'` for right-to-left languages. The pages then set `<html lang>` and `dir` through `applyLocale()`.

## Website and store listing

The website has its own message files in `website/src/locales`, set up the same way with vue-i18n and ICU syntax. `meta` holds the store listing, which the website also shows. The other groups are the website UI.

- The FAQ is translated as a whole markdown file. Crowdin writes `website/de/faq.md` and so on, but only once a language is fully translated.
- To enable a website language, import its file in `website/.vitepress/i18n.ts` and add it to `locales` in `website/.vitepress/config.mts`. Then copy `website/index.md` to its folder, like `website/de/index.md`.
- `pnpm intl:generate` writes `src/public/_locales/*/messages.json` from each locale's `meta.summary`. The manifest uses it as the extension description.
- `node scripts/store-description.ts [locale] [--markdown] [--summary]` prints the full store description for a locale.
