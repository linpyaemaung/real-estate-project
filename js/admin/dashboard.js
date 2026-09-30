const USERS_API = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/users";
const PROPERTIES_API = "https://6aa8c6ca2d442cb69d49088a.mockapi.io/api/v1/properties";

const CONTACT_STORAGE_KEY = "contactMessages";

const adminData = localStorage.getItem("admin");

if (!adminData) {
    window.location.href = "login.html";
}

let admin = null;

try {
    admin = JSON.parse(adminData);
} catch (error) {
    admin = {
        name: "Admin"
    };
}


/* =========================
   ELEMENTS
========================= */

const dashboardTab = document.getElementById("dashboardTab");
const usersTab = document.getElementById("usersTab");
const propertiesTab = document.getElementById("propertiesTab");
const contactsTab = document.getElementById("contactsTab");

const dashboardSection = document.getElementById("dashboardSection");
const usersSection = document.getElementById("usersSection");
const propertiesSection = document.getElementById("propertiesSection");
const contactsSection = document.getElementById("contactsSection");

const pageTitle = document.getElementById("pageTitle");
const adminName = document.getElementById("adminName");

const userCount = document.getElementById("userCount");
const propertyCount = document.getElementById("propertyCount");
const contactCount = document.getElementById("contactCount");

const usersTableBody = document.getElementById("usersTableBody");
const propertiesTableBody = document.getElementById("propertiesTableBody");
const contactsTableBody = document.getElementById("contactsTableBody");

const addUserButton = document.getElementById("addUserButton");
const addPropertyButton = document.getElementById("addPropertyButton");

const refreshContactsButton = document.getElementById("refreshContactsButton");
const logoutButton = document.getElementById("logoutButton");

const userModalElement = document.getElementById("userModal");
const propertyModalElement = document.getElementById("propertyModal");

const userModal = new bootstrap.Modal(userModalElement);
const propertyModal = new bootstrap.Modal(propertyModalElement);


/* =========================
   ADMIN NAME
========================= */

if (adminName) {
    adminName.textContent =
        admin?.name ||
        admin?.username ||
        admin?.email ||
        "Admin";
}


/* =========================
   SECTION CONTROL
========================= */

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

        loadDashboard();

    }

    if (section === "users") {

        usersSection.classList.remove("d-none");
        usersTab.classList.add("active");

        pageTitle.textContent = "Users";

        loadUsers();

    }

    if (section === "properties") {

        propertiesSection.classList.remove("d-none");
        propertiesTab.classList.add("active");

        pageTitle.textContent = "Properties";

        loadProperties();

    }

    if (section === "contacts") {

        contactsSection.classList.remove("d-none");
        contactsTab.classList.add("active");

        pageTitle.textContent = "Contacts";

        loadContacts();

    }
}


/* =========================
   TAB EVENTS
========================= */

dashboardTab.addEventListener("click", function () {
    showSection("dashboard");
});

usersTab.addEventListener("click", function () {
    showSection("users");
});

propertiesTab.addEventListener("click", function () {
    showSection("properties");
});

contactsTab.addEventListener("click", function () {
    showSection("contacts");
});


/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

    try {

        const [usersResponse, propertiesResponse] = await Promise.all([
            fetch(USERS_API),
            fetch(PROPERTIES_API)
        ]);

        const users = await usersResponse.json();
        const properties = await propertiesResponse.json();

        const contacts = getContacts();

        userCount.textContent = users.length;
        propertyCount.textContent = properties.length;
        contactCount.textContent = contacts.length;

    } catch (error) {

        console.error("Dashboard Error:", error);

        userCount.textContent = "0";
        propertyCount.textContent = "0";
        contactCount.textContent = getContacts().length;
    }
}


/* =========================
   USERS
========================= */

async function loadUsers() {

    usersTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Loading users...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(USERS_API);

        if (!response.ok) {
            throw new Error("Failed to load users");
        }

        const users = await response.json();

        userCount.textContent = users.length;

        if (users.length === 0) {

            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No users found.
                    </td>
                </tr>
            `;

            return;
        }

        usersTableBody.innerHTML = "";

        users.forEach(function (user) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(user.id)}</td>

                <td>${escapeHTML(user.name || "")}</td>

                <td>${escapeHTML(user.email || "")}</td>

                <td>${escapeHTML(user.phone || "")}</td>

                <td>${escapeHTML(user.user_type || user.userType || "")}</td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-warning me-1"
                        onclick="editUser('${user.id}')"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="deleteUser('${user.id}')"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>

                </td>
            `;

            usersTableBody.appendChild(row);
        });

    } catch (error) {

        console.error("Users Error:", error);

        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Failed to load users.
                </td>
            </tr>
        `;
    }
}


/* =========================
   ADD USER
========================= */

addUserButton.addEventListener("click", function () {

    document.getElementById("userForm").reset();

    document.getElementById("userId").value = "";

    document.getElementById("userModalTitle").textContent = "Add User";

    userModal.show();
});


/* =========================
   SAVE USER
========================= */

document.getElementById("userForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const id = document.getElementById("userId").value;

    const userData = {

        name: document.getElementById("userName").value.trim(),

        email: document.getElementById("userEmail").value.trim(),

        password: document.getElementById("userPassword").value.trim(),

        phone: document.getElementById("userPhone").value.trim(),

        user_type: document.getElementById("userType").value

    };

    if (!userData.name || !userData.email || !userData.password) {

        alert("Please fill in all required fields.");

        return;
    }

    try {

        let response;

        if (id) {

            response = await fetch(`${USERS_API}/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(userData)

            });

        } else {

            response = await fetch(USERS_API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(userData)

            });

        }

        if (!response.ok) {
            throw new Error("Failed to save user");
        }

        alert(id ? "User updated successfully." : "User added successfully.");

        userModal.hide();

        loadUsers();

        loadDashboard();

    } catch (error) {

        console.error("Save User Error:", error);

        alert("Failed to save user.");
    }
});


/* =========================
   EDIT USER
========================= */

async function editUser(id) {

    try {

        const response = await fetch(`${USERS_API}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to load user");
        }

        const user = await response.json();

        document.getElementById("userId").value = user.id;

        document.getElementById("userName").value = user.name || "";

        document.getElementById("userEmail").value = user.email || "";

        document.getElementById("userPassword").value = user.password || "";

        document.getElementById("userPhone").value = user.phone || "";

        document.getElementById("userType").value =
            user.user_type ||
            user.userType ||
            "Property's Owner";

        document.getElementById("userModalTitle").textContent = "Edit User";

        userModal.show();

    } catch (error) {

        console.error("Edit User Error:", error);

        alert("Failed to load user.");
    }
}


/* =========================
   DELETE USER
========================= */

async function deleteUser(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${USERS_API}/${id}`, {

            method: "DELETE"

        });

        if (!response.ok) {
            throw new Error("Failed to delete user");
        }

        alert("User deleted successfully.");

        loadUsers();

        loadDashboard();

    } catch (error) {

        console.error("Delete User Error:", error);

        alert("Failed to delete user.");
    }
}


/* =========================
   PROPERTIES
========================= */

async function loadProperties() {

    propertiesTableBody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center">
                Loading properties...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(PROPERTIES_API);

        if (!response.ok) {
            throw new Error("Failed to load properties");
        }

        const properties = await response.json();

        propertyCount.textContent = properties.length;

        if (properties.length === 0) {

            propertiesTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        No properties found.
                    </td>
                </tr>
            `;

            return;
        }

        propertiesTableBody.innerHTML = "";

        properties.forEach(function (property) {

            const image =
                property.image1 ||
                property.image ||
                "";

            const imageHTML = image
                ? `
                    <img
                        src="${escapeAttribute(image)}"
                        alt="Property"
                        style="
                            width:70px;
                            height:50px;
                            object-fit:cover;
                            border-radius:6px;
                        "
                    >
                  `
                : `
                    <span class="text-muted">
                        No Image
                    </span>
                  `;

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${escapeHTML(property.id)}
                </td>

                <td>
                    ${imageHTML}
                </td>

                <td>
                    ${escapeHTML(property.property_name || "")}
                </td>

                <td>
                    ${escapeHTML(property.property_type || "")}
                </td>

                <td>
                    ${escapeHTML(property.listing_type || "")}
                </td>

                <td>
                    ${escapeHTML(property.township || "")}
                </td>

                <td>
                    ${escapeHTML(property.city || "")}
                </td>

                <td>
                    ${formatPrice(property.price)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-warning me-1"
                        onclick="editProperty('${property.id}')"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        onclick="deleteProperty('${property.id}')"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>

                </td>
            `;

            propertiesTableBody.appendChild(row);
        });

    } catch (error) {

        console.error("Properties Error:", error);

        propertiesTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    Failed to load properties.
                </td>
            </tr>
        `;
    }
}


/* =========================
   ADD PROPERTY
========================= */

addPropertyButton.addEventListener("click", function () {

    document.getElementById("propertyForm").reset();

    document.getElementById("propertyId").value = "";

    document.getElementById("propertyModalTitle").textContent =
        "Add Property";

    document.getElementById("imagePreviewContainer")
        .classList.add("d-none");

    document.getElementById("imagePreview").src = "";

    propertyModal.show();
});


/* =========================
   IMAGE PREVIEW
========================= */

document
    .getElementById("propertyImage")
    .addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (!file) {

            document
                .getElementById("imagePreviewContainer")
                .classList.add("d-none");

            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {

            document.getElementById("imagePreview").src =
                e.target.result;

            document
                .getElementById("imagePreviewContainer")
                .classList.remove("d-none");
        };

        reader.readAsDataURL(file);
    });


/* =========================
   IMAGE TO BASE64
========================= */

function imageToBase64(file) {

    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(reader.error);
        };

        reader.readAsDataURL(file);
    });
}


/* =========================
   COMPRESS IMAGE
========================= */

function compressImage(file) {

    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function (event) {

            const image = new Image();

            image.onload = function () {

                const canvas = document.createElement("canvas");

                const maxWidth = 800;
                const maxHeight = 800;

                let width = image.width;
                let height = image.height;

                if (width > maxWidth) {

                    height =
                        height * (maxWidth / width);

                    width = maxWidth;
                }

                if (height > maxHeight) {

                    width =
                        width * (maxHeight / height);

                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;

                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        0.7
                    )
                );
            };

            image.onerror = reject;

            image.src = event.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


/* =========================
   SAVE PROPERTY
========================= */

document
    .getElementById("propertyForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const id =
            document.getElementById("propertyId").value;

        const propertyName =
            document.getElementById("propertyName").value.trim();

        if (!propertyName) {

            alert("Please enter property name.");

            return;
        }

        const imageFile =
            document.getElementById("propertyImage").files[0];

        let image = "";

        if (imageFile) {

            try {

                image = await compressImage(imageFile);

            } catch (error) {

                console.error("Image Error:", error);

                alert("Failed to process image.");

                return;
            }
        }


        const propertyData = {

            property_name: propertyName,

            property_type:
                document.getElementById("propertyType").value,

            listing_type:
                document.getElementById("listingType").value,

            township:
                document.getElementById("township").value.trim(),

            city:
                document.getElementById("city").value.trim(),

            bed_room:
                Number(
                    document.getElementById("bedroom").value
                ) || 0,

            bath_number:
                Number(
                    document.getElementById("bathNumber").value
                ) || 0,

            property_area:
                Number(
                    document.getElementById("area").value
                ) || 0,

            floor:
                Number(
                    document.getElementById("floor").value
                ) || 0,

            price:
                Number(
                    document.getElementById("price").value
                ) || 0
        };


        if (image) {

            propertyData.image1 = image;

            propertyData.image = image;
        }


        try {

            let response;

            if (id) {

                response = await fetch(
                    `${PROPERTIES_API}/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(propertyData)
                    }
                );

            } else {

                response = await fetch(
                    PROPERTIES_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(propertyData)
                    }
                );
            }


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(errorText);

                throw new Error(
                    "Failed to save property"
                );
            }


            alert(
                id
                    ? "Property updated successfully."
                    : "Property added successfully."
            );

            propertyModal.hide();

            loadProperties();

            loadDashboard();

        } catch (error) {

            console.error(
                "Save Property Error:",
                error
            );

            alert(
                "Failed to save property. Please try again."
            );
        }

    });


/* =========================
   EDIT PROPERTY
========================= */

async function editProperty(id) {

    try {

        const response =
            await fetch(`${PROPERTIES_API}/${id}`);

        if (!response.ok) {

            throw new Error(
                "Failed to load property"
            );
        }

        const property =
            await response.json();


        document.getElementById("propertyId").value =
            property.id || "";


        document.getElementById("propertyName").value =
            property.property_name || "";


        document.getElementById("propertyType").value =
            property.property_type || "Housing";


        document.getElementById("listingType").value =
            property.listing_type || "Rent";


        document.getElementById("township").value =
            property.township || "";


        document.getElementById("city").value =
            property.city || "";


        document.getElementById("bedroom").value =
            property.bed_room || 0;


        document.getElementById("bathNumber").value =
            property.bath_number || 0;


        document.getElementById("area").value =
            property.property_area || 0;


        document.getElementById("floor").value =
            property.floor || 0;


        document.getElementById("price").value =
            property.price || 0;


        const image =
            property.image1 ||
            property.image ||
            "";


        if (image) {

            document.getElementById("imagePreview").src =
                image;

            document
                .getElementById("imagePreviewContainer")
                .classList.remove("d-none");

        } else {

            document
                .getElementById("imagePreviewContainer")
                .classList.add("d-none");
        }


        document.getElementById("propertyModalTitle").textContent =
            "Edit Property";


        propertyModal.show();

    } catch (error) {

        console.error(
            "Edit Property Error:",
            error
        );

        alert(
            "Failed to load property."
        );
    }
}


/* =========================
   DELETE PROPERTY
========================= */

async function deleteProperty(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this property?"
        );

    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${PROPERTIES_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete property"
            );
        }


        alert(
            "Property deleted successfully."
        );


        loadProperties();

        loadDashboard();

    } catch (error) {

        console.error(
            "Delete Property Error:",
            error
        );

        alert(
            "Failed to delete property."
        );
    }
}


/* =========================
   CONTACTS
========================= */

function getContacts() {

    try {

        const data =
            localStorage.getItem(
                CONTACT_STORAGE_KEY
            );

        if (!data) {
            return [];
        }

        const contacts =
            JSON.parse(data);

        return Array.isArray(contacts)
            ? contacts
            : [];

    } catch (error) {

        console.error(
            "Contact Storage Error:",
            error
        );

        return [];
    }
}


/* =========================
   LOAD CONTACTS
========================= */

function loadContacts() {

    const contacts =
        getContacts();

    contactCount.textContent =
        contacts.length;


    if (contacts.length === 0) {

        contactsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="text-center text-muted"
                >
                    No contact messages found.
                </td>
            </tr>
        `;

        return;
    }


    contactsTableBody.innerHTML = "";


    contacts.forEach(function (contact, index) {

        const row =
            document.createElement("tr");


        const date =
            contact.date ||
            contact.createdAt ||
            new Date().toLocaleString();


        row.innerHTML = `

            <td>
                ${escapeHTML(
                    contact.id ||
                    index + 1
                )}
            </td>

            <td>
                ${escapeHTML(
                    contact.name ||
                    ""
                )}
            </td>

            <td>
                ${escapeHTML(
                    contact.email ||
                    ""
                )}
            </td>

            <td>
                ${escapeHTML(
                    contact.subject ||
                    ""
                )}
            </td>

            <td
                style="
                    max-width:300px;
                    white-space:normal;
                    word-break:break-word;
                "
            >
                ${escapeHTML(
                    contact.message ||
                    ""
                )}
            </td>

            <td>
                ${escapeHTML(
                    date
                )}
            </td>

            <td>

                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    onclick="deleteContact(${index})"
                >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>

            </td>

        `;


        contactsTableBody.appendChild(row);

    });
}


/* =========================
   DELETE CONTACT
========================= */

function deleteContact(index) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this message?"
        );

    if (!confirmDelete) {
        return;
    }


    const contacts =
        getContacts();


    contacts.splice(
        index,
        1
    );


    localStorage.setItem(
        CONTACT_STORAGE_KEY,
        JSON.stringify(contacts)
    );


    loadContacts();

    loadDashboard();


    alert(
        "Contact message deleted successfully."
    );
}


/* =========================
   REFRESH CONTACTS
========================= */

refreshContactsButton.addEventListener(
    "click",
    function () {

        loadContacts();

        loadDashboard();

    }
);


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    function () {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );

        if (!confirmLogout) {
            return;
        }


        localStorage.removeItem(
            "admin"
        );


        window.location.href =
            "login.html";

    }
);


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {

        return "$0";
    }


    const number =
        Number(price);


    if (isNaN(number)) {

        return escapeHTML(
            String(price)
        );
    }


    return "$" +
        number.toLocaleString();
}


/* =========================
   HTML SECURITY
========================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   ATTRIBUTE SECURITY
========================= */

function escapeAttribute(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   INITIAL LOAD
========================= */

loadDashboard();