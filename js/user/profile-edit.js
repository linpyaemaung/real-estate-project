const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
let user = null;

try {
    const rawUser = localStorage.getItem("currentUser");
    if (!rawUser) throw new Error("No user stored");
    user = JSON.parse(rawUser);
} catch (e) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

const form = document.getElementById("editProfileForm");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const imageEl = document.getElementById("image");
const imageInput = document.getElementById("imageInput");
const logout = document.getElementById("logoutButton");
let currentImage = "";

fetch(`${API_URL}/${user.id}`)
    .then(response => {
        if (!response.ok) throw new Error("Failed to fetch user profile");
        return response.json();
    })
    .then(userData => {
        console.log("User data:", userData);
        nameEl.value = userData.name || "";
        emailEl.value = userData.email || "";
        phoneEl.value = userData.phone || "";
        currentImage = userData.profile_image || "";
        if (userData.profile_image) imageEl.src = userData.profile_image;
    })
    .catch(error => console.error("Error fetching user details:", error));

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        imageInput.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function (event) { imageEl.src = event.target.result; };
    reader.readAsDataURL(file);
});

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const file = imageInput.files[0];
    const updatedUser = { name: nameEl.value, email: emailEl.value, phone: phoneEl.value, profile_image: currentImage };
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            updatedUser.profile_image = event.target.result;
            updateUser(updatedUser);
        };
        reader.readAsDataURL(file);
    } else {
        updateUser(updatedUser);
    }
});

function updateUser(updatedUser) {
    fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to update profile");
            return response.json();
        })
        .then(userData => {
            console.log("Updated user:", userData);
            localStorage.setItem("currentUser", JSON.stringify(userData));
            alert("Profile updated successfully!");
            window.location.href = "profile.html";
        })
        .catch(error => {
            console.error(error);
            alert("Failed to update profile.");
        });
}

if (logout) {
    logout.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}