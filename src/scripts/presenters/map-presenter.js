import L from "leaflet";
import Storage from "../utils/storage.js";
import { API as StoryAPI } from "../data/api.js";
import Swal from "sweetalert2";

class MapPresenter {
  static _map = null;
  static _myLocationMarker = null;

  static async locateNow(showPopup = true) {
    if (!this._map) throw new Error("Map belum diinisialisasi");

    if (!navigator.geolocation) {
      Swal.fire({
        title: "Tidak Didukung",
        text: "Geolocation tidak didukung oleh browser ini.",
        icon: "error",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this._map.setView([latitude, longitude], 14);

        if (this._myLocationMarker) this._map.removeLayer(this._myLocationMarker);

        this._myLocationMarker = L.marker([latitude, longitude], {
          title: "Lokasi Saya Sekarang",
          icon: L.icon({
            iconUrl:
              "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          }),
        }).addTo(this._map);

        if (showPopup) {
          this._myLocationMarker.bindPopup("Lokasi Anda Sekarang").openPopup();
        }
      },
      (err) => {
        Swal.fire({
          title: "Lokasi Error",
          text: "Gagal mendapatkan lokasi: " + err.message,
          icon: "error",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  static async initMap(containerId = "map", withMarkers = true) {
    // hapus map lama jika ada
    if (this._map) {
      try {
        this._map.remove();
      } catch (e) {
        console.warn("Gagal menghapus map lama:", e);
      }
      this._map = null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Elemen dengan id '${containerId}' tidak ditemukan`);
    }

    // buat map baru
    this._map = L.map(containerId).setView([-1.6, 103.6], 6);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    });

    const carto = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: "© CartoDB" }
    );

    const esriSatelit = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    );

    const dark = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "© CartoDB" }
    );

    osm.addTo(this._map);

    L.control
      .layers({
        "OpenStreetMap": osm,
        "CartoDB Voyager": carto,
        "Satelit (Esri)": esriSatelit,
        "Dark Mode": dark,
      })
      .addTo(this._map);

    // pastikan peta siap sebelum load marker
    this._map.whenReady(() => {
      console.log("🗺️ Map siap dimuat!");
      if (withMarkers) {
        setTimeout(() => this.loadMarkers(this._map), 500);
      }
    });

    container._leaflet_map = this._map;
    return this._map;
  }

// map-presenter.js (hanya fungsi ini yang diubah)
static async loadMarkers(map) {
  try {
    if (!map || !map._container || !map._container.appendChild) {
      console.warn("⏳ Map belum siap (container hilang), coba lagi...");
      setTimeout(() => this.loadMarkers(this._map), 500);
      return;
    }

    const token = Storage.getToken();
    if (!token) {
      console.warn("Token tidak ditemukan, tidak dapat memuat marker.");
      return;
    }

    // minta hanya story yg ada koordinat
    const data = await StoryAPI.getStories(token, { location: 1, size: 50 });

    if (Array.isArray(data?.listStory) && data.listStory.length) {
      let count = 0;
      for (const s of data.listStory) {
        const lat = parseFloat(s.lat);
        const lon = parseFloat(s.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          try {
            L.marker([lat, lon])
              .addTo(map)
              .bindPopup(`<b>${s.name ?? 'Tanpa nama'}</b><br>${s.description ?? ''}`);
            count++;
          } catch (err) {
            console.warn("❌ Gagal menambahkan marker:", err);
          }
        }
      }
      console.log(`✅ ${count} marker berhasil dimuat.`);
      if (!count) console.warn("Tidak ada story dengan koordinat valid.");
    } else {
      console.warn("Respons tidak berisi listStory atau kosong:", data);
    }
  } catch (error) {
    console.error("Gagal menampilkan marker:", error);
    Swal.fire({
      title: "Gagal Memuat Marker",
      text: (error?.message || String(error)).slice(0, 250),
      icon: "error",
    });
  }
}

  static getMapInstance() {
    return this._map;
  }
}

export default MapPresenter;
