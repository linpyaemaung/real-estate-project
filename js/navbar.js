const authArea = document.getElementById("authArea");

function getPath(path) {
    const isPagesFolder = window.location.pathname.includes("/pages");
    if (isPagesFolder) {
        return path;
    }
    return "pages/" + path;
}

function resolveImagePath(imageSrc) {
    if (!imageSrc) {
        return "https://via.placeholder.com/40";
    }
    // If it's already an external URL or absolute path, return as is
    if (imageSrc.startsWith("http") || imageSrc.startsWith("data:")) {
        return imageSrc;
    }
    // Handle relative local image paths based on current location
    return getPath(imageSrc);
}

function loadUserProfile() {
    if (!authArea) {
        return;
    }

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        authArea.innerHTML = `
            <button type="button" class="login-btn">
                <a href="${getPath("users/login.html")}">
                    <i class="fa-regular fa-user"></i>
                    Login
                </a>
            </button>
        `;
        return;
    }

    try {
        const user = JSON.parse(currentUser);

        // Fetch image property and process relative paths
        const rawImage = user.image || user.profile_image;
        const profileImage = resolveImagePath(rawImage);

        const currentPath = window.location.pathname;
        const hideCreatePropertyBtn = 
            currentPath.includes("add-property.html") || 
            currentPath.includes("profile.html") ||
            currentPath.includes("property.html") ||
            currentPath.includes("profile-edit.html");

        const createPropertyBtn = hideCreatePropertyBtn
            ? ""
            : `<a href="${getPath("users/add-property.html")}" class="btn btn-warning" style="margin-right:20px;">
                Create Property
               </a>`;

        authArea.innerHTML = `
            ${createPropertyBtn}
            <div class="dropdown">
                <a href="#"
                   class="d-flex align-items-center text-decoration-none"
                   data-bs-toggle="dropdown">
                    <img src="${profileImage}"
                         alt="Profile"
                         width="42"
                         height="42"
                         class="rounded-circle"
                         style="object-fit: cover; cursor: pointer;"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/40';">
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a class="dropdown-item" href="${getPath("users/profile.html")}">
                            <i class="fa-regular fa-user me-2"></i>
                            Profile
                        </a>
                    </li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li>
                        <button class="dropdown-item text-danger" onclick="logout()">
                            <i class="fa-solid fa-right-from-bracket me-2"></i>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        `;

    } catch (error) {
        console.error("Error loading user profile:", error);
        localStorage.removeItem("currentUser");
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    const isPagesFolder = window.location.pathname.includes("/pages");
    window.location.href = isPagesFolder ? "../index.html" : "index.html";
}

function backbtn() {
    const user = localStorage.getItem("currentUser");
    const isPagesFolder = window.location.pathname.includes("/pages");
    
    if (user) {
        window.location.href = isPagesFolder ? "../index.html" : "index.html"; 
    } else {
        window.location.href = getPath("users/login.html");
    }
}

loadUserProfile();