import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import ForgotPage from "../pages/auth/forgot-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import FavoritePage from "../pages/favorite/favorite-page.js";
import StoryDetailPage from "../pages/detail/story-detail-page.js";

const routes = {
  "/": HomePage,
  "/home": HomePage,
  "/about": AboutPage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/forgot": ForgotPage,
  "/add-story": AddStoryPage,
  "/favorite": FavoritePage,
  "/story/:id": StoryDetailPage,
};

export default routes;
