# Arcade — a Cloudflare-deployable game site

Everything needed to deploy: this folder, `worker.js`, `dedupe.js`,
`wrangler.jsonc` and the `assets/` directory. No build step.

## Deploy

    npx wrangler deploy

That uploads the Worker and all static assets in one command. Wrangler will ask
for Cloudflare sign-in the first time. The site is then live on
`ghostlite-arcade.<account>.workers.dev`, and you can attach your own domain in
the Cloudflare dashboard.

To use a different name, change `"name"` in `wrangler.jsonc` — it decides the
`*.workers.dev` address.

## What is in here

    assets/index.html   the launcher: search, shelf filter, in-page player
    assets/games.json   every game, as {id, title, shelf, path}
    assets/<shelf>/     the games, laid out exactly as their repositories are

This build ships 700 games in 4568 files (Cloudflare's ceilings are
20,000 files and 25 MiB per file). Every game was checked before it was
included: its entry page exists, is a real page, and every script, embed and
stylesheet it needs resolves on disk. Well-known titles are picked first, and
the rest of the slots go to the lightest games so the deployment stays small;
games that failed the check, and games carrying a file too big for Cloudflare
(certain ROM and Unity payloads), are the only titles missing.

## Why the layout is preserved

A game's own links are the reason. `../shared/x.js` resolves because the folder
mirrors the repository, and `../../storage/cloak.js` resolves because the shared
`storage/` tree sits where the repository puts it. Root-absolute links
(`src="/storage/x.js") are rewritten to carry their shelf in the HTML at build
time, and the Worker repairs any that JavaScript requests at runtime by reading
the shelf out of the Referer header.

Byte-identical files are stored once — `dedupe.js` maps each duplicate path to
the copy that was kept, and the Worker serves it from there.

## Rebuilding from the source tree

The site is generated (this folder is the artifact, not the source). The
generator lives with the game tree and runs as `python works.py` (decides which
games work) then `python build_site.py` (assembles this folder).
