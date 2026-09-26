const API_URL = "https://api.restful-api.dev/objects/ff808181a09d98f701a0dcb2128b1aa5";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const showPassword = document.getElementById("showPassword");

showPassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showPassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        passwordInput.type = "password";
        showPassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to get admin data");
        }

        const admin = await response.json();
        console.log(admin);

        if (
            admin.name === "admin" &&
            admin.data &&
            admin.data.email === email &&
            admin.data.password === password
        ) {
            localStorage.setItem("admin", JSON.stringify(admin));
            window.location.href = "dashboard.html";
        } else {
            errorMessage.textContent = "Invalid email or password.";
            errorMessage.classList.remove("d-none");
        }
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Unable to connect to the server.";
        errorMessage.classList.remove("d-none");
    }
});