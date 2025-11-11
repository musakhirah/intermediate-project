import AddStoryPresenter from "../../presenters/add-story-presenter.js";
import MapPresenter from "../../presenters/map-presenter.js";
import { Loading } from "../../utils/loading.js";
import Swal from "sweetalert2";
import PushNotificationHelper from "../../utils/push.js";

const AddStoryPage = {
  marker: null,
  cameraStream: null,

  async render() {
    return `
      <section style="
        max-width:700px;
        background: linear-gradient(120deg, #fff8dc 40%, #ffecc1 100%);
        border-radius: 20px;
        padding: 30px 36px;
        margin: 36px auto 40px auto;
        box-shadow: 0 8px 28px rgba(255, 172, 39, 0.27);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #a96900;">
        <h1 style="color:#f7a00a; font-weight:900; font-size:2rem; margin-bottom:20px; text-align:center;">
          Tambah Cerita Baru
        </h1>
        <form id="add-story-form" enctype="multipart/form-data" style="display:flex; flex-direction: column; gap: 16px;">
          <label for="description" style="font-weight:700; font-size:1.1rem;">Deskripsi Cerita</label>
          <textarea id="description" required style="width:100%; padding: 10px 12px; font-size: 1rem; border-radius: 8px; border: 1.5px solid #d9b325; resize:vertical;"></textarea>
          
          <label for="photo" style="font-weight:700; font-size:1.1rem;">Foto Cerita</label>
          <input type="file" id="photo" accept="image/*" required style="padding: 6px; border-radius: 6px; border: 1.5px solid #d9b325;"/>
          
          <button type="button" id="toggleCamera" style="background: #ffd54f; color: #a08000; font-weight:600; border:none; border-radius:7px; padding:6px 14px; cursor:pointer; width:max-content;">
            Nyalakan Kamera
          </button>
          <div id="cameraPreview" style="display:none; margin-bottom:6px; position:relative;">
            <button type="button" id="closeCameraBtn"
              style="position:absolute; top:10px; right:10px; background:#ff7070; color:#fff; border:none; border-radius:50%; width:32px; height:32px; font-size:1.1em; cursor:pointer; z-index:3;">
              &times;
            </button>
            <video id="videoElement" autoplay playsinline width="100%" style="border-radius:8px; border:2px solid #ffecb3; max-height:200px;"></video>
            <button type="button" id="takePhoto" style="background:#ffbc32; color:#fff; font-weight:700; padding:6px 16px; border:none; border-radius:8px; margin-top:10px;">
              Ambil Foto
            </button>
            <canvas id="canvasElement" style="display:none;"></canvas>
          </div>

          <div id="photoPreview" style="display:none; margin-bottom:6px;">
            <img id="photoImg" style="max-width:100%; border-radius:8px;"/>
          </div>
          
          <div style="display: flex; gap: 24px; align-items: center;">
            <div style="flex: 1;">
              <label for="lat" style="font-weight:700; font-size:1.1rem;">Latitude</label>
              <input type="text" id="lat" required readonly placeholder="Klik di peta" style="width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #d9b325; font-size:1rem;"/>
            </div>
            <div style="flex: 1;">
              <label for="lon" style="font-weight:700; font-size:1.1rem;">Longitude</label>
              <input type="text" id="lon" required readonly placeholder="Klik di peta" style="width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #d9b325; font-size:1rem;"/>
            </div>
          </div>
          
          <div id="map" style="height:390px; border-radius:16px; margin-top:18px; box-shadow:0 6px 24px #fab7361a;"></div>
          <button type="submit" style="margin-top:28px; background:#ffbb33; color:#fff; font-weight:700; font-size:1.15rem; border:none; border-radius:10px; padding:14px 0; cursor:pointer; box-shadow:0 4px 18px #fbb14266; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='#ffbc47';" onmouseout="this.style.backgroundColor='#ffbb33';">Tambah Cerita</button>
          <div id="form-feedback" style="margin-top:20px; font-weight:600;"></div>
        </form>
      </section>
    `;
  },

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }
    const video = document.getElementById("videoElement");
    if (video) video.srcObject = null;
    const camPreview = document.getElementById("cameraPreview");
    const toggleBtn = document.getElementById("toggleCamera");
    if (camPreview) camPreview.style.display = "none";
    if (toggleBtn) toggleBtn.textContent = "Nyalakan Kamera";
  },

  async afterRender() {
    Loading.show();
    try {
      await MapPresenter.initMap("map", false);
      const map = document.getElementById("map")._leaflet_map;
      const latInput = document.getElementById("lat");
      const lonInput = document.getElementById("lon");

      if (this.marker) {
        try {
          map.removeLayer(this.marker);
        } catch (e) {}
        this.marker = null;
      }

      // Utility: hanya satu marker untuk semua aksi
      function updateMarker(lat, lng, icon = undefined) {
        if (AddStoryPage.marker) {
          AddStoryPage.marker.setLatLng([lat, lng]);
          if (icon) AddStoryPage.marker.setIcon(icon);
        } else {
          AddStoryPage.marker = L.marker(
            [lat, lng],
            icon ? { icon } : undefined
          ).addTo(map);
        }
      }

      // 1. Klik peta -> update marker tunggal
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        latInput.value = lat;
        lonInput.value = lng;
        updateMarker(lat, lng);
      });

      // 2. Lokasi sekarang -> update marker tunggal (tidak buat marker dari MapPresenter)
      async function setLocationByGeo() {
        try {
          if (!navigator.geolocation)
            throw new Error("Geolocation tidak didukung browser.");
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                latInput.value = latitude;
                lonInput.value = longitude;
                updateMarker(
                  latitude,
                  longitude,
                  L.icon({
                    iconUrl:
                      "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  })
                );
                map.setView([latitude, longitude], 14);
                resolve();
              },
              () => {
                latInput.value = "";
                lonInput.value = "";
                resolve();
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          });
        } catch {
          latInput.value = "";
          lonInput.value = "";
        }
      }
      await setLocationByGeo();

      const toggleBtn = document.getElementById("toggleCamera");
      const camPreview = document.getElementById("cameraPreview");
      const video = document.getElementById("videoElement");
      const canvas = document.getElementById("canvasElement");
      const takePhotoBtn = document.getElementById("takePhoto");
      const photoInput = document.getElementById("photo");
      const photoPreview = document.getElementById("photoPreview");
      const photoImg = document.getElementById("photoImg");
      const closeCameraBtn = document.getElementById("closeCameraBtn");

      if (closeCameraBtn)
        closeCameraBtn.addEventListener("click", this.stopCamera.bind(this));

      toggleBtn.addEventListener("click", async () => {
        if (camPreview.style.display === "none") {
          try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            video.srcObject = this.cameraStream;
            camPreview.style.display = "block";
            toggleBtn.textContent = "Matikan Kamera";
          } catch {
            Swal.fire({
              title: "Gagal",
              text: "Gagal mengakses kamera",
              icon: "error",
            });
          }
        } else {
          this.stopCamera();
        }
      });

      takePhotoBtn.addEventListener("click", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas
          .getContext("2d")
          .drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              photoImg.src = URL.createObjectURL(blob);
              photoPreview.style.display = "block";
              const file = new File([blob], "captured.jpg", {
                type: "image/jpeg",
              });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              photoInput.files = dataTransfer.files;
              this.stopCamera();
            }
          },
          "image/jpeg",
          0.9
        );
      });

      window.addEventListener("hashchange", this.stopCamera.bind(this));
      window.addEventListener("popstate", this.stopCamera.bind(this));

      const descriptionInput = document.getElementById("description");
      const feedback = document.getElementById("form-feedback");

      function validateForm() {
        const description = descriptionInput.value.trim();
        const photoFile = photoInput.files[0];
        const lat = latInput.value;
        const lon = lonInput.value;
        if (!description || !photoFile || !lat || !lon) {
          return false;
        } else {
          feedback.textContent = "";
          return true;
        }
      }
      descriptionInput.addEventListener("input", validateForm);
      photoInput.addEventListener("change", validateForm);
      latInput.addEventListener("input", validateForm);
      lonInput.addEventListener("input", validateForm);

      const form = document.getElementById("add-story-form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        Loading.show();
        try {
          const description = descriptionInput.value.trim();
          const photoFile = photoInput.files[0];
          const lat = latInput.value;
          const lon = lonInput.value;
          if (!description || !photoFile || !lat || !lon) {
            feedback.textContent =
              "Semua field harus diisi dan lokasi harus dipilih.";
            feedback.style.color = "#d03030";
            return;
          }
          feedback.textContent = "Mengirim data...";
          feedback.style.color = "#5a3e09";
          this.stopCamera();
          await AddStoryPresenter.addStory({
            description,
            photoFile,
            lat,
            lon,
          });
          await PushNotificationHelper.notifyStoryAdded(
            "StoryApp",
            `Deksripsi Cerita : ${description}`
          );
          feedback.textContent = "Cerita berhasil ditambahkan!";
          feedback.style.color = "#2d6a07";
          setTimeout(() => (window.location.hash = "#/home"), 1200);
        } catch (err) {
          feedback.textContent = err.message || "Gagal mengirim cerita.";
          feedback.style.color = "#d03030";
        } finally {
          Loading.hide();
        }
      });
    } finally {
      Loading.hide();
    }
  },
};
export default AddStoryPage;
