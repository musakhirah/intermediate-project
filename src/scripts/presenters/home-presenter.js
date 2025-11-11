import { API } from '../data/api.js';
import Storage from '../utils/storage.js';

const HomePresenter = {
  async loadStories() {
    try {
      const token = Storage.getToken();
      if (!token) throw new Error('Token tidak tersedia');
      const response = await API.getStories(token);
      if (!response.error) {
        return response.listStory || [];
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Gagal memuat story:', error.message);
      return [];
    }
  },
};

export default HomePresenter;
