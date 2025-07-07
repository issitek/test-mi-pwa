const CACHE_NAME = "pwa-tareas-v1";
const FILES_TO_CACHE = [
  "/test-mi-pwa/",
  "/test-mi-pwa/index.html",
  "/test-mi-pwa/app.js",
  "/test-mi-pwa/manifest.json",
  "/test-mi-pwa/icon.png"
];

// Instala y cachea archivos
self.addEventListener("install", (event) => {
  console.log("[SW] Evento: install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Abriendo caché:", CACHE_NAME);
      console.log("[SW] Archivos a cachear:", FILES_TO_CACHE);
      return cache.addAll(FILES_TO_CACHE)
        .then(() => console.log("[SW] Archivos cacheados correctamente"))
        .catch((err) => console.error("[SW] Error al cachear archivos:", err));
    })
  );
  self.skipWaiting();
});

// Activa y limpia caches viejos
self.addEventListener("activate", (event) => {
  console.log("[SW] Evento: activate");
  event.waitUntil(
    caches.keys().then((keyList) => {
      console.log("[SW] Caches encontrados:", keyList);
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Borrando caché antigua:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta peticiones y responde desde caché si está offline
self.addEventListener("fetch", (event) => {
  console.log("[SW] Fetch interceptado:", event.request.url);
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        console.log("[SW] Red disponible, recurso obtenido:", event.request.url);
        return response;
      })
      .catch((err) => {
        console.warn("[SW] Sin conexión. Buscando en caché:", event.request.url);
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log("[SW] Recurso encontrado en caché:", event.request.url);
              return cachedResponse;
            } else {
              console.error("[SW] Recurso no encontrado en caché:", event.request.url);
              return new Response("Recurso no disponible sin conexión", {
                status: 404,
                statusText: "Offline and resource not cached"
              });
            }
          });
      })
  );
});
