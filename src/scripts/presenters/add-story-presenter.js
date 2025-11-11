import { API } from '../data/api.js';
import Storage from '../utils/storage.js';

const AddStoryPresenter = {
  async addStory({ description, photoFile, lat, lon }) {
    const token = Storage.getToken();
    if (!token) throw new Error('Anda harus login terlebih dahulu.');

    const response = await API.addStory({ description, photoFile, lat, lon, token });
    if (response?.error) throw new Error(response.message || 'Gagal menambahkan story.');

    // === Notifikasi Dinamis ===
    try {
      if ('serviceWorker' in navigator) {
        // Pastikan permission
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return response;
        }

        const reg = await navigator.serviceWorker.ready;

        // Ambil data dinamis dari API + input
        const story = response?.story || response || {};
        const storyId   = story.id || story.storyId || story._id;
        const author    = story.user?.name || Storage.getUser?.()?.name || 'Kamu';
        const photoUrl  = story.photoUrl || story.imageUrl || null;
        const rawDesc   = (story.description ?? description ?? '').toString().trim();
        const body      = rawDesc ? `“${rawDesc.slice(0, 120)}${rawDesc.length > 120 ? '…' : ''}”`
                                  : 'Ketuk untuk melihat detail story kamu.';
        const title     = storyId ? `${author} menambahkan story baru` : 'Story berhasil dibuat';
        const icon      = photoFile || photoUrl ? '/icon-512.png' : '/icon-192.png';
        const detailUrl = storyId ? `/#/detail/${storyId}` : '/#/home';

        // Kirim ke SW untuk ditampilkan
        reg.active?.postMessage({
          type: 'LOCAL_NOTIFY',
          payload: {
            title,
            body,
            icon,
            image: photoUrl || undefined,      // tampilkan preview foto jika ada
            badge: '/icon-192.png',
            tag: storyId ? `story-${storyId}` : 'story-update',
            renotify: true,
            vibrate: [80, 20, 80],
            timestamp: Date.now(),
            data: { url: detailUrl, storyId },
            actions: [
              { action: 'open-detail', title: 'Lihat Detail' },
              { action: 'close',       title: 'Tutup' }
            ],
          },
        });

        // Fallback terakhir bila SW belum aktif (jarang terjadi)
        if (!reg.active && 'Notification' in window) {
          new Notification(title, {
            body,
            icon,
            badge: '/icon-192.png',
            image: photoUrl || undefined,
            tag: storyId ? `story-${storyId}` : 'story-update',
          });
        }
      }
    } catch (e) {
      console.warn('Gagal mengirim notifikasi lokal:', e);
    }

    return response;
  },
};

export default AddStoryPresenter;
