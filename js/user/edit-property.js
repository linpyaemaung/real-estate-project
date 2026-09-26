const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const form = document.getElementById("editPropertyForm");
const logoutButton = document.getElementById("logoutButton");
const propertyImage = document.getElementById("propertyImage");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const updateButton = document.getElementById("updateButton");
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get("id");
console.log("Property ID:", propertyId);
let propertyData = null;
let currentImage = "";
let newImage = "";

if (!propertyId) {
    alert("Property ID missing in URL.");
    window.location.href = "property.html";
} else {
    fetch(`${API_URL}/${propertyId}`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to get property. Status: ${response.status}`);
            return response.json();
        })
        .then(item => {
            console.log("Loaded property:", item);
            propertyData = item;
            document.getElementById("property_name").value = item.property_name || "";
            document.getElementById("property_type").value = item.property_type || "";
            document.getElementById("listing_type").value = item.listing_type || "";
            document.getElementById("township").value = item.township || "";
            document.getElementById("city").value = item.city || "";
            document.getElementById("bed_room").value = item.bed_room ?? 0;
            document.getElementById("bath_number").value = item.bath_number ?? 0;
            document.getElementById("floor").value = item.floor ?? 0;
            document.getElementById("property_area").value = item.property_area || "";
            document.getElementById("price").value = item.price ?? 0;
            currentImage = item.image1 || "";
            newImage = currentImage;
            renderImagePreview();
        })
        .catch(error => {
            console.error("Fetch error:", error);
            alert("Failed to load property details.");
        });
}

function compressImage(file, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                const compressedImage = canvas.toDataURL("image/jpeg", quality);
                resolve(compressedImage);
            };
            img.onerror = function (error) { reject(error); };
        };
        reader.onerror = function (error) { reject(error); };
    });
}

function renderImagePreview() {
    imagePreviewContainer.innerHTML = "";
    if (!newImage) {
        imagePreviewContainer.innerHTML = `<div class="col-md-6 col-lg-4"><div class="card shadow-sm"><div class="d-flex justify-content-center align-items-center bg-light" style="height: 250px;"><span class="text-muted">No Image</span></div><div class="card-body text-center"><small class="text-muted">Property Image</small></div></div></div>`;
        return;
    }
    imagePreviewContainer.innerHTML = `<div class="col-md-6 col-lg-4"><div class="card shadow-sm"><img src="${newImage}" alt="Property Image" class="card-img-top" style="height: 250px; object-fit: cover;"><div class="card-body text-center"><small class="text-muted">Property Image</small></div></div></div>`;
}

propertyImage.addEventListener("change", async function () {
    const file = propertyImage.files[0];
    if (!file) {
        newImage = currentImage;
        renderImagePreview();
        return;
    }
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file only.");
        propertyImage.value = "";
        return;
    }
    try {
        newImage = await compressImage(file);
        renderImagePreview();
    } catch (error) {
        console.error("Image processing error:", error);
        alert("Failed to process image.");
        propertyImage.value = "";
    }
});

form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!propertyData) {
        alert("Property data is still loading.");
        return;
    }
    updateButton.disabled = true;
    updateButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Updating...`;
    const updatedProperty = {
        property_name: document.getElementById("property_name").value.trim(),
        property_type: document.getElementById("property_type").value,
        listing_type: document.getElementById("listing_type").value,
        township: document.getElementById("township").value.trim(),
        city: document.getElementById("city").value.trim(),
        bed_room: parseInt(document.getElementById("bed_room").value, 10) || 0,
        bath_number: parseInt(document.getElementById("bath_number").value, 10) || 0,
        floor: parseInt(document.getElementById("floor").value, 10) || 0,
        property_area: document.getElementById("property_area").value.trim(),
        price: parseFloat(document.getElementById("price").value) || 0,
        image1: newImage
    };
    console.log("Updated Property:", updatedProperty);
    fetch(`${API_URL}/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProperty)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Update failed (${response.status}): ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Successfully updated:", data);
            alert("Property updated successfully!");
            window.location.href = "property.html";
        })
        .catch(error => {
            console.error("Update error:", error);
            updateButton.disabled = false;
            updateButton.innerHTML = `<i class="fa-solid fa-pen me-1"></i> Update Property`;
            alert("Failed to update property. Check the browser console.");
        });
});

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserId");
        window.location.href = "login.html";
    });
}