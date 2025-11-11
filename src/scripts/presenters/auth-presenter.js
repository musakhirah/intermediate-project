import Navbar from "../utils/navbar.js";
import { API } from "../data/api.js";
import Storage from "../utils/storage.js";
import CONFIG from '../utils/config.js';
import Swal from "sweetalert2";

const AuthPresenter = {
  async login(email, password) {
    try {
      const response = await API.login(email, password);
      if (!response.error) {
        Storage.setToken(response.loginResult.token);
        if (response.loginResult.name) {
          localStorage.setItem("userName", response.loginResult.name);
        }

        Swal.fire({
          title: "Sukses",
          text: "Login berhasil!",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          window.location.hash = "#/home";
          Navbar.init();
        });
      } else {
        Swal.fire({
          title: "Gagal Login",
          text: response.message || "Login gagal. Periksa kembali data Anda.",
          icon: "error",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Kesalahan",
        text: "Terjadi kesalahan saat login.",
        icon: "error",
      });
    }
  },

  async register(name, email, password) {
    try {
      const response = await API.register(name, email, password);
      if (!response.error) {
        Swal.fire({
          title: "Sukses",
          text: "Registrasi berhasil! Silakan login.",
          icon: "success",
          showConfirmButton: false,
          timer: 1700,
          timerProgressBar: true,
        }).then(() => {
          window.location.hash = "#/login";
        });
      } else {
        Swal.fire({
          title: "Gagal Registrasi",
          text: response.message || "Registrasi gagal. Coba lagi.",
          icon: "error",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Kesalahan",
        text: "Terjadi kesalahan saat registrasi.",
        icon: "error",
        showConfirmButton: true,
      });
    }
  },

  logout() {
    Storage.clearToken();
    localStorage.removeItem("userName");

    Swal.fire({
      title: "Berhasil",
      text: "Berhasil logout!",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    }).then(() => {
      window.location.hash = "#/login";
      Navbar.init();
    });
  },

  isAuthenticated() {
    return !!Storage.getToken();
  },
};

export default AuthPresenter;
