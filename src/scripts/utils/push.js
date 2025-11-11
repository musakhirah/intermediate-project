// src/utils/push.js
import CONFIG from "./config.js";

class PushNotificationHelper {
  constructor(vapidPublicKey) {
    this.VAPID_PUBLIC_KEY = vapidPublicKey;
  }

  // 🔹 Konversi Base64 ke Uint8Array
  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  // 🔹 Meminta izin notifikasi
  async requestPermission() {
    if (!("Notification" in window)) {
      console.error("❌ Browser tidak mendukung Notification API!");
      return false;
    }

    if (Notification.permission === "granted") return true;

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("✅ Izin notifikasi diberikan oleh pengguna.");
      return true;
    } else {
      console.warn("⚠️ Izin notifikasi ditolak.");
      return false;
    }
  }

  // 🔹 Mendapatkan service worker aktif
  async _getServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.error("❌ Service Worker tidak didukung di browser ini!");
      return null;
    }
    return await navigator.serviceWorker.ready;
  }

  // 🔹 Ambil subscription aktif
  async getSubscription() {
    const sw = await this._getServiceWorker();
    if (!sw) return null;
    return await sw.pushManager.getSubscription();
  }

  // 🔹 Subscribe ke Push Notification
  async subscribe() {
    if (!("PushManager" in window)) {
      console.error("❌ Browser tidak mendukung Push API!");
      return false;
    }

    const granted = await this.requestPermission();
    if (!granted) return false;

    try {
      const sw = await this._getServiceWorker();
      if (!sw) throw new Error("Service Worker belum siap.");

      const existing = await sw.pushManager.getSubscription();
      if (existing) {
        console.log("ℹ️ Sudah ada subscription lama:", existing);
        return true;
      }

      const convertedKey = this._urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY);

      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("✅ Subscription berhasil:", JSON.stringify(subscription));
      return true;
    } catch (error) {
      console.error("❌ Gagal subscribe:", error);
      return false;
    }
  }

  // 🔹 Unsubscribe dari push notification
  async unsubscribe() {
    try {
      const subscription = await this.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log("✅ Berhasil unsubscribe dari push notification.");
        return true;
      } else {
        console.warn("⚠️ Tidak ada subscription aktif.");
        return false;
      }
    } catch (error) {
      console.error("❌ Gagal unsubscribe:", error);
      return false;
    }
  }

  // ----------------------------------------------------------
  // 🔹 STATIC METHODS untuk notifikasi langsung
  // ----------------------------------------------------------

  // 🔹 Menampilkan notifikasi lokal manual
  static async showLocalNotification(title, body) {
    if (Notification.permission !== "granted") {
      console.warn("⚠️ Notifikasi belum diizinkan oleh pengguna.");
      return;
    }

    const sw = await navigator.serviceWorker.ready;
    if (!sw) {
      console.error("❌ Service Worker belum siap untuk notifikasi.");
      return;
    }

    const options = {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
    };

    sw.showNotification(title, options);
  }

  // 🔹 Notifikasi otomatis saat story baru ditambahkan
  static async notifyStoryAdded(
    title = "StoryApp",
    message = "Cerita baru telah ditambahkan!"
  ) {
    if (Notification.permission !== "granted") {
      console.warn(
        "⚠️ Izin notifikasi belum diberikan, tidak menampilkan notifikasi."
      );
      return;
    }

    const sw = await navigator.serviceWorker.ready;
    if (!sw) {
      console.error("❌ Service Worker belum siap untuk notifikasi.");
      return;
    }

    sw.showNotification(title, {
      body: message,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [200, 100, 200],
    });
  }

  // 🔹 Inisialisasi otomatis
  static async init() {
    const helper = new PushNotificationHelper(CONFIG.VAPID_PUBLIC_KEY);
    const granted = await helper.requestPermission();
    if (!granted) return;

    await helper.subscribe();
    console.log("[PushNotificationHelper] ✅ Inisialisasi selesai");
  }
}

export default PushNotificationHelper;
