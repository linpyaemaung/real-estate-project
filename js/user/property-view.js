const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const propertyTableBody = document.getElementById("propertyTableBody");
const logoutButton = document.getElementById("logoutButton");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const currentUserId = localStorage.getItem("currentUserId") || (currentUser ? currentUser.id : null);

if (!currentUserId) {
    window.location.href = "login.html";
}

fetch(API_URL)
    .then(response => {
        if (!response.ok) throw new Error("Failed to get properties");
        return response.json();
    })
    .then(data => {
        console.log("Properties:", data);
        const userProperties = data.filter(item => String(item.userId) === String(currentUserId));

        if (userProperties.length === 0) {
            propertyTableBody.innerHTML = `<tr><td colspan="13" class="text-center text-muted">No properties found.</td></tr>`;
            return;
        }

        userProperties.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.property_name || "N/A"}</td>
                <td>${item.property_type || "N/A"}</td>
                <td>${item.listing_type || "N/A"}</td>
                <td>${item.township || "N/A"}</td>
                <td>${item.city || "N/A"}</td>
                <td>${item.bed_room || "N/A"}</td>
                <td>${item.bath_number || "N/A"}</td>
                <td>${item.floor || "N/A"}</td>
                <td>${item.property_area || "N/A"}</td>
                <td>${item.price || "N/A"}</td>
                <td>${item.image1 ? `<img src="${item.image1}" alt="${item.property_name || "Property Image"}" width="100" height="70" style="object-fit: cover; border-radius: 5px;">` : `<span class="text-muted">No Image</span>`}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-primary edit-button"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="btn btn-sm btn-danger delete-button"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;

            row.querySelector(".edit-button").addEventListener("click", function () {
                window.location.href = `edit-property.html?id=${item.id}`;
            });

            row.querySelector(".delete-button").addEventListener("click", function () {
                if (confirm("Are you sure you want to delete this property?")) {
                    deleteProperty(item.id);
                }
            });

            propertyTableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error:", error);
        propertyTableBody.innerHTML = `<tr><td colspan="13" class="text-center text-danger">Failed to load properties.</td></tr>`;
    });

function deleteProperty(id) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(response => {
            if (!response.ok) throw new Error("Failed to delete property");
            return response.json();
        })
        .then(data => {
            console.log("Deleted:", data);
            alert("Property deleted successfully!");
            window.location.reload();
        })
        .catch(error => {
            console.error("Delete Error:", error);
            alert("Failed to delete property.");
        });
}

logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");
    window.location.href = "login.html";
});