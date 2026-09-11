
document.addEventListener("DOMContentLoaded", () => {
    const dashboardView = document.getElementById("dashboard-view");
    const loginView = document.getElementById("login-view");
    const registerView = document.getElementById("register-view");
    
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const createPostForm = document.getElementById("create-post-form");
    
    const postsContainer = document.getElementById("posts-container");
    const userInfo = document.getElementById("user-info");
    
    // Simple state
    let isLoggedIn = false;
    
    // View switching
    function showView(view) {
        dashboardView.style.display = "none";
        loginView.style.display = "none";
        registerView.style.display = "none";
        
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
    
    // Navigation
    document.querySelectorAll(".nav-link-custom").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            // find closest anchor in case they clicked an icon inside
            const target = e.target.closest("a").getAttribute("data-target");
            showView(target);
        });
    });
    
    // Auth
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
                userInfo.innerHTML = `<span class="badge bg-success me-2"></span> Logged in as: <strong>${email}</strong>`;
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
    
    // Posts
    async function loadPosts() {
        try {
            const res = await fetch("/api/posts");
            const posts = await res.json();
            
            postsContainer.innerHTML = "";
            posts.forEach(post => {
                const div = document.createElement("div");
                div.className = "col-md-6 col-lg-4";
                div.innerHTML = `
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h3 class="card-title">${post.title}</h3>
                            <p class="text-muted">${post.content}</p>
                        </div>
                        <div class="card-footer text-muted">
                            <small>By: <strong>${post.author}</strong> on ${new Date(post.created_at).toLocaleDateString()}</small>
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

