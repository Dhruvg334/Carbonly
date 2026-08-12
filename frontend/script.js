/**
 * Centralized Client Script & Dynamic Navbar Auth State Controller
 * Enforces dynamic API base URL and zero-flicker navbar auth state across all pages.
 */

window.API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://carbonly-qpet.onrender.com";

window.getApiUrl = function(path) {
    const baseUrl = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://carbonly-qpet.onrender.com";
    const cleanPath = path.startsWith("/") ? path : "/" + path;
    return baseUrl + cleanPath;
};

window.getAuthNavItemHtml = function() {
    const token = localStorage.getItem("token");
    if (token) {
        let username = "Profile & History";
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.username) {
                username = `Profile (${payload.username})`;
            }
        } catch(e){}
        return `<a href="profile.html" class="btn-neo btn-neo-primary" style="font-size: 0.85rem; padding: 8px 16px;">${username}</a>`;
    } else {
        return `<a href="login.html" class="btn-neo btn-neo-primary" style="font-size: 0.85rem; padding: 8px 16px;">Login</a>`;
    }
};

function syncNavbarAuth() {
    const authContainers = document.querySelectorAll(".nav-links");
    authContainers.forEach(nav => {
        let authElement = nav.querySelector(".auth-nav-item");
        if (!authElement) {
            authElement = document.createElement("div");
            authElement.className = "auth-nav-item";
            nav.appendChild(authElement);
        }
        authElement.innerHTML = window.getAuthNavItemHtml();
    });
}

// Fallback listener for dynamic DOM updates
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncNavbarAuth);
} else {
    syncNavbarAuth();
}