import UrlParser from "../routes/url-parser";
import routes from "../routes/routes";
import Navbar from "../utils/navbar.js";
import PushNotificationHelper from "../utils/push.js"; // ✅ gunakan helper final

class App {
  constructor({ content }) {
    this._content = content;
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url];

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this._content.innerHTML = await page.render();
        await page.afterRender();
        Navbar.init();
      });
    } else {
      this._content.classList.add("fade-out");
      setTimeout(async () => {
        this._content.innerHTML = await page.render();
        await page.afterRender();
        this._content.classList.remove("fade-out");
        this._content.classList.add("fade-in");
        Navbar.init();
      }, 300);
    }
  }
}

export default App;

window.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
  });

  await app.renderPage();

  // ✅ Jalankan inisialisasi push notification helper
  await PushNotificationHelper.init();
});
