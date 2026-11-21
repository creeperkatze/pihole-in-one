# Changelog

## [Unreleased]

### Added

- Added Czech translation.

## [1.5.0] - 2026-10-18

### Added

- Added a right-click menu to turn blocking on or off, pause it for a set time, and whitelist or block the current site. It can be turned off in the Customization settings.
- Added a custom pause duration. Click the timer button next to the presets to pause blocking for any number of minutes or hours.
- Added buttons to extend a running pause.
- Added "Blocked today" and "Queries today" options for the toolbar badge.

### Changed

- While blocking is paused, the toolbar badge now counts down the time left.
- The toolbar badge now shows a yellow "!" when no Pi-hole can be reached, instead of going blank.
- Pi-hole addresses that redirect from HTTP to HTTPS now show a clear error explaining how to fix it, instead of a generic "Can't reach the Pi-hole" message.
- Connection errors in the Pi-hole settings are now shown in full instead of being cut off.
- Updated translations.

### Fixed

- Fixed whitelisting or blocking a site at an IPv6 address creating a rule that could match unrelated domains.

Some of the ideas in this release came from the [Pi-hole browser extension](https://github.com/badsgahhl/pihole-browser-extension), another browser extension for managing your Pi-hole!

## [1.4.2] - 2026-09-30

### Added

- Added a "Recently blocked" card to the home view, disabled by default. It shows the domains blocked for your device in the last 10 minutes, with a button to whitelist each one. If your device can't be matched, it shows blocks from all devices instead.

### Changed

- Updated the German translation.

## [1.4.1] - 2026-09-29

### Added

- Added an update badge to the "Open Pi-hole" button when a Pi-hole update is available.
- The "Open Pi-hole" button now shows the number of unread diagnosis messages and available updates on hover.

### Changed

- Errors are now clear and human-readable, for example when the Pi-hole can't be reached or has no free login sessions left.
- Errors now show in place of the current view, with a button to fix them in the settings or directly in the Pi-hole.
- Made all empty and error states consistent.

### Fixed

- Fixed the update check taking a long time when the Pi-hole can't be reached.
- Fixed a removed Pi-hole still working without a password when added again.
- Fixed empty group and domain lists showing below errors.

## [1.4.0] - 2026-09-28

The biggest update to Pi-hole In One yet, with a fully redesigned popup and settings.

### Added

- Added tabs to the popup for Home, Groups, Lists and Domains.
- Added a domains tab to view, remove and add whitelisted or blocked domains, including regex patterns.
- Added custom icons for each Pi-hole.
- Added a notice badge to the "Open Pi-hole" button when your Pi-hole has unread diagnosis messages.
- Added a Popup settings page to choose which cards each view shows.
- Added support for right-to-left languages, if any get translated in the future.

### Changed

- Redesigned the popup around clean cards, with blocking, statistics and the current site on the home view.
- Redesigned the settings, including a much simpler Pi-hole setup with live connection status and automatic address cleanup.
- Moved the gravity update to its own card in the lists view.
- System info is now an optional card on the home view.

### Removed

- Removed the settings search and the donut charts.

### Fixed

- Fixed gravity updates reporting a failure on longer runs.
- Fixed the toolbar badge ignoring the browser language when set to automatic.

A huge thank you to everyone who uses Pi-hole In One, reports issues, translates on Crowdin or supports the project on Ko-fi <3

## [1.3.4] - 2026-08-25

### Changed

- Updated translations.

## [1.3.3] - 2026-08-25

### Added

- Added a refresh button to the lists section.

### Changed

- Updated the api password wording to just password, as the admin password also works.

## [1.3.2] - 2026-08-19

### Added

- Added Spanish & French localization thanks to [GospelBG](https://crowdin.com/profile/gospelbg) & [t0mab](https://crowdin.com/profile/t0mab).

## [1.3.1] - 2026-07-11

### Changed

- Updated translations.

## [1.3.0] - 2026-07-11

### Added

- Added a request timeout option for Pi-hole connections.

### Changed

- Made the settings mobile friendly by adding a proper sidebar.
- Migrated the api client for better stability.

### Fixed

- Fixed a typo in the connection timeout description.

## [1.2.10] - 2026-06-12

### Fixed

- Fixed localized descriptions.

## [1.2.9] - 2026-06-12

### Fixed

- Fixed extension icon not showing as the tab favicon in the options.
- Fixed dropdown label sizing.

## [1.2.8] - 2026-06-12

### Added

- Added a donate prompt which only shows once after using the extension for a while.

### Changed

- The extension description is now localized.

## [1.2.7] - 2026-06-06

### Fixed

- Fixed Firefox version not being available on Desktop.

## [1.2.6] - 2026-06-01

### Fixed

- Fixed Firefox version not being available on Android.

## [1.2.5] - 2026-05-26

### Changed

- The browser title now shows the active settings tab

## [1.2.4] - 2026-05-22

### Added

- Added a new data tab. It is now possible to export, import and reset the extension settings.

## [1.2.3] - 2026-05-18

### Fixed

- Fixed API session usage accumulating over time. https://github.com/creeperkatze/pihole-in-one/issues/2 (thanks @norbsmaq)

## [1.2.2] - 2026-05-03

### Fixed

- Fixed Pi-hole dashboard not opening from the popup.

## [1.2.1] - 2026-04-27

### Fixed

- Fixed badge not updating after connection is lost.

## [1.2.0] - 2026-04-21

### Added

- Groups & lists toggles are now available.
- Status cards for quickly viewing CPU usage, memory usage, temperature and uptime.
- Donut charts for viewing request status and type.

### Changed

- Moved popup related option to a separate tab.
- Improved fetching & error handling.
- Improved localization coverage.

### Fixed

- Fixed Pi-holes without a password set requiring a password.
- Fixed badge refresh interval not being respected.

Thanks for all the support <3

## [1.1.6] - 2026-04-18

### Fixes

- Remove outdated permission on Firefox

## [1.1.5] - 2026-04-18

### Fixes

- Fix host permission request for adding Pi-holes on Firefox

## [1.1.4] - 2026-04-18

### Improvements

- Removed telemetry: While it was only there to see things like version adaption, I see how it goes against the spirit of Pi-hole.

## [1.1.3] - 2026-04-16

### Fixes

- Update extension description

## [1.1.2] - 2026-04-16

### Improvements

- Improve Pi-hole selector save logic & design
- Use granular host permissions

## [1.1.1] - 2026-04-16

### Improvements

- Reworked & added more popup stats

## [1.0.14] - 2026-04-15

### Fixes

- Fix option searching

## [1.0.13] - 2026-04-14

### Improvements

- Update icon & logo

## [1.0.12] - 2026-04-13

### Fixes

- Fix domain blocking not working because of a cors policy

## [1.0.11] - 2026-04-13

### Fixes

- Fix font
- Improve popup footer styling

[Unreleased]: https://github.com/creeperkatze/pihole-in-one/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/creeperkatze/pihole-in-one/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/creeperkatze/pihole-in-one/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/creeperkatze/pihole-in-one/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/creeperkatze/pihole-in-one/compare/v1.3.4...v1.4.0
[1.3.4]: https://github.com/creeperkatze/pihole-in-one/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/creeperkatze/pihole-in-one/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/creeperkatze/pihole-in-one/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/creeperkatze/pihole-in-one/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.10...v1.3.0
[1.2.10]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.9...v1.2.10
[1.2.9]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.8...v1.2.9
[1.2.8]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/creeperkatze/pihole-in-one/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.6...v1.2.0
[1.1.6]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.5...v1.1.6
[1.1.5]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/creeperkatze/pihole-in-one/compare/v1.1.0...v1.1.1
[1.0.14]: https://github.com/creeperkatze/pihole-in-one/compare/v1.0.13...v1.0.14
[1.0.13]: https://github.com/creeperkatze/pihole-in-one/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/creeperkatze/pihole-in-one/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/creeperkatze/pihole-in-one/compare/v1.0.10...v1.0.11
