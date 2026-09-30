const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
let user = null;

try {
    const rawUser = localStorage.getItem("currentUser");
    if (!rawUser) {
        throw new Error("No user stored");
    }    
    user = JSON.parse(rawUser);
} catch (e) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

fetch(`${API_URL}/${user.id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch user profile");
        }
        return response.json();
    })
    .then(userData => {
        const nameEl = document.getElementById("name");
        const emailEl = document.getElementById("email");
        const phoneEl = document.getElementById("phone");
        const userTypeEl = document.getElementById("userType");
        const imageEl = document.getElementById("image");
        const profileDisplayName = document.getElementById("profile-display-name");

        if (nameEl) nameEl.textContent = userData.name || "--";
        if (emailEl) emailEl.textContent = userData.email || "--";
        if (phoneEl) phoneEl.textContent = userData.phone || "--";
        if (userTypeEl) userTypeEl.textContent = userData.user_type || "--";
        if (profileDisplayName && userData.name) profileDisplayName.textContent = userData.name;
        if (imageEl && userData.profile_image) {
            imageEl.src = userData.profile_image;
        }
    })
    .catch(error => {
        console.error("Error fetching user details:", error);
    });

const logout = document.getElementById("logoutButton");
if (logout) {
    logout.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}