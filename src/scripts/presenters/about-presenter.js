const AboutPresenter = {
  async render(container) {
    container.innerHTML = `
      <section class="about-section">
        <h1>Tentang Aplikasi</h1>
        <p>
          Aplikasi ini dikembangkan sebagai proyek submission untuk kelas Belajar Fundamental Front-End Web Development di Dicoding.
          Menerapkan arsitektur MVP, SPA dengan hash routing, dan transisi halaman custom.
        </p>
        <p>Developer: <strong>Musakhirah</strong></p>
      </section>
    `;
  },
};

export default AboutPresenter;
