const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const USERS_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";

const propertyContainer = document.getElementById("propertyContainer");
const propertyTemplate = document.getElementById("propertyTemplate");

async function loadProperties() {
    try {
        const [propertiesRes, usersRes] = await Promise.all([
            fetch(API_URL),
            fetch(USERS_URL)
        ]);

        if (!propertiesRes.ok) throw new Error("Failed to get properties");

        const data = await propertiesRes.json();
        const usersMap = {};

        if (usersRes.ok) {
            const users = await usersRes.json();
            users.forEach(user => {
                usersMap[user.id] = user.name || user.username || user.email || "Unknown User";
            });
        }

        data.forEach(item => {
            const property = propertyTemplate.cloneNode(true);
            property.classList.remove("d-none");
            property.id = "";
            property.dataset.listingType = (item.listing_type || "").toLowerCase().trim();

            // Populate Card Information
            const img = property.querySelector(".property-image");
            if (img) img.src = item.image1 || "https://via.placeholder.com/300x200?text=No+Image";

            property.querySelector(".property-name").textContent = item.property_name || "Unknown Property";
            property.querySelector(".property_type").textContent = item.property_type || "N/A";
            property.querySelector(".listing_type").textContent = item.listing_type || "N/A";
            property.querySelector(".property-location").textContent = `${item.township || ""}${item.township && item.city ? ", " : ""}${item.city || ""}`;
            property.querySelector(".property-bath").textContent = item.bath_number || 0;
            property.querySelector(".property-bed").textContent = item.bed_room || 0;
            property.querySelector(".property-area").textContent = item.property_area || "N/A";
            property.querySelector(".property-floor").textContent = item.floor || 0;
            property.querySelector(".property-price").textContent = item.price ? `${item.price} Lakh` : "N/A";

            // Set Author if element exists
            const authorElem = property.querySelector(".property-author");
            if (authorElem) {
                authorElem.textContent = `posted by ${usersMap[item.userId] || "Anonymous"}`;
            }

            // Bind ID to View Details link/button
            const detailsLink = property.querySelector("a[href='property-details.html']");
            if (detailsLink) {
                detailsLink.href = `property-details.html?id=${item.id}`;
            }

            propertyContainer.appendChild(property);
        });

    } catch (error) {
        console.error("Error loading properties:", error);
    }
}

// Filter Sale, Rent, and All
function filterProperties(type) {
    const properties = propertyContainer.querySelectorAll(".property-card");
    properties.forEach(property => {
        const listingType = property.dataset.listingType;

        if (type === "all" || listingType === type) {
            property.classList.remove("d-none");
        } else {
            property.classList.add("d-none");
        }
    });

    const buttons = document.querySelectorAll(".properties button");
    buttons.forEach(button => {
        button.classList.remove("btn-dark");
        button.classList.add("btn-outline-dark");
    });

    if (type === "all") {
        buttons[0]?.classList.replace("btn-outline-dark", "btn-dark");
    } else if (type === "sale") {
        buttons[1]?.classList.replace("btn-outline-dark", "btn-dark");
    } else if (type === "rent") {
        buttons[2]?.classList.replace("btn-outline-dark", "btn-dark");
    }
}

loadProperties();