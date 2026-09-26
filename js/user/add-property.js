const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const form = document.getElementById("propertyForm");
const logoutButton = document.getElementById("logoutButton");
const propertyImage = document.getElementById("propertyImage");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const currentUserId = localStorage.getItem("currentUserId") || (currentUser ? currentUser.id : null);

if (!currentUserId) {
    window.location.href = "login.html";
}

propertyImage.addEventListener("change", function () {
    const file = propertyImage.files[0];
    imagePreviewContainer.innerHTML = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file only.");
        propertyImage.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
        imagePreviewContainer.innerHTML = `<div class="col-md-6 col-lg-4"><div class="card shadow-sm"><img src="${event.target.result}" alt="Property Image" class="card-img-top" style="height: 250px; object-fit: cover;"><div class="card-body text-center"><small class="text-muted">Property Image</small></div></div></div>`;
    };
    reader.readAsDataURL(file);
});

form.addEventListener("submit", function (event) {
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
        image1: ""
    };
    const reader = new FileReader();
    reader.onload = function (event) {
        property.image1 = event.target.result;
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(property)
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add property");
                return response.json();
            })
            .then(data => {
                console.log("Property added:", data);
                alert("Property added successfully!");
                form.reset();
                imagePreviewContainer.innerHTML = "";
                window.location.href = "property.html";
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Failed to add property.");
            });
    };
    reader.readAsDataURL(file);
});

logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");
    window.location.href = "login.html";
});