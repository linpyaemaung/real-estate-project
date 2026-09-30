const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const USERS_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";

const propertyContainer = document.getElementById("propertyContainer");
const propertyTemplate = document.getElementById("propertyTemplate");

let allProperties = [];
let usersMap = {};

document.addEventListener("DOMContentLoaded", () => {
    if (propertyContainer && propertyTemplate) {
        loadProperties();
    }
    setupFAQ();
    setupReadMore();
});


async function loadProperties() {
    try {
        const [propertiesRes, usersRes] = await Promise.all([
            fetch(API_URL),
            fetch(USERS_URL)
        ]);

        if (!propertiesRes.ok) throw new Error("Failed to fetch properties data");
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
        if (propertyContainer) {
            propertyContainer.innerHTML = `<div class="col-12 text-center text-danger py-4">Error loading properties. Please try again later.</div>`;
        }
    }
}

function renderProperties(properties) {
    if (!propertyContainer || !propertyTemplate) return;

    propertyContainer.innerHTML = "";

    if (properties.length === 0) {
        propertyContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-house-circle-xmark display-4 text-muted mb-3"></i>
                <h5 class="text-muted">No properties found.</h5>
            </div>`;
        return;
    }

    properties.forEach(item => {
        const property = propertyTemplate.cloneNode(true);
        property.classList.remove("d-none");
        property.id = "";
        property.dataset.listingType = (item.listing_type || "").toLowerCase().trim();


        const img = property.querySelector(".property-image");
        if (img) img.src = item.image1 || "https://via.placeholder.com/300x200?text=No+Image";

        const nameElem = property.querySelector(".property-name");
        if (nameElem) nameElem.textContent = item.property_name || "Unknown Property";

        const propTypeElem = property.querySelector(".property_type");
        if (propTypeElem) propTypeElem.textContent = item.property_type || "N/A";

        const listTypeElem = property.querySelector(".listing_type");
        if (listTypeElem) listTypeElem.textContent = item.listing_type || "N/A";

        const locationElem = property.querySelector(".property-location");
        if (locationElem) {
            locationElem.textContent = `${item.township || ""}${item.township && item.city ? ", " : ""}${item.city || ""}`;
        }

        const bathElem = property.querySelector(".property-bath");
        if (bathElem) bathElem.textContent = item.bath_number || 0;

        const bedElem = property.querySelector(".property-bed");
        if (bedElem) bedElem.textContent = item.bed_room || 0;

        const areaElem = property.querySelector(".property-area");
        if (areaElem) areaElem.textContent = item.property_area || "N/A";

        const floorElem = property.querySelector(".property-floor");
        if (floorElem) floorElem.textContent = item.floor || 0;

        const priceElem = property.querySelector(".property-price");
        if (priceElem) priceElem.textContent = item.price ? `${item.price} Lakh` : "N/A";

        const authorElem = property.querySelector(".property-author");
        if (authorElem) {
            authorElem.textContent = `Posted by ${usersMap[item.userId] || "Unknown User"}`;
        }

        const detailsLink = property.querySelector("a[href='property-details.html']");
        if (detailsLink) {
            detailsLink.href = `property-details.html?id=${item.id}`;
        }

        propertyContainer.appendChild(property);
    });
}

function filterProperties(type) {
    const targetType = (type || "").toLowerCase().trim();
    const properties = propertyContainer.querySelectorAll(".property-card, [data-listing-type]");
    
    properties.forEach(property => {
        const listingType = property.dataset.listingType;
        if (targetType === "all" || listingType === targetType) {
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

    if (targetType === "all" && buttons[0]) buttons[0].classList.replace("btn-outline-dark", "btn-dark");
    if (targetType === "sale" && buttons[1]) buttons[1].classList.replace("btn-outline-dark", "btn-dark");
    if (targetType === "rent" && buttons[2]) buttons[2].classList.replace("btn-outline-dark", "btn-dark");
}

function searchProperty() {
    const townshipInput = document.getElementById("townshipSearch")?.value.toLowerCase().trim() || "";
    const cityInput = document.getElementById("citySearch")?.value.toLowerCase().trim() || "";
    const typeInput = document.getElementById("typeSearch")?.value.toLowerCase().trim() || "";

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

// Interactive FAQ Accordion
function setupFAQ() {
    const faqs = document.querySelectorAll(".faq-container");
    faqs.forEach(faq => {
        const question = faq.querySelector(".faq-question");
        const answer = faq.querySelector(".faq-answer");
        const icon = faq.querySelector(".fa-angle-down, .fa-angle-up");

        if (question && answer) {
            question.addEventListener("click", () => {
                const isActive = faq.classList.toggle("active");
                answer.style.display = isActive ? "block" : "none";
                if (icon) {
                    icon.classList.toggle("fa-angle-up", isActive);
                    icon.classList.toggle("fa-angle-down", !isActive);
                }
            });
        }
    });
}

function setupReadMore() {
    const readMoreBtn = document.getElementById("readMoreBtn");
    const moreText = document.getElementById("moreText");

    if (readMoreBtn && moreText) {
        readMoreBtn.addEventListener("click", () => {
            const isHidden = getComputedStyle(moreText).display === "none";
            moreText.style.display = isHidden ? "block" : "none";
            readMoreBtn.textContent = isHidden ? "Read Less" : "Read More";
        });
    }
}