import Storage from "../utils/storage.js";
import AuthPresenter from "../presenters/auth-presenter.js";

const Navbar = {
  init() {
    const addStoryBtn = document.getElementById("add-story-btn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("user-info");
    const loginLink = document.getElementById("login-link");
    const favoriteLink = document.getElementById("favorite-link");
    const isLoggedIn = !!Storage.getToken();
    const userName = isLoggedIn ? localStorage.getItem("userName") || "Pengguna" : null;

    if (addStoryBtn) addStoryBtn.style.display = isLoggedIn ? "" : "none";
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "" : "none";
    if (loginLink) loginLink.style.display = !isLoggedIn ? "" : "none";
    if (favoriteLink) favoriteLink.style.display = isLoggedIn ? "" : "none";

    if (userInfo) {
      userInfo.textContent = isLoggedIn ? `Hai, ${userName}` : "";
      userInfo.style.display = isLoggedIn ? "inline-block" : "none";
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        AuthPresenter.logout();
      };
    }

    // INI WAJIB: ambil dari DOM SEKARANG
    let hamburger = document.querySelector(".hamburger");
    let navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
      // Clone hamburger: remove all previous listeners.
      const newHamburger = hamburger.cloneNode(true);
      hamburger.parentNode.replaceChild(newHamburger, hamburger);

      // Query ulang elemen karena .hamburger sudah diganti
      hamburger = newHamburger;

      hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        navLinks.classList.toggle("active");
        const expanded = hamburger.getAttribute("aria-expanded") === "true";
        hamburger.setAttribute("aria-expanded", !expanded);
      });

      // AMAN: setiap render hanya ada 1 listener window (tidak dobel)
      const closeMenu = () => {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", false);
      };

      window.addEventListener(
        "click",
        function windowClickHandler(e) {
          if (!navLinks.contains(e.target) && e.target !== hamburger) {
            closeMenu();
          }
        },
        { once: true }
      );

      window.addEventListener("hashchange", closeMenu, { once: true });
      window.addEventListener("popstate", closeMenu, { once: true });
    }
  },
};

export default Navbar;
