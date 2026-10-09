import DEDUPE from "./dedupe.js";

const SHELVES = ["seraph", "truffled", "ckv", "ugs", "bundled"];

function shelfFromReferer(referer) {
  if (!referer) return null;
  try {
    const first = new URL(referer).pathname.split("/")[1];
    return SHELVES.includes(first) ? first : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      /* leave it encoded; the asset lookup will simply miss */
    }

    // Byte-identical files are stored once. The other paths for them land
    // here, and are answered from the copy that was kept.
    const canonical = DEDUPE[path];
    if (canonical) {
      const res = await env.ASSETS.fetch(new Request(new URL(canonical, url.origin).href, request));
      if (res.status === 200) return res;
    }

    // A game asking for "/storage/x.js" wants the storage of the shelf it was
    // opened from. The Referer says which shelf that is — the same repair
    // GhostLite's asset proxy applies to the HTML itself.
    const head = path.split("/")[1];
    const shelf = shelfFromReferer(request.headers.get("referer"));
    if (shelf && path.length > 1 && head && !SHELVES.includes(head)) {
      const res = await env.ASSETS.fetch(new Request(new URL("/" + shelf + path, url.origin).href, request));
      if (res.status === 200) return res;
    }

    return env.ASSETS.fetch(request);
  },
};
