import Idb from '../utils/idb.js';

const FavoritePresenter = {
  // Memuat cerita favorit dari IndexedDB
  async loadFavorites() {
    try {
      const favorites = await Idb.getAll();  // Mengambil semua data dari IndexedDB
      return favorites;  // Mengembalikan data favorit
    } catch (err) {
      console.error('Gagal memuat data dari IndexedDB:', err);  // Log error jika gagal
      return [];  // Kembalikan array kosong jika gagal
    }
  },

  // Menghapus cerita dari IndexedDB berdasarkan ID
  async deleteFavorite(id) {
    try {
      await Idb.delete(id);  // Menghapus cerita berdasarkan ID
      return true;  // Mengembalikan true jika berhasil
    } catch (err) {
      console.error('Gagal menghapus story:', err);  // Log error jika gagal
      return false;  // Mengembalikan false jika gagal
    }
  },
};

export default FavoritePresenter;
