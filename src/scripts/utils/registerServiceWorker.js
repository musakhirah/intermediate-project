// src/scripts/utils/registerServiceWorker.js

export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker terdaftar dengan baik:", registration);
    } catch (error) {
      console.error("Pendaftaran Service Worker gagal:", error);
    }
  }
};
