const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
    }

});

// Login
loginForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const passwordValue = document.getElementById("password").value;

    fetch(API_URL)
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to get users");
            }

            return response.json();

        })
        .then(data => {

            const user = data.find(item =>
                item.email === email &&
                item.password === passwordValue
            );

            if (user) {

                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(user)
                );

                message.innerHTML = `
                    <div class="alert alert-success">
                        Login successful!
                    </div>
                `;

                setTimeout(() => {
                    window.location.href = "../../index.html";
                }, 1000);

            } else {

                message.innerHTML = `
                    <div class="alert alert-danger">
                        Invalid email or password!
                    </div>
                `;

            }

        })
        .catch(error => {

            console.log(error);

            message.innerHTML = `
                <div class="alert alert-danger">
                    Login failed. Please try again.
                </div>
            `;

        });

});