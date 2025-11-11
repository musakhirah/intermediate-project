// Show loading overlay
export function showLoading() {
  document.querySelector("#loading-overlay").classList.add("show");
}

// Hide loading overlay
export function hideLoading() {
  document.querySelector("#loading-overlay").classList.remove("show");
}

// Show toast notification
export function showToast(message) {
  const toastContainer = document.getElementById("toast");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Setup dark mode toggle button in the header
export function setupDarkModeToggle() {
  const savedMode = localStorage.getItem("darkmode");
  if (savedMode === "on") document.body.classList.add("dark");

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "dark-toggle";
  toggleBtn.innerText = document.body.classList.contains("dark") ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkmode", isDark ? "on" : "off");
    toggleBtn.innerText = isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  };
  document.querySelector("header").appendChild(toggleBtn);
}
