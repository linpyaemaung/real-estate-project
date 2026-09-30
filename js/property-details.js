const API_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const USERS_URL = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";

document.addEventListener("DOMContentLoaded", () => {
    loadPropertyDetails();
    setupAgentForm();
});

async function loadPropertyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get("id");

    if (!propertyId) {
        alert("No property selected!");
        window.location.href = "properties.html";
        return;
    }

    try {
        const [propertyRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/${propertyId}`),
            fetch(USERS_URL)
        ]);

        if (!propertyRes.ok) throw new Error("Property not found");

        const property = await propertyRes.json();
        
        let userData = {
            name: "Unknown User",
            phone: "N/A",
            email: "N/A",
            user_type:"N/A"
        };

        if (usersRes.ok) {
            const users = await usersRes.json();
            const foundUser = users.find(u => String(u.id) === String(property.userId));
            if (foundUser) {
                userData.name = foundUser.name || foundUser.username || "Unknown User";
                userData.phone = foundUser.phone || foundUser.phone_number || foundUser.phoneNumber || "N/A";
                userData.email = foundUser.email || "N/A";
                  userData.user_type = foundUser.user_type || "N/A";
            }
        }

        renderDetails(property, userData);

    } catch (error) {
        console.error("Error loading details:", error);
        const detailsContainer = document.getElementById("detailsContainer");
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="alert alert-danger text-center my-5">
                    <h4>Failed to load property details.</h4>
                    <a href="properties.html" class="btn btn-dark mt-3">Back to Properties</a>
                </div>`;
        }
    }
}

function renderDetails(property, author) {

    setText("propertyName", property.property_name || "Untitled Property");
    setText("propertyLocation", `${property.township || ""}${property.township && property.city ? ", " : ""}${property.city || "N/A"}`);
    setText("propertyPrice", property.price ? `${property.price} Lakh` : "N/A");
    setText("propertyDescription", property.description || "No description provided for this property.");


    setText("authorName", author.name);
    
    const phoneEl = document.getElementById("authorPhone");
    if (phoneEl) {
        phoneEl.textContent = author.phone;
        phoneEl.href = author.phone !== "N/A" ? `tel:${author.phone}` : "#";
    }


    const emailEl = document.getElementById("authorEmail");
    if (emailEl) {
        emailEl.textContent = author.email;
        emailEl.href = author.email !== "N/A" ? `mailto:${author.email}` : "#";
    }
  const usertypeEl = document.getElementById("authorUserType");

if (usertypeEl) {
    usertypeEl.textContent = author.user_type || author.usertype || "User";
    const userType = author.user_type || author.usertype;
    
    if (userType && userType !== "N/A") {
        usertypeEl.href = `properties.html?type=${encodeURIComponent(userType.toLowerCase())}`;
    } else {
        usertypeEl.href = "#";
    }
}
  
    setText("badgeListing", (property.listing_type || "N/A").toUpperCase());
    setText("badgeType", (property.property_type || "N/A").toUpperCase());


    setText("featureBeds", `${property.bed_room || 0} Beds`);
    setText("featureBaths", `${property.bath_number || 0} Baths`);
    setText("featureArea", `${property.property_area || "N/A"} sqft`);
    setText("featureFloor", `${property.floor || 0} Floor`);

    const mainImg = document.getElementById("mainImage");
    if (mainImg) {
        mainImg.src = property.image1 || "https://via.placeholder.com/800x450?text=No+Image";
    }
}

function setupAgentForm() {
    const form = document.getElementById("agentForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Thank you! Your message has been submitted.");
            form.reset();
        });
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}