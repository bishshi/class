const CACHE_PREFIX = "class-612-pwa";
const CACHE_VERSION = "dev"; // __CACHE_VERSION__
const PRECACHE_CACHE = `${CACHE_PREFIX}-precache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  /* __PRECACHE_URLS_START__ */
  "/",
  "/offline/",
  "/manifest.webmanifest",
  "/icons/pwa-192.png",
  "/icons/pwa-512.png",
  "/icons/apple-touch-icon.png"
  /* __PRECACHE_URLS_END__ */
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(`${CACHE_PREFIX}-`) &&
                cacheName !== PRECACHE_CACHE &&
                cacheName !== RUNTIME_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

const cacheSuccessfulResponse = async (cacheName, request, response) => {
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }

  return response;
};

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    return cacheSuccessfulResponse(RUNTIME_CACHE, request, response);
  } catch {
    return (
      (await caches.match(request, { ignoreSearch: true })) ??
      (await caches.match("/offline/")) ??
      (await caches.match("/"))
    );
  }
};

const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request, { ignoreSearch: true });

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  return cacheSuccessfulResponse(RUNTIME_CACHE, request, response);
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || request.headers.has("range")) {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    ["style", "script", "font", "image"].includes(request.destination) ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(request));
  }
});
