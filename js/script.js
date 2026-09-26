const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const USERS_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
const propertyContainer = document.getElementById("propertyContainer");
const propertyTemplate = document.getElementById("propertyTemplate");
let allProperties = [];
let usersMap = {};

document.addEventListener("DOMContentLoaded", () => {
    loadProperties();
    setupFAQ();
});

async function loadProperties() {
    try {
        const [propertiesRes, usersRes] = await Promise.all([
            fetch(API_URL),
            fetch(USERS_URL)
        ]);
        if (!propertiesRes.ok) throw new Error("Failed to get properties");
        allProperties = await propertiesRes.json();
        if (usersRes.ok) {
            const users = await usersRes.json();
            users.forEach(user => {
                usersMap[user.id] = user.name || user.username || user.email || "Unknown User";
            });
        }
        renderProperties(allProperties);
    } catch (error) {
        console.error("Error loading properties:", error);
        propertyContainer.innerHTML = `<div class="col-12 text-center text-danger py-4">Error loading properties. Please try again later.</div>`;
    }
}

function renderProperties(properties) {
    propertyContainer.innerHTML = "";
    if (properties.length === 0) {
        propertyContainer.innerHTML = `<div class="col-12 text-center"><i class="fa-solid fa-house-circle-xmark display-4 text-muted mb-3"></i><h5 class="text-muted">No properties found.</h5></div>`;
        return;
    }
    properties.forEach(item => {
        const property = propertyTemplate.cloneNode(true);
        property.classList.remove("d-none");
        property.id = "";
        property.querySelector(".property-image").src = item.image1 || "https://via.placeholder.com/300x200?text=No+Image";
        property.querySelector(".property-name").textContent = item.property_name || "Unknown Property";
        property.querySelector(".property_type").textContent = item.property_type || "N/A";
        property.querySelector(".listing_type").textContent = item.listing_type || "N/A";
        property.querySelector(".property-location").textContent = `${item.township || ""}${item.township && item.city ? ", " : ""}${item.city || ""}`;
        property.querySelector(".property-bath").textContent = item.bath_number || 0;
        property.querySelector(".property-bed").textContent = item.bed_room || 0;
        property.querySelector(".property-area").textContent = item.property_area || "N/A";
        property.querySelector(".property-floor").textContent = item.floor || 0;
        property.querySelector(".property-price").textContent = item.price ? `${item.price} Lakh` : "N/A";
        const authorName = usersMap[item.userId] || "Unknown User";
        const authorElement = property.querySelector(".property-author");
        if (authorElement) authorElement.textContent = `Created by ${authorName}`;
        propertyContainer.appendChild(property);
    });
}

//Search Property
function searchProperty() {
    const townshipInput = document.getElementById("townshipSearch").value.toLowerCase().trim();
    const cityInput = document.getElementById("citySearch").value.toLowerCase().trim();
    const typeInput = document.getElementById("typeSearch").value.toLowerCase().trim();
    const filteredProperties = allProperties.filter(item => {
        const township = (item.township || "").toLowerCase().trim();
        const city = (item.city || "").toLowerCase().trim();
        const listingType = (item.listing_type || "").toLowerCase().trim();
        const propertyType = (item.property_type || "").toLowerCase().trim();

        const townshipMatch = townshipInput === "" || township.includes(townshipInput);
        const cityMatch = cityInput === "" || city.includes(cityInput);
        const typeMatch = typeInput === "" || listingType === typeInput || propertyType === typeInput;

        return townshipMatch && cityMatch && typeMatch;
    });

    renderProperties(filteredProperties);
}

//FAQ
function setupFAQ() {
    const faqs = document.querySelectorAll(".faq-container");
    faqs.forEach(faq => {
        const question = faq.querySelector(".faq-question");
        const answer = faq.querySelector(".faq-answer");
        const icon = faq.querySelector(".fa-angle-down, .fa-angle-up");

        if (question && answer) {
            question.addEventListener("click", function () {
                faq.classList.toggle("active");
                const isActive = faq.classList.contains("active");
                answer.style.display = isActive ? "block" : "none";
                if (icon) {
                    icon.classList.toggle("fa-angle-up", isActive);
                    icon.classList.toggle("fa-angle-down", !isActive);
                }
            });
        }
    });
}