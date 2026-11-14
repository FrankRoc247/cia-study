// CIA Challenge Exam Study - offline service worker
var VERSION = "3c21c4834430";
var CACHE = "cia-study-" + VERSION;
var SHELL = ["./", "./index.html", "./manifest.webmanifest",
             "./icon-180.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  var key = req.mode === "navigate" ? "./index.html" : req;

  e.respondWith(
    caches.match(key).then(function (cached) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(key, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
