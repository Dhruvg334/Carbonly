/**
 * Centralized Client Script & Dynamic Navbar Auth State Controller
 * Enforces dynamic API base URL and unified navbar states across all pages.
 */

window.API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://carbonly-qpet.onrender.com";

function syncNavbarAuth() {
    const token = localStorage.getItem("token");
    const authContainers = document.querySelectorAll(".nav-links");

    authContainers.forEach(nav => {
        let authElement = nav.querySelector(".auth-nav-item");
        if (!authElement) {
            authElement = document.createElement("div");
            authElement.className = "auth-nav-item";
            nav.appendChild(authElement);
        }

        if (token) {
            let username = "Profile & History";
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.username) {
                    username = `Profile (${payload.username})`;
                }
            } catch(e){}

            authElement.innerHTML = `
                <a href="profile.html" class="btn-neo btn-neo-primary" style="font-size: 0.85rem; padding: 8px 16px;">${username}</a>
            `;
        } else {
            authElement.innerHTML = `
                <a href="login.html" class="btn-neo btn-neo-primary" style="font-size: 0.85rem; padding: 8px 16px;">Login</a>
            `;
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    syncNavbarAuth();
});