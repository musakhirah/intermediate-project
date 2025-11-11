import AboutPresenter from '../../presenters/about-presenter.js';
import { Loading } from '../../utils/loading.js';

const AboutPage = {
  async render() {
    return `
      <section style="
        max-width: 720px;
        margin: 45px auto 40px auto;
        padding: 28px 32px 34px 32px;
        background: linear-gradient(120deg, #f6eccbff 40%, #fff0c2 100%);
        border-radius: 18px;
        box-shadow: 0 6px 22px rgba(255, 182, 11, 0.25);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #9a7000;
      ">
        <h1 style="
          color: #f6ab2a; 
          font-weight: 900; 
          font-size: 2.1rem; 
          text-align: center;
          margin-bottom: 25px;
          letter-spacing: .01em;
        ">
          Tentang Aplikasi
        </h1>
        <div id="aboutContent" style="font-size: 1.13rem; line-height: 1.57; color: #805a00; text-align: justify; letter-spacing: 0.02em;">
          <div style="text-align:center;margin:2em 0;">Memuat...</div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    Loading.show();
    try {
      const content = document.querySelector('#aboutContent');
      content.innerHTML = `
        <p style="font-size:1.14rem; color:#c48001; text-align:center; font-style:italic; margin-bottom:2em;">
          “Aplikasi ini dirancang untuk menghadirkan wadah berbagi cerita, inspirasi, dan pengalaman berharga dari seluruh penjuru Nusantara. Dengan tema pastel kuning-oranye yang hangat, StoryApp bertujuan menciptakan suasana ramah, ceria, dan tetap profesional dalam setiap momen bercerita.”
        </p>
        <ul style="margin-bottom:1.7em; color:#b18224;">
          <li>
            <b>Tampilan Interaktif &amp; Responsive</b>: Mengutamakan akses mudah dari perangkat apa pun.
          </li>
          <li>
            <b>Peta Cerita</b>: Setiap cerita dapat ditandai di peta, mengajak pengguna menjelajah kisah sesuai lokasi.
          </li>
          <li>
            <b>Keamanan &amp; Kenyamanan</b>: Sistem login, tambah cerita, serta kemudahan akses yang ramah pengguna.
          </li>
          <li>
            <b>Tema Warna Hangat</b>: Nuansa pastel kuning-oranye dipilih untuk membangun kepedulian, kebahagiaan, dan keakraban digital.
          </li>
        </ul>
        <div style="background:#fff7cd; padding:18px; border-radius:10px; box-shadow:0 2px 8px #fae0a4cc;">
          <b>Visi StoryApp:</b> <br>
          Menjadi ruang digital inklusif dan inspiratif di mana setiap orang bisa saling berbagi pengalaman serta mengenal kisah baru dengan mudah, aman, dan menyenangkan.
        </div>
      `;
    } finally {
      Loading.hide();
    }
  },
};

export default AboutPage;
