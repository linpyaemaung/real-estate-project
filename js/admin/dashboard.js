const USERS_API = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
const PROPERTIES_API = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";
const CONTACT_STORAGE_KEY = "contactMessages";
const adminData = localStorage.getItem("admin");

if (!adminData) {
    window.location.href = "login.html";
}

const admin = JSON.parse(adminData);
document.getElementById("adminName").textContent = admin.name || "";

const dashboardTab = document.getElementById("dashboardTab");
const usersTab = document.getElementById("usersTab");
const propertiesTab = document.getElementById("propertiesTab");
const contactsTab = document.getElementById("contactsTab");

const dashboardSection = document.getElementById("dashboardSection");
const usersSection = document.getElementById("usersSection");
const propertiesSection = document.getElementById("propertiesSection");
const contactsSection = document.getElementById("contactsSection");

const pageTitle = document.getElementById("pageTitle");

function showSection(section) {
    dashboardSection.classList.add("d-none");
    usersSection.classList.add("d-none");
    propertiesSection.classList.add("d-none");
    contactsSection.classList.add("d-none");

    dashboardTab.classList.remove("active");
    usersTab.classList.remove("active");
    propertiesTab.classList.remove("active");
    contactsTab.classList.remove("active");

    if (section === "dashboard") {
        dashboardSection.classList.remove("d-none");
        dashboardTab.classList.add("active");
        pageTitle.textContent = "Dashboard";
    }

    if (section === "users") {
        usersSection.classList.remove("d-none");
        usersTab.classList.add("active");
        pageTitle.textContent = "Users";
    }

    if (section === "properties") {
        propertiesSection.classList.remove("d-none");
        propertiesTab.classList.add("active");
        pageTitle.textContent = "Properties";
    }

    if (section === "contacts") {
        contactsSection.classList.remove("d-none");
        contactsTab.classList.add("active");
        pageTitle.textContent = "Contacts";
    }
}

dashboardTab.addEventListener("click", function () {
    showSection("dashboard");
});

usersTab.addEventListener("click", function () {
    showSection("users");
    loadUsers();
});

propertiesTab.addEventListener("click", function () {
    showSection("properties");
    loadProperties();
});

contactsTab.addEventListener("click", function () {
    showSection("contacts");
    loadContacts();
});

const usersTableBody = document.getElementById("usersTableBody");
const userForm = document.getElementById("userForm");
const userModal = new bootstrap.Modal(document.getElementById("userModal"));

async function loadUsers() {
    try {
        const response = await fetch(USERS_API);

        if (!response.ok) {
            throw new Error("Failed to get users");
        }

        const users = await response.json();

        usersTableBody.innerHTML = "";
        document.getElementById("userCount").textContent = users.length;

        users.forEach(function (user) {
            usersTableBody.innerHTML += `
                <tr>
                    <td>${user.id || ""}</td>
                    <td>${user.name || ""}</td>
                    <td>${user.email || ""}</td>
                    <td>${user.phone || ""}</td>
                    <td>${user.user_type || ""}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editUser('${user.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Failed to load users.</td>
            </tr>
        `;
    }
}

document.getElementById("addUserButton").addEventListener("click", function () {
    userForm.reset();
    document.getElementById("userId").value = "";
    document.getElementById("userModalTitle").textContent = "Add User";
    userModal.show();
});

userForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = document.getElementById("userId").value;
    const userData = {
        name: document.getElementById("userName").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        password: document.getElementById("userPassword").value.trim(),
        phone: document.getElementById("userPhone").value.trim(),
        user_type: document.getElementById("userType").value
    };

    try {
        let response;

        if (userId) {
            response = await fetch(`${USERS_API}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        } else {
            response = await fetch(USERS_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        }

        if (!response.ok) {
            throw new Error("Failed to save user");
        }

        userModal.hide();
        await loadUsers();
    } catch (error) {
        console.error(error);
        alert("Failed to save user.");
    }
});

async function editUser(id) {
    try {
        const response = await fetch(`${USERS_API}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to get user");
        }

        const user = await response.json();

        document.getElementById("userId").value = user.id;
        document.getElementById("userName").value = user.name || "";
        document.getElementById("userEmail").value = user.email || "";
        document.getElementById("userPassword").value = user.password || "";
        document.getElementById("userPhone").value = user.phone || "";
        document.getElementById("userType").value = user.user_type || "user";
        document.getElementById("userModalTitle").textContent = "Edit User";

        userModal.show();
    } catch (error) {
        console.error(error);
        alert("Failed to get user.");
    }
}

async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    try {
        const response = await fetch(`${USERS_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete user");
        }

        await loadUsers();
    } catch (error) {
        console.error(error);
        alert("Failed to delete user.");
    }
}

const propertiesTableBody = document.getElementById("propertiesTableBody");
const propertyForm = document.getElementById("propertyForm");
const propertyModal = new bootstrap.Modal(document.getElementById("propertyModal"));

async function loadProperties() {
    try {
        const response = await fetch(PROPERTIES_API);

        if (!response.ok) {
            throw new Error("Failed to get properties");
        }

        const properties = await response.json();

        propertiesTableBody.innerHTML = "";
        document.getElementById("propertyCount").textContent = properties.length;

        properties.forEach(function (property) {
            propertiesTableBody.innerHTML += `
                <tr>
                    <td>${property.id || ""}</td>
                    <td>${property.property_name || ""}</td>
                    <td>${property.property_type || ""}</td>
                    <td>${property.listing_type || ""}</td>
                    <td>${property.township || ""}</td>
                    <td>${property.city || ""}</td>
                    <td>${property.price || ""}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editProperty('${property.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProperty('${property.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
        propertiesTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">Failed to load properties.</td>
            </tr>
        `;
    }
}

document.getElementById("addPropertyButton").addEventListener("click", function () {
    propertyForm.reset();
    document.getElementById("propertyId").value = "";
    document.getElementById("propertyModalTitle").textContent = "Add Property";
    propertyModal.show();
});

propertyForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const propertyId = document.getElementById("propertyId").value;
    const propertyData = {
        property_name: document.getElementById("propertyName").value.trim(),
        property_type: document.getElementById("propertyType").value,
        listing_type: document.getElementById("listingType").value,
        township: document.getElementById("township").value.trim(),
        city: document.getElementById("city").value.trim(),
        address: document.getElementById("address").value.trim(),
        bed_room: document.getElementById("bedroom").value,
        bath_number: document.getElementById("bathNumber").value,
        price: document.getElementById("price").value,
        image: document.getElementById("propertyImage").value.trim()
    };

    try {
        let response;

        if (propertyId) {
            response = await fetch(`${PROPERTIES_API}/${propertyId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(propertyData)
            });
        } else {
            response = await fetch(PROPERTIES_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(propertyData)
            });
        }

        if (!response.ok) {
            throw new Error("Failed to save property");
        }

        propertyModal.hide();
        await loadProperties();
    } catch (error) {
        console.error(error);
        alert("Failed to save property.");
    }
});

async function editProperty(id) {
    try {
        const response = await fetch(`${PROPERTIES_API}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to get property");
        }

        const property = await response.json();

        document.getElementById("propertyId").value = property.id;
        document.getElementById("propertyName").value = property.property_name || "";
        document.getElementById("propertyType").value = property.property_type || "Housing";
        document.getElementById("listingType").value = property.listing_type || "Rent";
        document.getElementById("township").value = property.township || "";
        document.getElementById("city").value = property.city || "";
        document.getElementById("address").value = property.address || "";
        document.getElementById("bedroom").value = property.bed_room || "";
        document.getElementById("bathNumber").value = property.bath_number || "";
        document.getElementById("price").value = property.price || "";
        document.getElementById("propertyImage").value = property.image || "";
        document.getElementById("propertyModalTitle").textContent = "Edit Property";

        propertyModal.show();
    } catch (error) {
        console.error(error);
        alert("Failed to get property.");
    }
}

async function deleteProperty(id) {
    if (!confirm("Are you sure you want to delete this property?")) {
        return;
    }

    try {
        const response = await fetch(`${PROPERTIES_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete property");
        }

        await loadProperties();
    } catch (error) {
        console.error(error);
        alert("Failed to delete property.");
    }
}

const contactsTableBody = document.getElementById("contactsTableBody");
const contactCount = document.getElementById("contactCount");
const refreshContactsButton = document.getElementById("refreshContactsButton");

function loadContacts() {
    try {
        const contacts = JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY)) || [];

        contactsTableBody.innerHTML = "";
        contactCount.textContent = contacts.length;

        if (contacts.length === 0) {
            contactsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No contact messages found.</td>
                </tr>
            `;
            return;
        }

        contacts.forEach(function (contact) {
            contactsTableBody.innerHTML += `
                <tr>
                    <td>${contact.id || ""}</td>
                    <td>${contact.name || ""}</td>
                    <td>${contact.email || ""}</td>
                    <td>${contact.subject || ""}</td>
                    <td class="message-cell">${contact.message || ""}</td>
                    <td>${contact.date || ""}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteContact(${contact.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Failed to load contacts:", error);
        contactCount.textContent = "0";
        contactsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Failed to load contacts.</td>
            </tr>
        `;
    }
}

function deleteContact(id) {
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }

    let contacts = JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY)) || [];
    contacts = contacts.filter(function (contact) {
        return contact.id !== id;
    });

    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contacts));
    loadContacts();
    alert("Contact deleted successfully.");
}

refreshContactsButton.addEventListener("click", function () {
    loadContacts();
});

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem("admin");
    window.location.href = "login.html";
});

loadUsers();
loadProperties();
loadContacts();