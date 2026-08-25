---
title: FAQ
---

# Frequently Asked Questions

Answers to questions you might run into before or after you've hit them.

## Connecting

### Which Pi-hole versions are supported?

Pi-hole v6 only. The extension talks to Pi-hole's v6 API using an app password, not the legacy API token from v5. If you're still on v5, upgrade Pi-hole first.

### What do I enter as the password?

Your Pi-hole's regular admin password, the one you use to log into the web interface, works fine and is what most people enter. If you'd rather not use that, you can instead generate a separate **app password** under **Settings > API** and use that. Either one works. This is different from the API token used in Pi-hole v5. If your Pi-hole has no password set, leave the field blank.

### I entered the right password but it still says incorrect

Double-check you're using the current admin password, or app password if you set one up separately under **Settings > API**. If you recently changed either one, update it in the extension's Connection settings too. A stale password saved in the extension will keep failing even after you fix it on the Pi-hole side.

### The extension can't reach my Pi-hole at all

Common causes:

- **Wrong URL format:** Use just the host, e.g. `http://pi.hole` or `http://192.168.1.1`, with no trailing slash and no `/api` suffix.
- **Not on the same network / VPN:** If your Pi-hole is only reachable on your LAN, you'll need to be connected to that network for the extension to reach it.
- **Wrong protocol:** If your Pi-hole's admin UI is only served over `http://`, using `https://` (or vice versa) will fail to connect.

### Why did the browser ask for permission when I added a Pi-hole?

Browser extensions can't silently make requests to arbitrary hosts. When you add a Pi-hole, the extension requests permission for that specific host so it can talk to it.

### My Pi-hole uses a self-signed HTTPS certificate

Your browser will block the connection until it trusts that certificate, the same way it would block visiting the site directly in a tab. You have to manually add the local certificate as a trusted root certificate on your device.

### Can I connect to a Pi-hole running behind a reverse proxy or on a non-standard port?

Yes, include the port in the URL (e.g. `http://pi.hole:8080`). A reverse-proxied subpath works too, just make sure the URL you enter is the one that resolves to the Pi-hole admin interface.

## Multiple Pi-holes

### Can I manage more than one Pi-hole?

Yes, add as many as you like in the extension's Connection settings. The popup shows a tab for each one so you can switch between them.

### Do multiple Pi-holes get synced?

No, each connection is independent. Toggling blocking or managing lists on one Pi-hole has no effect on the others.

## Privacy & data

### Does my password and Pi-hole data stay local?

Yes. The extension talks directly from your browser to your Pi-hole's address. Nothing is proxied through a server.

### Where are my settings and passwords stored?

Locally, in your browser's extension storage. They stay on your device and are not synced across browsers or devices.

### Is the extension affiliated with the official Pi-hole project?

No, it's an independent project and isn't associated with or endorsed by Pi-hole.

## Behavior

### I whitelisted/blocked a domain, but a device still resolves it the old way

Your device may have the result cached, either in its own DNS resolver cache or in the browser. Give it a moment, or restart the browser.

### The toolbar badge doesn't seem to update immediately

The badge refreshes on an interval rather than instantly on every query, and browsers can throttle background extension activity to save resources when idle. A short delay after a change on the Pi-hole side is expected.
