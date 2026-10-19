// Service worker: keeps a full copy of the app on the device so it runs offline.
// The cache name changes automatically whenever any app file changes.
const CACHE = "card-clerk-adab7f2d8971";
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon.png'];

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys()
			.then((keys) => Promise.all(keys.filter((k) => k.startsWith("card-clerk-") && k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", (event) => {
	const req = event.request;
	if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
	// App shell: any page navigation inside the app gets the cached index.html.
	if (req.mode === "navigate") {
		event.respondWith(caches.match("index.html", { ignoreSearch: true }).then((hit) => hit || fetch(req)));
		return;
	}
	event.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
