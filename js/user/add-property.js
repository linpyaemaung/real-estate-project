const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Maximum allowed size: 5MB
const MAX_IMAGE_DIMENSION = 1200; // Downscales large photos to max 1200px width/height

const form = document.getElementById("propertyForm");
const logoutButton = document.getElementById("logoutButton");
const propertyImage = document.getElementById("propertyImage");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const currentUserId = localStorage.getItem("currentUserId") || (currentUser ? currentUser.id : null);

if (!currentUserId) {
    window.location.href = "login.html";
}
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

// Handle file change and show BIG image preview
propertyImage.addEventListener("change", async function () {
    const file = propertyImage.files[0];
    imagePreviewContainer.innerHTML = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file only.");
        propertyImage.value = "";
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("Selected image is too large! Maximum allowed file size is 5MB.");
        propertyImage.value = "";
        return;
    }

    try {
        const compressedBase64 = await resizeAndCompressImage(file, MAX_IMAGE_DIMENSION);
        
        // Large Image Preview Container (takes col-12 full width or col-md-10/8 for big display)
        imagePreviewContainer.innerHTML = `
            <div class="col-12 col-md-10 col-lg-8 mx-auto">
                <div class="card shadow">
                    <img src="${compressedBase64}" alt="Property Image" class="card-img-top" style="max-height: 450px; object-fit: cover;">
                    <div class="card-body text-center">
                        <small class="text-muted fw-bold">Selected Property Image Preview</small>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Error processing image:", err);
        alert("Failed to load image preview.");
    }
});

// Form submission handler
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const file = propertyImage.files[0];

    if (!file) {
        alert("Please select one property image.");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file only.");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("Selected image is too large! Maximum allowed file size is 5MB.");
        return;
    }

    try {
        const imageBase64 = await resizeAndCompressImage(file, MAX_IMAGE_DIMENSION);

        const property = {
            userId: currentUserId,
            property_name: document.getElementById("property_name").value,
            property_type: document.getElementById("property_type").value,
            listing_type: document.getElementById("listing_type").value,
            township: document.getElementById("township").value,
            city: document.getElementById("city").value,
            bed_room: document.getElementById("bed_room").value,
            bath_number: document.getElementById("bath_number").value,
            property_area: document.getElementById("property_area").value,
            floor: document.getElementById("floor").value,
            price: document.getElementById("price").value,
            image1: imageBase64
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(property)
        });

        if (!response.ok) throw new Error("Failed to add property");

        const data = await response.json();
        console.log("Property added:", data);
        alert("Property added successfully!");
        form.reset();
        imagePreviewContainer.innerHTML = "";
        window.location.href = "../properties.html";

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to add property.");
    }
});

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserId");
        window.location.href = "login.html";
    });
}