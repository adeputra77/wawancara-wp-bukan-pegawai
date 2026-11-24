/* Lets the interview page open without a signal after the first visit.
   Network first, so updates published to GitHub show up whenever there is a
   connection; the cached copy is used only when the network fails.
   Requests to Google (the Apps Script web app) are never touched. */
const CACHE = "ne-wawancara-v1";
const CORE = ["./", "./index.html", "./img/INF.jpg", "./img/DET.jpg", "./img/OUT.jpg", "./img/PUB.jpg"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== "GET" || url.origin !== location.origin) return;
  url.search = "";                       // never store the ?e=…&k=… link
  e.respondWith(
    fetch(r)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(url.href, copy)); }
        return res;
      })
      .catch(() => caches.match(url.href).then((m) => m || caches.match("./index.html")))
  );
});
