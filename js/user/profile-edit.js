const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum allowed size: 5MB
const MAX_IMAGE_DIMENSION = 350; // Resized avatar dimension for optimal MockAPI Base64 storage

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

let currentImage = "https://via.placeholder.com/150";

function resizeAndCompressImage(file, maxDimension, quality = 0.7) {
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

                // Convert canvas to lightweight JPEG Base64 URL
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

// 1. Fetch user data on page load
if (user && user.id) {
    fetch(`${API_URL}/${user.id}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch user profile");
            return response.json();
        })
        .then(userData => {
            console.log("Loaded user data:", userData);
            if (nameEl) nameEl.value = userData.name || "";
            if (emailEl) emailEl.value = userData.email || "";
            if (phoneEl) phoneEl.value = userData.phone || "";
            if (roleEl) roleEl.value = userData.user_type || userData.userType || "";

            // Check across possible image keys in MockAPI
            const existingImage = userData.profile_image || userData.image || userData.avatar;
            if (existingImage) {
                currentImage = existingImage;
            }

            if (imageEl) {
                imageEl.src = currentImage;
                imageEl.onerror = function () {
                    this.onerror = null;
                    this.src = "https://via.placeholder.com/150";
                };
            }
        })
        .catch(error => console.error("Error fetching user details:", error));
}

// 2. Image Selection & Preview Handler
if (imageInput) {
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
            currentImage = compressedBase64; // Keep memory state synchronized
            if (imageEl) imageEl.src = compressedBase64;
        } catch (err) {
            console.error(err);
            alert("Error processing selected image.");
        }
    });
}

// 3. Form Submission Handler
if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const file = imageInput ? imageInput.files[0] : null;

        let finalImage = currentImage;

        if (file) {
            try {
                finalImage = await resizeAndCompressImage(file, MAX_IMAGE_DIMENSION);
            } catch (err) {
                console.error("Error compressing image:", err);
                alert("Failed to process image before upload.");
                return;
            }
        }

        // Standardize image keys for universal compatibility
        const updatedUser = { 
            name: nameEl ? nameEl.value : "", 
            email: emailEl ? emailEl.value : "", 
            phone: phoneEl ? phoneEl.value : "", 
            user_type: roleEl ? roleEl.value : "", 
            profile_image: finalImage,
            image: finalImage,
            avatar: finalImage
        };

        updateUser(updatedUser);
    });
}

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
            console.log("Successfully updated user:", userData);
            // Save updated user data back into local storage for navbar.js & profile.js
            localStorage.setItem("currentUser", JSON.stringify(userData));
            alert("Profile updated successfully!");
            window.location.href = "profile.html";
        })
        .catch(error => {
            console.error(error);
            alert("Failed to update profile on server.");
        });
}

// 4. Logout Handler
if (logout) {
    logout.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}