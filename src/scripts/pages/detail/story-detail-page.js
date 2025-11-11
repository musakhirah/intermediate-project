import Idb from "../../utils/idb.js";
import { API } from "../../data/api.js";
import Storage from "../../utils/storage.js";

const StoryDetailPage = {
  async render() {
    return `
      <section class="story-detail-page">
        <div id="story-detail"></div>
        <button id="save-btn" class="save-btn">Simpan Cerita</button>
        <button id="favorite-btn" class="favorite-btn">Tambah ke Favorit</button> <!-- Tombol Favorit -->
      </section>
    `;
  },

  async afterRender() {
    const url = window.location.hash.split("/")[2];
    const token = Storage.getToken();

    try {
      const response = await API.getStoryDetail(url, token); // Ambil detail cerita dari API
      const story = response.story; // Ambil data cerita
      const container = document.getElementById("story-detail");
      const saveBtn = document.getElementById("save-btn");
      const favoriteBtn = document.getElementById("favorite-btn");
      console.log(favoriteBtn); // Cek apakah tombol favorit ada di DOM

      // Render detail cerita
      container.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}" class="story-img">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
      `;

      const saved = await Idb.get(story.id);
      saveBtn.textContent = saved ? "Buang Cerita" : "Simpan Cerita";

      saveBtn.addEventListener("click", async () => {
        const isSaved = await Idb.get(story.id);
        if (isSaved) {
          await Idb.delete(story.id);
          saveBtn.textContent = "Simpan Cerita";
        } else {
          await Idb.put(story);
          saveBtn.textContent = "Buang Cerita";
        }
      });

      // Event listener untuk tombol favorit
      favoriteBtn.addEventListener("click", async () => {
        const isFavorite = await Idb.get(story.id);
        if (!isFavorite) {
          await Idb.put(story); // Menyimpan cerita ke IndexedDB
          favoriteBtn.textContent = "Dibuang dari Favorit"; // Mengubah teks tombol
        } else {
          await Idb.delete(story.id);
          favoriteBtn.textContent = "Tambah ke Favorit"; // Mengubah teks jika sudah disimpan
        }
      });
    } catch (error) {
      console.error("Gagal memuat detail story:", error); // Tangani error API
    }
  },
};

export default StoryDetailPage;
