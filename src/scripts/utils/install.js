let deferredPrompt;

export function setupInstallPrompt() {
  const btn = document.getElementById('btn-install');
  if (!btn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = 'inline-block';
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    btn.disabled = true;
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      deferredPrompt = null;
      btn.style.display = 'none';
      btn.disabled = false;
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    btn.style.display = 'none';
  });
}
