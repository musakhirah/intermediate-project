// ✅ Import modul Workbox dari bundle (tidak perlu CDN)
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// ====== Konstanta dasar ======
const VERSION = "v9";
const RUNTIME_CACHE = `runtime-${VERSION}`;

// ====== Precache hasil build Webpack ======
precacheAndRoute(self.__WB_MANIFEST);

// ====== Routing & strategi caching ======

// 1️⃣ NetworkFirst → untuk navigasi halaman SPA (index.html, routes)
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
      }),
    ],
  })
);

// 2️⃣ CacheFirst → untuk file CSS & JS
registerRoute(
  ({ request }) => ["style", "script"].includes(request.destination),
  new CacheFirst({
    cacheName: "assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// 3️⃣ CacheFirst → untuk gambar
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// 4️⃣ CacheFirst → untuk CDN eksternal (Leaflet, FontAwesome, dll.)
registerRoute(
  ({ url }) =>
    ["unpkg.com", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"].includes(
      url.hostname
    ),
  new CacheFirst({
    cacheName: "cdn-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// ====== Push Notification Handler ======
self.addEventListener("push", async (event) => {
  console.log("[SW] Push event diterima");

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // fallback jika bukan JSON, gunakan sebagai pesan teks langsung
    data = {
      title: "StoryApp",
      message: event.data?.text() || "Kamu punya cerita baru!",
    };
  }

  const options = {
    body: data.message || "Kamu punya cerita baru!",
    icon: "icons/icon-192x192.png",
    badge: "icons/icon-72x72.png",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "StoryApp", options)
  );
});

// ====== Klik Notifikasi ======
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/#/home";
  event.waitUntil(clients.openWindow(targetUrl));
});

// ====== Pesan dari Client (Simulasi Push) ======
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "simulate-push") {
    const { title, message } = event.data.payload || {};
    const options = {
      body: message || "Simulasi notifikasi",
      icon: "icons/icon-192x192.png",
      badge: "icons/icon-72x72.png",
    };
    event.waitUntil(
      self.registration.showNotification(title || "Simulasi StoryApp", options)
    );
  }
});
