import CONFIG from "./config.js";
import { showToast } from "../utils/ui-helper.js";

const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;

// ========== Request Izin Notifikasi ==========
export async function requestPermission() {
  if (!("Notification" in window)) {
    showToast("Browser tidak mendukung Notification API.", "error");
    return false;
  }

  const permission = await Notification.requestPermission();

  switch (permission) {
    case "granted":
      console.log("[Push] Izin notifikasi diberikan ✅");
      showToast("Izin notifikasi diberikan.", "success");
      return true;
    case "denied":
      console.warn("[Push] Izin notifikasi ditolak ❌");
      showToast(
        "Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.",
        "error"
      );
      return false;
    default:
      console.warn("[Push] Izin notifikasi tidak dipilih ⚠️");
      showToast("Izin notifikasi belum diberikan.", "warning");
      return false;
  }
}

// ========== Helper Konversi VAPID ==========
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ========== Ambil Subscription Aktif ==========
export async function getPushSubscription() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[Push] Service Worker belum tersedia.");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

// ========== Subscribe ke Push Notification ==========
export async function subscribe() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    showToast("Push Notification tidak didukung di browser ini.", "error");
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error("[Push] VAPID_PUBLIC_KEY tidak tersedia di CONFIG.");
    showToast("Konfigurasi server key tidak ditemukan.", "error");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription =
      await registration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log("[Push] Sudah memiliki subscription aktif.");
      showToast("Sudah berlangganan notifikasi.", "info");
      return true;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Simpan ke server bila fungsi tersedia di window global
    if (typeof window.subscribePushNotification === "function") {
      const { endpoint, keys } = subscription.toJSON();
      await window.subscribePushNotification({ endpoint, keys });
    }

    console.log("[Push] Berhasil subscribe:", subscription.endpoint);
    showToast("Berhasil berlangganan notifikasi.", "success");
    return true;
  } catch (error) {
    console.error("[Push] Gagal melakukan subscribe:", error);
    showToast("Gagal berlangganan notifikasi.", "error");
    return false;
  }
}

// ========== Unsubscribe dari Push Notification ==========
export async function unsubscribe() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    showToast("Push Notification tidak didukung di browser ini.", "error");
    return false;
  }

  const subscription = await getPushSubscription();
  if (!subscription) {
    showToast("Belum ada langganan aktif.", "info");
    return false;
  }

  try {
    const { endpoint } = subscription.toJSON();

    if (typeof window.unsubscribePushNotification === "function") {
      try {
        await window.unsubscribePushNotification({ endpoint });
      } catch (serverError) {
        console.warn("[Push] Gagal hapus subscription di server:", serverError);
      }
    }

    await subscription.unsubscribe();
    console.log("[Push] Unsubscribe berhasil.");
    showToast("Langganan notifikasi berhasil dihentikan.", "success");
    return true;
  } catch (error) {
    console.error("[Push] Gagal unsubscribe:", error);
    showToast("Gagal menghentikan langganan notifikasi.", "error");
    return false;
  }
}
