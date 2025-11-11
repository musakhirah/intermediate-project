import Storage from "../../utils/storage.js";
import HomePresenter from "../../presenters/home-presenter.js";
import MapPresenter from "../../presenters/map-presenter.js";
import { Loading } from "../../utils/loading.js";
import L from "leaflet";
import Idb from "../../utils/idb.js";

const injectStoryGridStyle = () => {
  if (document.getElementById("story-grid-style")) return;
  const style = document.createElement("style");
  style.id = "story-grid-style";
  style.innerHTML = `
    .welcome-section {
      background: linear-gradient(120deg, #fff8e3 60%, #ffefb0 100%);
      border-radius: 20px;
      max-width: 850px;
      margin: 42px auto 35px;
      padding: 30px 18px 22px 18px;
      box-shadow: 0 8px 34px #ffe7a622;
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #ad7300;
    }
    .welcome-logo {
      flex: 1 1 110px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
    }
    .logo-circle-xl {
      width: 48px; height: 48px;
      background: radial-gradient(ellipse at 65% 35%, #ffe17d 70%, #ffd157 100%);
      border-radius: 50%;
      box-shadow: 0 4px 22px #ffe37e79, 0 1px 3px #fdaf0673;
      margin-bottom: 18px;
    }
    .brand-big {
      font-size: 1.6em;
      font-weight: 900;
      color: #f59e0a;
      letter-spacing: 2px;
      text-align: center;
      margin-bottom: 8px;
    }
    .welcome-content {
      flex: 2 1 220px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .welcome-section h2 {
      font-weight: 700;
      font-size: 1.35rem;
      margin-bottom: 13px;
      color: #dd9600;
      letter-spacing: 0.01em;
    }
    .welcome-section p {
      font-size: 1.02rem;
      margin-bottom: 18px;
      line-height: 1.55;
      color: #9a7308;
    }
    .welcome-section h3 {
      font-size: 1.13rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: #eaad2a;
    }
    .btn-cta-home {
      display: block;
      background: #ffbb33;
      color: #fff;
      font-weight: 700;
      border-radius: 11px;
      padding: 11px 19px 12px 19px;
      font-size: 1rem;
      text-decoration: none;
      box-shadow: 0 4px 18px #fbb94b33;
      margin-top: 7px;
      transition: background .18s, transform .14s;
      text-align: center;
      line-height: 1.25;
      max-width: 370px;
    }
    .btn-cta-home:hover, .btn-cta-home:focus {
      background: #ffae1b;
      outline: none;
      transform: scale(1.045) translateY(-2px);
      box-shadow: 0 6px 22px #ffe17e2a;
    }
    @media (max-width: 700px) {
      .welcome-section { flex-direction: column; align-items: flex-start; }
      .welcome-logo { margin: auto}
      .welcome-content { width: 100%; text-align:center; }
    }

    #storyList {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      align-items: stretch;
      margin-bottom: 2em;
    }
    .story-card {
      display: flex;
      flex-direction: column;
      min-height: 230px;
      background: #fff8da;
      border-radius: 14px;
      box-shadow: 0 3px 10px #ffd38355;
      padding: 14px 11px 13px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .story-card:hover, .story-card:focus {
      background: #ffefbd;
      box-shadow: 0 6px 24px #ffc74d44;
      transform: translateY(-4px) scale(1.023);
      outline: none;
    }
    .story-card img {
      width: 100%;
      aspect-ratio: 1/1;
      object-fit: cover;
      border-radius: 11px;
      margin-bottom: 8px;
      background: #ffe89a;
      box-shadow: 0 1px 7px #ffdc7f27;
    }
    .story-card .title {
      color: #ffb724;
      font-weight: 700;
      font-size: 1.05rem;
      margin-bottom: 7px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .story-card .desc {
      font-size: .94rem;
      color: #b08700;
      line-height: 1.38;
      min-height: 34px;
      flex-grow: 1;
    }
    .story-card .created-at {
      font-size: .92rem;
      color: #aa7c00;
      margin-top: 7px;
    }
    @media (max-width: 700px) {
      #storyList { grid-template-columns: repeat(2, 1fr);}
    }
    @media (max-width: 520px) {
      #storyList { grid-template-columns: 1fr;}
    }
    .stories-section {
      margin: 38px auto 22px auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #b37400;
      max-width: 1080px;
    }
    .stories-section h2 {
      color: #ffaf33;
      font-weight: 700;
      margin-bottom: 16px;
      font-size:1.08rem;
      letter-spacing: .01em;
    }
    .stories-map {
      height: 325px;
      border-radius: 17px;
      box-shadow: 0 6px 24px #ffd95c29;
      margin-top: 29px;
    }
  `;
  document.head.appendChild(style);
};

const HomePage = {
  async render() {
    injectStoryGridStyle();

    const token = Storage.getToken();
    if (!token) {
      return `
        <section class="welcome-section">
          <div class="welcome-logo">
            <span class="logo-circle-xl"></span>
            <div class="brand-big">StoryApp</div>
          </div>
          <div class="welcome-content">
            <h1>Selamat Datang!</h1>
            <p>
              Temukan cerita baru, pengalaman inspiratif, dan bagikan kisahmu di StoryApp.
            </p>
            <h2>Daftar Cerita</h2>
            <a href="#/login" class="btn-cta-home">✨ Login untuk melihat cerita</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="stories-section">
        <h2>Cerita Terbaru</h2>
        <div id="storyList">Memuat...</div>
        <div id="map" class="stories-map"></div>
      </section>
    `;
  },

  async afterRender() {
    Loading.show();
    try {
      const token = Storage.getToken();
      if (!token) {
        Loading.hide();
        return;
      }

      const storyListContainer = document.getElementById("storyList");
      const stories = await HomePresenter.loadStories();

      if (!stories.length) {
        storyListContainer.innerHTML = '<p style="padding: 18px; color: #cc9000;">Tidak ada cerita tersedia.</p>';
        await MapPresenter.initMap("map");
        Loading.hide();
        return;
      }

      storyListContainer.innerHTML = stories
        .map((story, index) => {
          const createdAt = new Date(story.createdAt).toLocaleString("id-ID");
          return `
          <div tabindex="0" data-index="${index}" class="story-card">
            <img src="${story.photoUrl}" alt="${story.name}" />
            <div class="title">${story.name}</div>
            <div class="desc">${story.description}</div>
            <div class="created-at"><b>Created At:</b> ${createdAt}</div>
            <button class="favorite-btn" data-id="${story.id}">Tambah ke Favorit</button> <!-- Tombol Favorit -->
          </div>
        `;
        })
        .join("");

      // Event listener untuk tombol favorit
      const favoriteBtn = document.querySelectorAll(".favorite-btn");
      favoriteBtn.forEach((btn) => {
        btn.addEventListener("click", async (event) => {
          const storyId = event.target.dataset.id;
          const story = stories.find((s) => s.id === storyId);

          // Simpan cerita ke IndexedDB
          const isFavorite = await Idb.get(story.id);
          if (!isFavorite) {
            await Idb.put(story); // Menyimpan cerita ke IndexedDB
            event.target.textContent = "Dihapus dari Favorit";
          } else {
            await Idb.delete(story.id); // Menghapus cerita dari IndexedDB
            event.target.textContent = "Tambah ke Favorit";
          }

          // Redirect ke /favorite
          window.location.hash = "#/favorite";
        });
      });

      await MapPresenter.initMap("map");
      const map = MapPresenter.getMapInstance();

      setTimeout(() => {
        map.invalidateSize();
      }, 0);

      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const highlightIcon = L.icon({
        iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [30, 48], // sedikit lebih besar
        iconAnchor: [15, 48],
        popupAnchor: [1, -38],
      });

      const markers = [];
      let activeMarker = null;

      stories.forEach((story, index) => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon], { icon: defaultIcon }).addTo(map);
          markers.push(marker);

          const createdAt = new Date(story.createdAt).toLocaleString("id-ID");
          marker.bindPopup(`<b>${story.name}</b><br>${story.description}<br><small>Created At: ${createdAt}</small>`);

          // Ketika marker diklik di peta
          marker.on("click", () => {
            if (activeMarker && activeMarker !== marker) {
              activeMarker.setIcon(defaultIcon);
            }
            marker.setIcon(highlightIcon);
            activeMarker = marker;
          });

          // Ketika card story di klik
          const storyElement = document.querySelector(`[data-index="${index}"]`);
          if (storyElement) {
            const focusMarker = () => {
              if (activeMarker && activeMarker !== marker) {
                activeMarker.setIcon(defaultIcon);
              }
              marker.setIcon(highlightIcon);
              activeMarker = marker;
              map.setView([story.lat, story.lon], 12);
              marker.openPopup();
            };

            storyElement.addEventListener("click", focusMarker);
            storyElement.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                focusMarker();
              }
            });
          }
        }
      });
    } finally {
      Loading.hide();
    }
  },

  async getFavoriteText(storyId) {
    const isFavorite = await Idb.get(storyId);
    return isFavorite ? "Dibuang dari Favorit" : "Tambah ke Favorit";
  },
};

export default HomePage;
