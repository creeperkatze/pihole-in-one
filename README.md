# <img src=".github/assets/logo.png" alt="Pi-hole In One" height="100">

A browser extension to control your Pi-hole conveniently from within the browser.

![GitHub Branch Check Runs](https://img.shields.io/github/check-runs/creeperkatze/pihole-in-one/main?labelColor=0d143c)
![GitHub Issues](https://img.shields.io/github/issues/creeperkatze/pihole-in-one?labelColor=0d143c)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/creeperkatze/pihole-in-one?labelColor=0d143c)
![GitHub Repo stars](https://img.shields.io/github/stars/creeperkatze/pihole-in-one?style=flat&labelColor=0d143c)

## 🚀 Installation

> [!NOTE]
> Pi-hole In One requires **Pi-hole v6** or later. The v6 REST API is not available on earlier versions.

Install from your browser's extension store:

- **Chrome Web Store** (coming soon)
- **Firefox Add-Ons**: (coming soon)

Prefer to build from source? See [Building from source](#-building-from-source) below.

## ✨ Features

### Blocking control

Enable or disable Pi-hole blocking with a single click. Use the **Disable for** presets to pause blocking for a set duration. The popup shows a live countdown and automatically re-enables when the timer expires.

### Domain management

View whether the current tab's domain is on your block or allow list. Block or unblock it directly from the popup without opening the Pi-hole admin interface.

### Stats at a glance

See today's query count, blocked count, block percentage, and unique domain count right in the popup.

### Extension badge

The toolbar icon shows **ON** or **OFF** reflecting the current blocking state, updated every minute and immediately after any change.

## ⚙️ Setup

1. Open **Settings** from the extension popup (gear icon).
2. Enter your Pi-hole URL (e.g. `http://pi.hole` or `http://192.168.1.1`).
3. Enter your Pi-hole **application password** (found in Pi-hole > Settings > API).
4. Leave the password blank if your Pi-hole has no password set.

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

pnpm dev
```

## 🤝 Contributing

Contributions are always welcome!

Please ensure you run `pnpm lint` before opening a pull request.

## 📜 License

AGPL-3.0
