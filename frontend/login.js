document.addEventListener("mousemove", function(e) {

    const modal = document.getElementById("purposeModal");
const btn = document.getElementById("purposeBtn");
const closeBtn = document.getElementById("closeModal");
const aboutModal = document.getElementById("aboutModal");
const aboutBtn = document.getElementById("aboutBtn");
const closeAbout = document.getElementById("closeAbout");

aboutBtn.onclick = function() {
  aboutModal.style.display = "flex";
}

closeAbout.onclick = function() {
  aboutModal.style.display = "none";
}

btn.onclick = function() {
  modal.style.display = "flex";
}

closeBtn.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", function () {

  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);

  this.textContent = type === "password" ? "👁" : "🙈";
});
 
  const leaf = document.createElement("div");
  leaf.classList.add("leaf");

  leaf.style.left = e.pageX + "px";
  leaf.style.top = e.pageY + "px";

  document.body.appendChild(leaf);

  setTimeout(() => {
    leaf.remove();
  }, 2000);
});

document.querySelector("form").addEventListener("submit", async function(e) {

  e.preventDefault();

  const username = document.querySelector("input[name='username']").value;
  const password = document.querySelector("input[name='password']").value;

  const response = await fetch("http://localhost:5000/api/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      username,
      password
    })

  });

  const data = await response.json();

  if (response.ok) {

    localStorage.setItem("token", data.token);

    window.location.href = "index.html";

  } else {

    alert(data.message);

  }

});