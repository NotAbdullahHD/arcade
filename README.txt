GhostMath - static game site (no build step)

Deploy
1) Cloudflare Pages: Workers & Pages > Create > Pages > Upload assets > drop this folder or zip. Leave build command empty.
2) Workers via GitHub: put all files at the root of a repo and connect it (wrangler.jsonc included in the workers zip).

Edit games: games.js. Hide a broken game: add its id to window.HIDDEN in games.js.
Covers: img/covers/<id>.webp. Games load from cdn.jsdelivr.net/gh/gn-math/html@main/
Replace hello@example.com in contact.html with a real email.
