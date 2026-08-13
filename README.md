# Kuaa command website

This repo contains a simple static command directory for the Kuaa Discord bot.

## Generate data

```bash
node generate-data.js
```

This reads the public commands from the bot source and writes `commands.json` for the website.

## Publish on GitHub Pages

1. Push this repo to GitHub.
2. Open the repository Settings.
3. Go to Pages.
4. Select `Deploy from a branch`.
5. Branch: `main` and folder: `/` (root).

This will publish the site from the repository root.
