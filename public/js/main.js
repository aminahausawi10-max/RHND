document.addEventListener("DOMContentLoaded", function() {
    // Navigation active state
    const navLinks = document.querySelectorAll(".nav-links li a");
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Language selector
    const langSelect = document.querySelector(".language-selector select");
    if(langSelect) {
        langSelect.addEventListener("change", function(e) {
            console.log("Language changed to: ", e.target.value);
        });
    }

    // Search functionality placeholder
    const searchBtn = document.querySelector(".search-box button");
    if(searchBtn) {
        searchBtn.addEventListener("click", function() {
            const query = document.querySelector(".search-box input").value;
            if(query) {
                alert("Searching for: " + query);
            }
        });
    }

    // Dynamic Auth State Handler
    setupAuthState();

    // Floating Action Button (FAB) & Quick Post News
    setupFloatingPortalButton();
});

// Logout handler
window.rhndLogout = function() {
    localStorage.removeItem("rhnd_user");
    sessionStorage.removeItem("rhnd_admin_pwd");
    window.location.reload();
};

function setupAuthState() {
    const rawUser = localStorage.getItem("rhnd_user");
    let user = null;
    if (rawUser) {
        try {
            user = JSON.parse(rawUser);
        } catch(e) {}
    }

    const authContainer = document.querySelector(".auth-buttons");
    if (authContainer) {
        if (user) {
            const isAdmin = (user.role === "admin" || (user.email && user.email.toLowerCase().includes("admin")));
            if (isAdmin) {
                authContainer.innerHTML = `
                    <a href="admin.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.88rem; background: var(--secondary-dark-green); border: 1px solid var(--primary-gold);">
                        <i class="fas fa-crown text-gold"></i> Admin Portal
                    </a>
                    <button onclick="rhndLogout()" class="btn btn-login" style="padding: 8px 12px; font-size: 0.85rem; border: none; background: transparent; cursor: pointer; color: #e53e3e;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                `;
            } else {
                authContainer.innerHTML = `
                    <a href="member-dashboard.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.88rem;">
                        <i class="fas fa-user-circle"></i> My Dashboard
                    </a>
                    <button onclick="rhndLogout()" class="btn btn-login" style="padding: 8px 12px; font-size: 0.85rem; border: none; background: transparent; cursor: pointer; color: #e53e3e;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                `;
            }
        } else {
            authContainer.innerHTML = `
                <a href="login.html" class="btn-login">Login</a>
                <a href="register.html" class="btn-register">Register</a>
            `;
        }
    }

    // Also add Admin Portal quick link into top bar if not already there
    const topBarRight = document.querySelector(".top-bar-right");
    if (topBarRight && !document.getElementById("top-admin-link")) {
        const adminLink = document.createElement("a");
        adminLink.id = "top-admin-link";
        adminLink.href = "admin.html";
        adminLink.style.color = "var(--primary-gold)";
        adminLink.style.fontWeight = "600";
        adminLink.innerHTML = '<i class="fas fa-shield-alt"></i> Admin Portal';
        
        const divider = document.createElement("span");
        divider.className = "divider";
        divider.textContent = "|";
        
        topBarRight.insertBefore(divider, topBarRight.firstChild);
        topBarRight.insertBefore(adminLink, topBarRight.firstChild);
    }
}

function setupFloatingPortalButton() {
    // Avoid creating duplicate FAB
    if (document.querySelector(".fab-container")) return;

    // Create FAB Container
    const fabContainer = document.createElement("div");
    fabContainer.className = "fab-container";
    fabContainer.innerHTML = `
        <div class="fab-main-btn" id="fabToggleBtn" title="Quick Portal & Admin Controls">
            <i class="fas fa-bolt" id="fabIcon"></i>
        </div>
        <div class="fab-menu" id="fabMenu">
            <a href="admin.html" class="fab-item">
                <i class="fas fa-shield-alt"></i> <span>Admin Portal</span>
            </a>
            <div class="fab-item" id="quickAddNewsBtn">
                <i class="fas fa-plus-circle"></i> <span>Add News Live</span>
            </div>
            <a href="member-dashboard.html" class="fab-item">
                <i class="fas fa-user-circle"></i> <span>Member Dashboard</span>
            </a>
        </div>
    `;
    document.body.appendChild(fabContainer);

    // Modal for Quick Add News
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "rhnd-modal-overlay";
    modalOverlay.id = "quickNewsModal";
    modalOverlay.innerHTML = `
        <div class="rhnd-modal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--primary-gold); padding-bottom: 10px;">
                <h3 style="margin: 0; color: var(--secondary-dark-green); font-size: 1.4rem;">
                    <i class="fas fa-bullhorn text-gold"></i> Quick Post News Update
                </h3>
                <button id="closeNewsModal" style="background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;">&times;</button>
            </div>
            <form id="quick-news-form">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #334155;">Headline / Title</label>
                    <input type="text" id="quick-post-title" required placeholder="Enter news headline..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #334155;">Content / Details</label>
                    <textarea id="quick-post-content" required rows="5" placeholder="Write announcement details..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; align-items: center;">
                    <span id="quick-news-status" style="font-weight: 600; display: none;"></span>
                    <button type="button" id="cancelNewsModal" class="btn btn-secondary" style="padding: 10px 20px;">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">
                        <i class="fas fa-paper-plane"></i> Publish Live
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    // Toggle FAB Menu
    const toggleBtn = document.getElementById("fabToggleBtn");
    const menu = document.getElementById("fabMenu");
    const fabIcon = document.getElementById("fabIcon");

    toggleBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        const isOpen = menu.classList.toggle("active");
        if (isOpen) {
            fabIcon.className = "fas fa-times";
        } else {
            fabIcon.className = "fas fa-bolt";
        }
    });

    document.addEventListener("click", function(e) {
        if (!fabContainer.contains(e.target)) {
            menu.classList.remove("active");
            fabIcon.className = "fas fa-bolt";
        }
    });

    // Quick Add News Modal open/close
    const quickAddNewsBtn = document.getElementById("quickAddNewsBtn");
    const closeBtn = document.getElementById("closeNewsModal");
    const cancelBtn = document.getElementById("cancelNewsModal");

    quickAddNewsBtn.addEventListener("click", function() {
        menu.classList.remove("active");
        fabIcon.className = "fas fa-bolt";
        modalOverlay.classList.add("active");
    });

    function closeModal() {
        modalOverlay.classList.remove("active");
        document.getElementById("quick-news-form").reset();
        const statusSpan = document.getElementById("quick-news-status");
        statusSpan.style.display = "none";
    }

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", function(e) {
        if (e.target === modalOverlay) closeModal();
    });

    // Submit Quick News
    const quickForm = document.getElementById("quick-news-form");
    quickForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const title = document.getElementById("quick-post-title").value;
        const content = document.getElementById("quick-post-content").value;
        const statusSpan = document.getElementById("quick-news-status");

        let adminPwd = sessionStorage.getItem("rhnd_admin_pwd") || "Admin@RHND2026";

        try {
            statusSpan.style.display = "inline";
            statusSpan.style.color = "#3b82f6";
            statusSpan.textContent = "Publishing...";

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Password": adminPwd
                },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                statusSpan.style.color = "var(--primary-green)";
                statusSpan.textContent = "Published successfully!";
                setTimeout(() => {
                    closeModal();
                    // If we're on the news page or admin page, refresh the list
                    if (typeof loadNews === "function") {
                        loadNews();
                    }
                    if (typeof fetchPosts === "function") {
                        fetchPosts();
                    }
                }, 1000);
            } else {
                const data = await res.json();
                statusSpan.style.color = "#e53e3e";
                statusSpan.textContent = data.error || "Failed to publish. Check admin credentials.";
            }
        } catch(err) {
            statusSpan.style.color = "#e53e3e";
            statusSpan.textContent = "Network error. Please try again.";
        }
    });
}
