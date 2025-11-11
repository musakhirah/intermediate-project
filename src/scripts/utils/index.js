import "../../styles/styles.css";
import App from "../pages/app";
import { setupInstallPrompt } from "./install.js";
import {
  subscribe,
  unsubscribe,
  getPushSubscription,
  requestPermission,
} from "./push-helper.js";
import PushNotificationHelper from "./push.js";

const app = new App({ content: document.querySelector("#main-content") });

// ----------------------------------------------------
// 🔧 HELPER LOGGING
// ----------------------------------------------------
function log(...args) {
  console.log("%c[SW]", "color:#00aaff;font-weight:bold;", ...args);
}
function warn(...args) {
  console.warn("%c[SW]", "color:#ffaa00;font-weight:bold;", ...args);
}
function err(...args) {
  console.error("%c[SW]", "color:#ff4444;font-weight:bold;", ...args);
}

// ----------------------------------------------------
// 🔹 REGISTER SERVICE WORKER (PERBAIKAN)
// ----------------------------------------------------
async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    err("Browser tidak mendukung Service Worker.");
    return null;
  }

  try {
    // Path SW harus dari root karena file hasil build ada di dist root
    const swUrl = "/sw.bundle.js";
    log("📦 Mendaftarkan Service Worker dari:", swUrl);

    const registration = await navigator.serviceWorker.register(swUrl);

    // Tunggu sampai SW aktif
    await navigator.serviceWorker.ready;
    log("✅ Service Worker siap dan aktif:", registration);

    // Pastikan SW mulai mengontrol halaman
    if (!navigator.serviceWorker.controller) {
      log("⏳ Menunggu service worker mulai mengontrol halaman...");
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        });
      });
    }

    return registration;
  } catch (error) {
    err("❌ Gagal mendaftarkan Service Worker:", error);
    return null;
  }
}

// ----------------------------------------------------
// 🔹 HANDLER TOMBOL PUSH (SUBSCRIBE / UNSUBSCRIBE)
// ----------------------------------------------------
async function setupTogglePushBtn() {
  const btn = document.getElementById("toggle-push");
  if (!btn) {
    warn("Tombol #toggle-push tidak ditemukan di DOM.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Loading...";
  log("🔘 Menyiapkan tombol push...");

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) {
    warn("❌ Service worker belum siap, tidak bisa inisialisasi push.");
    btn.textContent = "Unavailable";
    return;
  }

  // ✅ Buat instance helper
  const pushHelper = new PushNotificationHelper(
    (await import("./config.js")).default.VAPID_PUBLIC_KEY
  );

  // ✅ Ambil izin & subscription awal
  let permission = Notification.permission;
  let isSubscribed = !!(await pushHelper.getSubscription());

  // Jika izin sudah granted tapi belum ada subscription → auto subscribe
  if (permission === "granted" && !isSubscribed) {
    log("🔔 Izin granted tapi belum subscribe, auto subscribe...");
    const ok = await pushHelper.subscribe();
    isSubscribed = ok;
  }

  // ✅ Render tampilan tombol sesuai status awal
  updateButton();

  // ✅ Event klik
  btn.addEventListener("click", async () => {
    btn.disabled = true;

    try {
      permission = Notification.permission;

      // Jika belum granted → tampilkan alert + minta izin
      if (permission === "default") {
        log("🟢 Meminta izin notifikasi...");
        const granted = await pushHelper.requestPermission();
        if (!granted) {
          alert("❌ Izin notifikasi ditolak.");
          btn.disabled = false;
          return;
        }
        permission = "granted";
      }

      if (permission === "denied") {
        alert(
          "🚫 Notifikasi diblokir oleh browser. Aktifkan kembali di pengaturan situs."
        );
        btn.disabled = true;
        return;
      }

      if (isSubscribed) {
        log("🔴 Melakukan unsubscribe...");
        const ok = await pushHelper.unsubscribe();
        if (ok) {
          isSubscribed = false;
          alert("🔕 Kamu berhenti berlangganan notifikasi.");
        }
      } else {
        log("🟢 Melakukan subscribe...");
        const ok = await pushHelper.subscribe();
        if (ok) {
          isSubscribed = true;
          alert("🔔 Notifikasi diaktifkan!");
        }
      }

      updateButton();
    } catch (e) {
      err("❌ Gagal toggle push:", e);
      alert("Terjadi kesalahan saat mengubah status push.");
    } finally {
      btn.disabled = false;
    }
  });

  function updateButton() {
    permission = Notification.permission;

    if (permission === "denied") {
      btn.textContent = "Notifikasi Diblokir";
      btn.disabled = true;
      warn("🚫 Notifikasi diblokir oleh pengguna.");
      return;
    }

    if (permission === "default") {
      btn.textContent = "Izinkan Notifikasi";
    } else {
      btn.textContent = isSubscribed ? "Unsubscribe" : "Subscribe";
    }

    btn.setAttribute("aria-pressed", isSubscribed ? "true" : "false");
    log(
      `🔔 Status push: ${isSubscribed ? "✅ Subscribed" : "❌ Belum subscribe"}`
    );
  }

  // 🔹 Fungsi helper update tampilan tombol
  function updateButton() {
    const permission = Notification.permission;

    if (permission === "denied") {
      btn.textContent = "Notifikasi Diblokir";
      btn.disabled = true;
      warn("🚫 Notifikasi diblokir oleh pengguna/browser.");
      return;
    }

    if (permission === "default") {
      btn.textContent = "Izinkan Notifikasi";
    } else {
      btn.textContent = isSubscribed ? "Unsubscribe" : "Subscribe";
    }

    btn.setAttribute("aria-pressed", isSubscribed ? "true" : "false");
    btn.disabled = false;
    log(
      `🔔 Status push: ${isSubscribed ? "✅ Subscribed" : "❌ Belum subscribe"}`
    );
  }
}

(async () => {
  // Pastikan SW terdaftar lebih dulu
  await ensureServiceWorker();

  // Inisialisasi tombol push
  await setupTogglePushBtn();

  // Inisialisasi instalasi PWA
  setupInstallPrompt();

  // Jalankan aplikasi utama
  app.renderPage();
})();
