import FavoritePresenter from "../../presenters/favorite-presenter.js";
import Idb from "../../utils/idb.js";

const FavoritePage = {
  async render() {
    return `
      <style>
        .favorite-page {
          padding: 2rem;
        }
        .story-list {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 16px;
        }
        @media (max-width: 900px) {
          .story-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .favorite-page {
            padding: 1rem 0.3rem;
          }
          .story-list {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .story-card img {
            height: 140px;
          }
        }
        .story-card {
          background: linear-gradient(120deg,#fff8e3 77%, #ffefb0 100%);
          border-radius: 14px;
          box-shadow: 0 4px 24px #ffd95c55;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s;
          overflow: hidden;
          border: 2px solid #ffe59b;
        }
        .story-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-bottom: 1.5px solid #ffd157;
          background: #ffe89a;
          box-shadow: 0 1px 7px #ffe7a822;
        }
        .story-info {
          padding: 16px 16px 12px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .story-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.17em;
          font-weight: bold;
          color: #f59e0a;
          letter-spacing: 0.5px;
        }
        .story-info p {
          font-size: 0.97em;
          color: #ad7300;
          flex-grow: 1;
        }
        .unsave-btn {
          margin-top: 13px;
          padding: 8px 18px;
          background: linear-gradient(90deg, #fbaf18 78%, #eaad2a 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 1em;
          align-self: flex-end;
          box-shadow: 0 4px 18px #ffd95c29;
          transition: background 0.18s, transform 0.13s;
        }
        .unsave-btn:hover {
          background: linear-gradient(90deg,#f59e0a 68%,#ffb724 100%);
          transform: scale(1.03);
        }
      </style>
      <section class="favorite-page">
        <h2 style="color:#eaad2a; letter-spacing:.5px;">Story Favorit Saya</h2>
        <input 
          type="text" 
          id="search-fav" 
          placeholder="Cari story favorit..." 
          style="padding:8px;width:100%;max-width:400px;margin-bottom:16px;border-radius:8px;border:1px solid #ffe17d;box-shadow:0 1px 8px #fad47e22;"
        >
        <div id="favorite-list" class="story-list"></div>
      </section>
    `;
  },

  async afterRender() {
    const container = document.getElementById("favorite-list");
    let favorites = await Idb.getAll();

    const renderList = (list) => {
      if (list.length === 0) {
        container.innerHTML = `<p>Tidak ada story favorit ditemukan.</p>`;
        return;
      }
      container.innerHTML = list.map((story) => `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}">
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <button class="unsave-btn" data-id="${story.id}">Buang dari Favorit</button>
          </div>
        </div>
      `).join("");
      container.querySelectorAll(".unsave-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          await FavoritePresenter.deleteFavorite(id);
          favorites = await Idb.getAll();
          renderList(favorites);
        });
      });
    };

    renderList(favorites);

    const searchInput = document.querySelector("#search-fav");
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = favorites.filter((s) => s.name.toLowerCase().includes(query));
      renderList(filtered);
    });
  },
};

export default FavoritePage;
