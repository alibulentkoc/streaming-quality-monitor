// Service worker for Streaming Quality Monitor.
// Strategy: network first, cache as fallback. Online, you always get the latest
// version. Offline, the last cached version of the app opens.
//
// Requests that must always reach the network are left alone:
// - the ping test (HEAD request, and any URL with a "ping" query parameter),
// - incidents.json (auto-loaded data file),
// - anything on another origin.

const CACHE = "sqm-v1";
const PRECACHE = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("sqm-") && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.searchParams.has("ping")) return;
  if (url.pathname.endsWith("/incidents.json")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((cached) => {
          if (cached) return cached;
          if (req.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        })
      )
  );
});
