const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    const message = document.getElementById("message");
    const profileImage = document.getElementById("profile_image");
    const imagePreview = document.getElementById("imagePreview");
    profileImage.addEventListener("change", function () {
        const file = profileImage.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e)=> {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove("d-none");
            };
            reader.readAsDataURL(file);
        }
    });

    // Register
    registerForm.addEventListener("submit",  (e)=> {
        e.preventDefault();
        const name =  document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const passwordValue = document.getElementById("password").value;
        const phone = document.getElementById("phone").value;
        const file = profileImage.files[0];
        if (!file) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Please select a profile image!
                </div>
            `;
            return;
        }
        const reader = new FileReader();
        reader.onload = function () {
            const user = {
                name: name,
                email: email,
                password: passwordValue,
                phone: phone,
                profile_image: reader.result
            };
            fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        "Registration failed");
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                message.innerHTML = `
                    <div class="alert alert-success">
                        Registration successful!
                    </div>
                `;
                registerForm.reset();
                imagePreview.src = "";
                imagePreview.classList.add("d-none");
            })
            .catch(error => {
                console.log(error);
                message.innerHTML = `
                    <div class="alert alert-danger">
                        Registration failed!
                    </div>
                `;
            });
        };
        reader.readAsDataURL(file);
    });
}

//hide and show password
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
    togglePassword.addEventListener("click", function () {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add( "fa-eye-slash");
        }
        else {
            password.type = "password";
            togglePassword.classList.remove( "fa-eye-slash" );
            togglePassword.classList.add( "fa-eye");
        }
    });


