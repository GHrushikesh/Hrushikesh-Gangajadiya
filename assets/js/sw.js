const CACHE_VERSION = "1.0.0.6",
    CURRENT_CACHES = {
        assets: "assets-cache-v1.0.0.6",
        static: "static-cache-v1.0.0.6"
    };
self.addEventListener("install", (e => {
    e.waitUntil(caches.open(CURRENT_CACHES.static).then((function(e) {
        return e.addAll(["../../vendor.bundle.js", "../../app.bundle.js", "../../app.css", "../glb/spider.glb", "../glb/web.glb", "../glb/storm_breaker.glb"])
    })))
})), self.addEventListener("activate", (e => {
    const t = new Set(Object.values(CURRENT_CACHES));
    e.waitUntil(caches.keys().then((e => Promise.all(e.map((e => {
        if (!t.has(e)) return caches.delete(e)
    }))))))
})), self.addEventListener("fetch", (e => {
    e.respondWith(caches.open(CURRENT_CACHES.assets).then((t => t.match(e.request).then((s => s || fetch(e.request.clone()).then((s => {
        if (s.status < 400 && (e.request.url.match(/\.(glb|gltf|woff2|woff|mp3|png|jpg|gif|svg)$/i) || (s.headers.has("content-type") && (s.headers.get("content-type").match(/^(font|image|model)\//i))))) {
            t.put(e.request, s.clone());
        }
        return s;
    }))))).catch((e => {
        throw e
    })))))
});