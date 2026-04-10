# <img src=".github/assets/logo.png" alt="Pi-hole In One" height="100">

A browser extension to control your Pi-hole conveniently from within the browser.

![GitHub Branch Check Runs](https://img.shields.io/github/check-runs/creeperkatze/pihole-in-one/main?labelColor=0d143c)
![GitHub Issues](https://img.shields.io/github/issues/creeperkatze/pihole-in-one?labelColor=0d143c)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/creeperkatze/pihole-in-one?labelColor=0d143c)
![GitHub Repo stars](https://img.shields.io/github/stars/creeperkatze/pihole-in-one?style=flat&labelColor=0d143c)
[![Crowdin](https://badges.crowdin.net/pihole-in-one/localized.svg)](https://crowdin.com/project/pihole-in-one)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F11WYJU3)

## 🚀 Installation

Install from your browser's extension store:

- **Chrome Web Store** (coming soon)
- **Firefox Add-Ons** (coming soon)
- **Edge Add-Ons** (coming soon)

Prefer to build from source? See [Building from source](#-building-from-source) below.

## ✨ Features

### Blocking control

Enable or disable Pi-hole blocking with a single click directly from the popup.

### Domain management

View whether the current tab's domain is blocked by a gravity list, blocked by a user rule, or allow-listed. Block or whitelist it instantly from the popup, no need to open the Pi-hole admin interface.

### Stats at a glance

See today's query count, blocked count, block percentage, and unique domain count right in the popup.

### Multiple Pi-hole instances

Connect to more than one Pi-hole and control all of them from a single extension. Toggle blocking across all instances at once.

### Extension badge

The toolbar icon shows the **percentage of queries blocked today**, updated every minute and immediately after any change. Shows **OFF** when blocking is disabled.

## ⚙️ Setup

1. Open the extension options.
2. Under **Connection**, click **Add Pi-hole** in the top-right of the Pi-holes section.
3. Enter a name, your Pi-hole URL (e.g. `http://pi.hole` or `http://192.168.1.1`), and your **API password** (found in Pi-hole > Settings > API).
4. Leave the password blank if your Pi-hole has no password set.
5. The connection is tested automatically, a green checkmark confirms it's working.

## 🔒 Building from source

If you don't want to trust the store release, you can build the extension yourself directly from the source code.

**Prerequisites:** [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io)

```bash
# Clone the repository
git clone https://github.com/creeperkatze/pihole-in-one.git
cd pihole-in-one

pnpm install

# Chrome / Edge
pnpm zip

# Firefox
pnpm zip:firefox
```

The resulting zips are placed in `.output/`.

To install the extension manually:

- **Chrome / Edge:** go to `chrome://extensions/`, enable **Developer mode**, then drag and drop the zip onto the page.
- **Firefox:** go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select the zip. Note that Firefox removes the extension on browser restart since it is loaded as a temporary add-on.

## 👨‍💻 Development

### Setup

```bash
git clone https://github.com/creeperkatze/pihole-in-one.git
cd pihole-in-one

pnpm install
```

### Running

```bash
pnpm dev
```

## 🌐 Translating

Translations are managed on [Crowdin](https://crowdin.com/project/pihole-in-one). You can contribute without any technical knowledge, just pick your language and start translating.

New translations are automatically pulled every Monday.

## 🤝 Contributing

Contributions are always welcome!

Please ensure you run `pnpm lint` before opening a pull request.

## 📜 License

AGPL-3.0
