document.getElementById("signupForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let username = document.getElementById("Username").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    // Password must contain letters and numbers
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if(!passwordPattern.test(password)){
        alert("Password must contain at least one letter, one number, and be at least 6 characters long.");
        return;
    }

    if(password !== confirmPassword){
        alert("Passwords do not match!");
        return;
    }

    const response = await fetch("http://localhost:5000/api/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            name,
            email,
            username,
            password
        })

    });

    const data = await response.json();

    if(response.ok){

        alert("Account created successfully!");
        window.location.href="login.html";

    }else{

        alert(data.message);

    }

});