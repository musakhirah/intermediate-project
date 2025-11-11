import AuthPresenter from "../../presenters/auth-presenter.js";
import { Loading } from "../../utils/loading.js";

const RegisterPage = {
  async render() {
    return `
      <section style="background: linear-gradient(120deg, #fff8dc 40%, #ffecc1 100%);
        border-radius: 18px; padding: 32px 50px; max-width: 420px; margin: 50px auto;
        box-shadow: 0 6px 25px rgba(255, 182, 11, 0.25); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #a97500;">
        <h1 style="color:#f89700; font-weight:900; text-align:center; margin-bottom:26px;">Daftar Akun Baru</h1>
        <form id="register-form" style="display:flex; width: 250px; flex-direction:column; gap:16px;">
          <label for="name" style="font-weight: 700; color: #7a5600;">Nama Lengkap</label>
          <input type="text" id="name" required placeholder="Masukkan nama Anda" style="padding: 11px 14px; border-radius: 8px; border: 1.8px solid #dcb234; font-size: 1rem; outline-color: #ffbc32;"/>
          <label for="email" style="font-weight: 700; color: #7a5600;">Email</label>
          <input type="email" id="email" required placeholder="Masukkan email Anda" style="padding: 11px 14px; border-radius: 8px; border: 1.8px solid #dcb234; font-size: 1rem; outline-color: #ffbc32;"/>
          <label for="password" style="font-weight: 700; color: #7a5600;">Password</label>
          <div style="position:relative;">
            <input type="password" id="password" required placeholder="Masukkan password Anda"
              style="padding: 11px 38px 11px 14px; border-radius: 8px; border: 1.8px solid #dcb234; font-size: 1rem; outline-color: #ffbc32;" />
            <span id="togglePassword"
              style="position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
              cursor: pointer; font-size: 1.25em; color: #b88c13; z-index:2;">
              <i class="fa-regular fa-eye"></i>
            </span>
          </div>
          <button type="submit" style="background-color: #ffba31; color: white; font-weight: 700; font-size: 1.1rem;
            border: none; border-radius: 10px; padding: 14px 0; cursor: pointer; box-shadow: 0 4px 14px rgba(255, 178, 49, 0.5);">Daftar</button>
        </form>
        <p style="text-align:center; margin-top:18px; font-size: 0.95rem;">
          Sudah punya akun? <a href="#/login" style="color:#cc7f00; font-weight:600; text-decoration: underline;">Login</a>
        </p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      Loading.show();
      try {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        await AuthPresenter.register(name, email, password);
      } finally {
        Loading.hide();
      }
    });

    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    if (passwordInput && togglePassword) {
      togglePassword.onclick = () => {
        const isPassword = passwordInput.getAttribute("type") === "password";
        passwordInput.setAttribute("type", isPassword ? "text" : "password");
        togglePassword.style.color = isPassword ? "#f2bc39" : "#b88c13";
        togglePassword.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      };
    }
  },
};

export default RegisterPage;
