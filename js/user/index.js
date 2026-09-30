document.addEventListener("DOMContentLoaded", () => {
  renderAuthSection();
});

function renderAuthSection() {
  const authSection = document.getElementById("authSection");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    // Fallback image if user avatar doesn't exist
    const userAvatar = currentUser.avatar || currentUser.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const userName = currentUser.name || "User";

    authSection.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center gap-2 p-0 border-0" 
           href="#" 
           role="button" 
           data-bs-toggle="dropdown" 
           aria-expanded="false">
          <img src="${userAvatar}" 
               alt="${userName}" 
               class="rounded-circle border" 
               style="width: 38px; height: 38px; object-fit: cover;">
        </a>

        <ul class="dropdown-menu dropdown-menu-end shadow">
          <li class="dropdown-header fw-bold">${userName}</li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="profile.html"><i class="fa-regular fa-id-card me-2"></i>Profile</a></li>
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-gear me-2"></i>Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item text-danger" onclick="logoutUser()">
              <i class="fa-solid fa-right-from-bracket me-2"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    `;
  } else {
    // Show login button if no user is found
    authSection.innerHTML = `
      <button type="button" class="login-btn">
        <a href="users/login.html"><i class="fa-regular fa-user"></i></a>
      </button>
    `;
  }
}

// Logout Handler
function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.reload();
}
