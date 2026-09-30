const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum allowed size: 5MB
const MAX_IMAGE_DIMENSION = 1200; // Resize large images to a max width/height of 1200px

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
const roleEl = document.getElementById("userRole");
const imageEl = document.getElementById("image");
const imageInput = document.getElementById("imageInput");
const logout = document.getElementById("logoutButton");
let currentImage = "";
function resizeAndCompressImage(file, maxDimension, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to compressed Base64 JPEG data URL
                const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedDataUrl);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

// Fetch user data on page load
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
        if (roleEl && userData.user_type) {
            roleEl.value = userData.user_type; 
        }
        currentImage = userData.profile_image || "";
        if (userData.profile_image) imageEl.src = userData.profile_image;
    })
    .catch(error => console.error("Error fetching user details:", error));

imageInput.addEventListener("change", async function () {
    const file = imageInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        imageInput.value = "";
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("Selected image is too large! Maximum allowed file size is 5MB.");
        imageInput.value = "";
        return;
    }

    try {
        const compressedBase64 = await resizeAndCompressImage(file, MAX_IMAGE_DIMENSION);
        imageEl.src = compressedBase64;
    } catch (err) {
        console.error(err);
        alert("Error processing selected image.");
    }
});

// Form submission handler
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const file = imageInput.files[0];

    const updatedUser = { 
        name: nameEl.value, 
        email: emailEl.value, 
        phone: phoneEl.value, 
        user_type: roleEl ? roleEl.value : "", 
        profile_image: currentImage 
    };

    if (file) {
        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds 5MB limit.");
            return;
        }

        try {
            // Process and compress high-resolution image to Base64
            updatedUser.profile_image = await resizeAndCompressImage(file, MAX_IMAGE_DIMENSION);
            updateUser(updatedUser);
        } catch (err) {
            console.error("Error compressing image:", err);
            alert("Failed to process image before upload.");
        }
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