// ===== POPUP FUNCTIONALITY =====

// Get elements
const purposeBtn = document.getElementById("purpose-btn");
const popupOverlay = document.getElementById("popup-overlay");
const closePopup = document.getElementById("close-popup");

// Open popup
purposeBtn.addEventListener("click", () => {
  popupOverlay.style.display = "flex";
});

// Close popup (button)
closePopup.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

// Close popup when clicking outside the box
popupOverlay.addEventListener("click", (e) => {
  if (e.target === popupOverlay) {
    popupOverlay.style.display = "none";
  }
});

// Close popup using ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    popupOverlay.style.display = "none";
  }
});

function startTracking(){

let token = localStorage.getItem("token");

if(token){
window.location.href = "dashboard.html";
}else{
window.location.href = "login.html";
}

}

// ===== NAVBAR SCROLL EFFECT =====

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".top-strip");

  if (window.scrollY > 50) {
    navbar.style.boxShadow = "0 4px 25px rgba(0,0,0,0.1)";
  } else {
    navbar.style.boxShadow = "0 2px 15px rgba(0,0,0,0.05)";
  }
});



// ===== HERO TEXT FADE-IN ANIMATION =====

window.addEventListener("load", () => {
  const heroText = document.querySelector(".hero h1");

  heroText.style.opacity = "0";
  heroText.style.transform = "translateY(20px)";
  heroText.style.transition = "all 1s ease";

  setTimeout(() => {
    heroText.style.opacity = "1";
    heroText.style.transform = "translateY(0)";
  }, 300);
});

// ===== LOGIN STATE CHECK =====

window.addEventListener("load", () => {

let token = localStorage.getItem("token");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const logoutBtn = document.getElementById("logoutBtn");

if(token){

loginBtn.style.display = "none";
signupBtn.style.display = "none";

dashboardBtn.style.display = "inline";
logoutBtn.style.display = "inline";

}

});

document.getElementById("logoutBtn").addEventListener("click", function(){

localStorage.removeItem("token");

window.location.href = "index.html";

});