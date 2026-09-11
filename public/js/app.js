
document.addEventListener("DOMContentLoaded", () => {
    const dashboardView = document.getElementById("dashboard-view");
    const loginView = document.getElementById("login-view");
    const registerView = document.getElementById("register-view");
    
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const createPostForm = document.getElementById("create-post-form");
    const logoutBtn = document.getElementById("logout-btn");
    
    const postsContainer = document.getElementById("posts-container");
    const emailDisplay = document.getElementById("user-email-display");
    const avatarDisplay = document.getElementById("user-avatar");
    
    let isLoggedIn = false;
    
    function showView(view) {
        dashboardView.style.display = "none";
        loginView.style.display = "none";
        registerView.style.display = "none";
        
        // Handle body background mode & sidebar visibility
        if (view === "login" || view === "register") {
            document.body.classList.remove("dashboard-mode");
            document.body.classList.add("auth-mode");
        } else {
            document.body.classList.remove("auth-mode");
            document.body.classList.add("dashboard-mode");
        }
        
        if (view === "dashboard") {
            if (!isLoggedIn) {
                showView("login");
                return;
            }
            dashboardView.style.display = "block";
            loadPosts();
        } else if (view === "login") {
            loginView.style.display = "block";
        } else if (view === "register") {
            registerView.style.display = "block";
        }
    }
    
    document.body.addEventListener("click", (e) => {
        const link = e.target.closest(".nav-link-custom");
        if (link) {
            e.preventDefault();
            showView(link.getAttribute("data-target"));
        }
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            isLoggedIn = false;
            showView("login");
        });
    }
    
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.status === "success") {
                isLoggedIn = true;
                emailDisplay.textContent = email;
                avatarDisplay.textContent = email.charAt(0).toUpperCase();
                showView("dashboard");
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            console.error(err);
        }
    });
    
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (data.status === "success") {
                alert("Registered successfully! Please log in.");
                showView("login");
            } else {
                alert(data.error || "Registration failed");
            }
        } catch (err) {
            console.error(err);
        }
    });
    
    async function loadPosts() {
        try {
            const res = await fetch("/api/posts");
            const posts = await res.json();
            
            postsContainer.innerHTML = "";
            posts.forEach(post => {
                const div = document.createElement("div");
                div.className = "col-md-6 col-lg-4 mb-4";
                div.innerHTML = `
                    <div class="card h-100 post-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="avatar avatar-md rounded-circle bg-primary text-white shadow-sm me-3">${post.author.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div class="fw-bold fs-3 text-dark">${post.author}</div>
                                    <div class="text-muted small">${new Date(post.created_at).toLocaleDateString()} at ${new Date(post.created_at).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</div>
                                </div>
                            </div>
                            <h3 class="card-title fs-2 fw-bold mb-2">${post.title}</h3>
                            <p class="text-muted fs-3" style="line-height: 1.6;">${post.content}</p>
                        </div>
                    </div>
                `;
                postsContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
        }
    }
    
    createPostForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("post-title").value;
        const content = document.getElementById("post-content").value;
        
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            });
            const data = await res.json();
            if (data.status === "success") {
                createPostForm.reset();
                loadPosts();
            } else {
                alert(data.error || "Failed to create post");
            }
        } catch (err) {
            console.error(err);
        }
    });
    
    // Init
    showView("login");
});

