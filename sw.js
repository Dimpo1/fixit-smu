// Fixit SMU service worker
// Deliberately simple: network-first, falling back to cache only when
// offline. During active pilot testing you'll be shipping fixes often —
// an aggressive cache-first strategy here would mean testers get stuck on
// an old broken version after you've already fixed it. This trades a
// little offline capability for always serving your latest code when
// there's any connection at all.

const CACHE_NAME = "fixit-smu-v1"; // bump this string if you ever need to force-clear old caches

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
