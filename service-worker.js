const CACHE_NAME = "pwa-tareas-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon.png"
];

// Instalación — cacheando archivos
self.addEventListener("install", (event) => {
  console.log("[SW] Evento: install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Abriendo caché:", CACHE_NAME);
      console.log("[SW] Archivos a cachear:", FILES_TO_CACHE);
      return cache.addAll(FILES_TO_CACHE)
        .then(() => console.log("[SW] Archivos cacheados OK"))
        .catch((err) => console.error("[SW] Error al cachear:", err));
    })
  );
  self.skipWaiting();
});

// Activación — limpiando caché vieja
self.addEventListener("activate", (event) => {
  console.log("[SW] Evento: activate");
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log("[SW] Cachés disponibles:", keys);
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log("[SW] Borrando caché antigua:", key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch — responde desde red o caché
self.addEventListener("fetch", (event) => {
  console.log("[SW] Fetch interceptado:", event.request.url);
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        console.log("[SW] Red OK:", event.request.url);
        return response;
      })
      .catch((err) => {
        console.warn("[SW] Red FAIL, buscando caché:", event.request.url);
        return caches.match(event.request)
          .then((cached) => {
            if (cached) {
              console.log("[SW] Recurso en caché:", event.request.url);
              return cached;
            } else {
              console.error("[SW] No encontrado en caché:", event.request.url);
              return new Response("Offline y recurso no cacheado", {
                status: 404,
                statusText: "Offline & no cached"
              });
            }
          });
      })
  );
});
