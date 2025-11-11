import AuthPresenter from '../../presenters/auth-presenter.js';
import { Loading } from '../../utils/loading.js';

const ForgotPage = {
  async render() {
    return `
      <section style="
        background: linear-gradient(120deg, #fff8dc 40%, #ffecc1 100%);
        border-radius: 18px;
        padding: 32px 50px;
        max-width: 420px;
        margin: 50px auto;
        box-shadow: 0 6px 25px rgba(255, 182, 11, 0.25);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #a97500;
      ">
        <h2 style="color:#f89700; font-weight:900; text-align:center; margin-bottom:26px;">Lupa Password</h2>
        <form id="forgot-form" style="display:flex; width: 250px; flex-direction:column; gap:16px;">
          <label for="email" style="font-weight: 700; color: #7a5600;">Email</label>
          <input type="email" id="email" required placeholder="Masukkan email Anda" style="padding: 11px 14px; border-radius: 8px; border: 1.8px solid #dcb234; font-size: 1rem; outline-color: #ffbc32;"/>
          <button type="submit" style="background-color: #ffba31; color: white; font-weight: 700; font-size: 1.1rem; border: none; border-radius: 10px; padding: 14px 0; cursor: pointer; box-shadow: 0 4px 14px rgba(255, 178, 49, 0.5); transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='#ffb837'" onmouseout="this.style.backgroundColor='#ffba31'">Kirim Link Reset</button>
        </form>
        <p style="text-align:center; margin-top:18px;">
          <a href="#/login" style="color:#cc7f00; font-weight:600; text-decoration: underline;">Kembali ke Login</a>
        </p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#forgot-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      Loading.show();
      try {
        const email = document.getElementById('email').value.trim();
        await AuthPresenter.forgotPassword(email);
      } finally {
        Loading.hide();
      }
    });
  },
};

export default ForgotPage;
