document.addEventListener("DOMContentLoaded", function() {
    // Navigation active state
    const navLinks = document.querySelectorAll(".nav-links li a");
    navLinks.forEach(link => {
        link.addEventListener("click", function() {
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Dynamic Auth State Handler
    setupAuthState();

    // Multilingual Language Selector & Translation
    setupLanguageSelector();

    // Floating Action Button (FAB) & Quick Post News
    setupFloatingPortalButton();

    // Broadcast Alert Banner
    setupBroadcastBanner();
    
    // Require login for subpages while allowing public home page view
    checkPageAccess();
    syncGlobalSettings();

});

// Logout handler
window.rhndLogout = function() {
    localStorage.removeItem("rhnd_user");
    sessionStorage.removeItem("rhnd_admin_pwd");
    window.location.href = "index.html";
};

function setupAuthState() {
    // Keep the top bar clean with only official branding
    const authContainer = document.querySelector(".top-bar-right .auth-buttons") || document.querySelector(".auth-buttons");
    if (authContainer) {
        authContainer.innerHTML = "";
    }
}

function setupFloatingPortalButton() {
    const rawUser = localStorage.getItem("rhnd_user");
    const adminPwd = sessionStorage.getItem("rhnd_admin_pwd");
    let user = null;
    if (rawUser) { try { user = JSON.parse(rawUser); } catch(e) {} }
    const isAdmin = (user && (user.role === "admin" || (user.email && user.email.toLowerCase().includes("admin")))) || (adminPwd === "Admin@RHND2026");

    const existingFab = document.querySelector(".fab-container");
    if (existingFab) existingFab.remove();

    const fabContainer = document.createElement("div");
    fabContainer.className = "fab-container";
    
    const isDashboard = window.location.pathname.toLowerCase().includes("member-dashboard");

    let menuHTML = ``;
    if (isAdmin) {
        menuHTML = `
            <a href="admin.html" class="fab-item">
                <i class="fas fa-shield-alt"></i> <span>Admin Portal</span>
            </a>
            <div class="fab-item" id="quickAddNewsBtn">
                <i class="fas fa-plus-circle"></i> <span>Add News Live</span>
            </div>
            <a href="member-dashboard.html" class="fab-item">
                <i class="fas fa-user-circle"></i> <span>Member Dashboard</span>
            </a>
            <a href="support.html" class="fab-item">
                <i class="fas fa-life-ring"></i> <span>Help & Support</span>
            </a>
            <a href="index.html" class="fab-item">
                <i class="fas fa-globe"></i> <span>Public Website</span>
            </a>
            <div class="fab-item fab-logout" onclick="rhndLogout()">
                <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
            </div>
        `;
    } else if (user) {
        menuHTML = `
            <a href="${isDashboard ? "javascript:switchTab('dashboard')" : "member-dashboard.html#dashboard"}" class="fab-item" onclick="if(window.closeFabMenu) window.closeFabMenu()">
                <i class="fas fa-home"></i> <span>Dashboard Overview</span>
            </a>
            <a href="${isDashboard ? "javascript:switchTab('members')" : "member-dashboard.html#members"}" class="fab-item" onclick="if(window.closeFabMenu) window.closeFabMenu()">
                <i class="fas fa-users"></i> <span>Total Members</span>
            </a>
            <a href="${isDashboard ? "javascript:switchTab('profile')" : "member-dashboard.html#profile"}" class="fab-item" onclick="if(window.closeFabMenu) window.closeFabMenu()">
                <i class="fas fa-user-edit"></i> <span>My Profile</span>
            </a>
            <a href="${isDashboard ? "javascript:switchTab('services')" : "member-dashboard.html#services"}" class="fab-item" onclick="if(window.closeFabMenu) window.closeFabMenu()">
                <i class="fas fa-passport"></i> <span>Diaspora Services</span>
            </a>
            <a href="${isDashboard ? "javascript:switchTab('support')" : "support.html"}" class="fab-item" onclick="if(window.closeFabMenu) window.closeFabMenu()">
                <i class="fas fa-life-ring"></i> <span>Help & Support</span>
            </a>
            <a href="index.html" class="fab-item">
                <i class="fas fa-globe"></i> <span>Browse Public Website</span>
            </a>
            <div class="fab-item fab-logout" onclick="rhndLogout()">
                <i class="fas fa-sign-out-alt"></i> <span>Logout / Sign Out</span>
            </div>
        `;
    } else {
        menuHTML = `
            <a href="index.html" class="fab-item">
                <i class="fas fa-home"></i> <span>Home</span>
            </a>
            <a href="login.html" class="fab-item">
                <i class="fas fa-sign-in-alt"></i> <span>Login Portal</span>
            </a>
            <a href="register.html" class="fab-item">
                <i class="fas fa-user-plus"></i> <span>Register Account</span>
            </a>
            <a href="support.html" class="fab-item">
                <i class="fas fa-life-ring"></i> <span>Help & Support</span>
            </a>
        `;
    }

    fabContainer.innerHTML = `
        <div class="fab-main-btn" id="fabToggleBtn" title="Quick Portal Controls">
            <i class="fas fa-bolt" id="fabIcon"></i>
        </div>
        <div class="fab-menu" id="fabMenu">
            ${menuHTML}
        </div>
    `;
    document.body.appendChild(fabContainer);

    // Modal for Quick Add News (Only rendered if element exists)
    if (isAdmin && !document.getElementById("quickNewsModal")) {
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

        const quickAddBtn = document.getElementById("quickAddNewsBtn");
        const closeBtn = document.getElementById("closeNewsModal");
        const cancelBtn = document.getElementById("cancelNewsModal");

        if (quickAddBtn) {
            quickAddBtn.addEventListener("click", function() {
                const menu = document.getElementById("fabMenu");
                const fabIcon = document.getElementById("fabIcon");
                if (menu) menu.classList.remove("active");
                if (fabIcon) fabIcon.className = "fas fa-bolt";
                modalOverlay.classList.add("active");
            });
        }

        function closeModal() {
            modalOverlay.classList.remove("active");
            const form = document.getElementById("quick-news-form");
            if (form) form.reset();
            const statusSpan = document.getElementById("quick-news-status");
            if (statusSpan) statusSpan.style.display = "none";
        }

        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
        modalOverlay.addEventListener("click", function(e) {
            if (e.target === modalOverlay) closeModal();
        });

        const quickForm = document.getElementById("quick-news-form");
        if (quickForm) {
            quickForm.addEventListener("submit", async function(e) {
                e.preventDefault();
                const title = document.getElementById("quick-post-title").value.trim();
                const content = document.getElementById("quick-post-content").value.trim();
                const statusSpan = document.getElementById("quick-news-status");

                if (!title || !content) return;

                const newPost = {
                    id: Date.now(),
                    title: title,
                    content: content,
                    created_at: new Date().toISOString()
                };

                let localPosts = [];
                try {
                    const raw = localStorage.getItem("rhnd_news_db");
                    if (raw) localPosts = JSON.parse(raw);
                } catch(e) {}

                if (!Array.isArray(localPosts) || localPosts.length === 0) {
                    localPosts = [
                        {
                            id: 101,
                            title: "Federal Government Launches Special Diaspora Housing Scheme",
                            content: "The Federal Ministry of Housing and Urban Development has unveiled an exclusive mortgage scheme tailored for Nigerians living abroad. The initiative aims to provide secure property ownership and transparent investment opportunities.\n\nUnder this scheme, registered diaspora citizens can apply for federal home loans with flexible repayment terms, verified land titles, and direct consular assistance. Key partner banks and mortgage institutions have integrated automated diaspora verification protocols to prevent fraud and ensure seamless allocation.\n\nInterested applicants can initiate their requests directly through the Diaspora Services section of the RHND portal.",
                            created_at: "2026-03-01T10:00:00Z"
                        },
                        {
                            id: 102,
                            title: "NiDCOM Announces Virtual Diaspora Townhall Dialogue",
                            content: "The Nigerians in Diaspora Commission (NiDCOM) invites all citizens overseas to participate in the upcoming quarterly virtual townhall meeting with diplomatic representatives and policy makers.\n\nThe interactive session will focus on consular welfare, passport renewal acceleration, voting rights advocacy, and foreign investment security. Registration is free and open to all registered community members.",
                            created_at: "2026-03-05T14:30:00Z"
                        },
                        {
                            id: 103,
                            title: "Nigeria Immigration Service Expands Diaspora Passport Centres",
                            content: "New passport enrollment and renewal processing centers have been established across strategic international locations to reduce processing wait times for diaspora citizens.\n\nCitizens living in North America, Europe, the Middle East, and Asia-Pacific regions can now access fast-track biometric capture appointments at authorized consular processing desks.",
                            created_at: "2026-03-09T09:15:00Z"
                        }
                    ];
                }

                localPosts.unshift(newPost);
                try { localStorage.setItem("rhnd_news_db", JSON.stringify(localPosts)); } catch(e) {}

                let pwd = sessionStorage.getItem("rhnd_admin_pwd") || "Admin@RHND2026";

                try {
                    fetch("/api/posts", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Admin-Password": pwd
                        },
                        body: JSON.stringify({ title, content })
                    }).catch(err => console.log("Background API sync:", err));
                } catch(err) {}

                statusSpan.style.display = "inline";
                statusSpan.style.color = "var(--primary-green)";
                statusSpan.textContent = "Published successfully!";
                setTimeout(() => {
                    closeModal();
                    if (typeof loadNews === "function") loadNews();
                    if (typeof fetchPosts === "function") fetchPosts();
                }, 800);
            });
        }
    }

    // Toggle FAB Menu
    const toggleBtn = document.getElementById("fabToggleBtn");
    const menu = document.getElementById("fabMenu");
    const fabIcon = document.getElementById("fabIcon");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            const isOpen = menu.classList.toggle("active");
            if (isOpen) {
                fabIcon.className = "fas fa-times";
            } else {
                fabIcon.className = "fas fa-bolt";
            }
        });
    }

    document.addEventListener("click", function(e) {
        if (!fabContainer.contains(e.target)) {
            if (menu) menu.classList.remove("active");
            if (fabIcon) fabIcon.className = "fas fa-bolt";
        }
    });
}


function checkPageAccess() {
    const rawUser = localStorage.getItem("rhnd_user");
    const adminPwd = sessionStorage.getItem("rhnd_admin_pwd");
    const isLoggedIn = !!rawUser || adminPwd === "Admin@RHND2026";

    const path = window.location.pathname.toLowerCase();
    
    // Protected pages list
    const protectedPages = [
        "news.html", "support.html"
    ];

    const isVisitingProtected = protectedPages.some(page => path.endsWith(page));

    if (isVisitingProtected && !isLoggedIn) {
        alert("Access Restricted: Please sign in or register to view full news, government updates, and diaspora services.");
        window.location.href = "login.html";
        return;
    }

    // Intercept "Read More" or navigation links for logged out users on homepage
    if (!isLoggedIn) {
        document.querySelectorAll("a.read-more, .cards-grid a").forEach(link => {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                alert("Please sign in or register to read full news articles and access government services.");
                window.location.href = "login.html";
            });
        });
    }
}

function setupBroadcastBanner() {
    const raw = localStorage.getItem('rhnd_broadcast_alert');
    if (!raw) return;
    try {
        const alertData = JSON.parse(raw);
        if (!alertData || !alertData.active || !alertData.title) return;

        const dismissed = sessionStorage.getItem('rhnd_broadcast_dismissed');
        if (dismissed === alertData.title) return;

        const existing = document.getElementById('rhnd-broadcast-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'rhnd-broadcast-banner';
        banner.style.cssText = 'background: linear-gradient(90deg, #78350f 0%, #b45309 50%, #d97706 100%); color: white; padding: 12px 20px; font-size: 0.92rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); position: relative; z-index: 1000; border-bottom: 2px solid var(--primary-gold);';
        
        banner.innerHTML = `
            <div class="container" style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <span style="background: rgba(0,0,0,0.3); color: var(--primary-gold); font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap; border: 1px solid rgba(212,175,55,0.4);">
                        <i class="fas fa-bullhorn"></i> ${alertData.type || 'Official Alert'}
                    </span>
                    <strong style="color: white;">${alertData.title}:</strong>
                    <span style="color: rgba(255,255,255,0.92);">${alertData.message}</span>
                </div>
                <button type="button" onclick="dismissBroadcast('${alertData.title.replace(/'/g, "\\'")}')" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem; opacity: 0.85; padding: 4px;" title="Dismiss alert">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const topBar = document.querySelector('.top-bar') || document.body.firstChild;
        if (topBar && topBar.parentNode) {
            topBar.parentNode.insertBefore(banner, topBar);
        } else {
            document.body.prepend(banner);
        }
    } catch(e) {}
}

window.dismissBroadcast = function(title) {
    sessionStorage.setItem('rhnd_broadcast_dismissed', title);
    const banner = document.getElementById('rhnd-broadcast-banner');
    if (banner) banner.remove();
};

// --- Language Translation & Multilingual Support ---
function setupLanguageSelector() {
    const langSelect = document.querySelector(".language-selector select");
    const savedLang = localStorage.getItem("rhnd_language_code") || "en";

    // Set document direction if Arabic
    if (savedLang === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
    } else {
        document.documentElement.setAttribute("dir", "ltr");
    }

    if (langSelect) {
        // Sync select value
        for (let i = 0; i < langSelect.options.length; i++) {
            const opt = langSelect.options[i];
            const optVal = (opt.value || opt.text || "").toLowerCase();
            if (
                (savedLang === "ha" && (optVal.includes("ha") || optVal.includes("hausa"))) ||
                (savedLang === "ar" && (optVal.includes("ar") || optVal.includes("عرب"))) ||
                (savedLang === "en" && (optVal.includes("en") || optVal.includes("english")))
            ) {
                langSelect.selectedIndex = i;
                break;
            }
        }

        langSelect.addEventListener("change", function(e) {
            const val = (e.target.value || "").toLowerCase();
            const text = (e.target.options[e.target.selectedIndex] ? e.target.options[e.target.selectedIndex].text : "").toLowerCase();
            let code = "en";
            if (val === "ha" || val.includes("ha") || text.includes("hausa")) {
                code = "ha";
            } else if (val === "ar" || val.includes("ar") || text.includes("عرب") || text.includes("arabic")) {
                code = "ar";
            }

            changeLanguage(code);
        });
    }

    initGoogleTranslate(savedLang);
}

function changeLanguage(code) {
    localStorage.setItem("rhnd_language_code", code);
    
    // Cookie formatting for Google Translate element
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; path=/;`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${hostname};`;
    if (hostname.includes(".")) {
        const rootDomain = "." + hostname.split(".").slice(-2).join(".");
        document.cookie = `googtrans=/en/${code}; path=/; domain=${rootDomain};`;
    }

    if (code === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
    } else {
        document.documentElement.setAttribute("dir", "ltr");
    }

    // Check if Google Translate Combo is loaded
    const gtCombo = document.querySelector(".goog-te-combo");
    if (gtCombo) {
        gtCombo.value = code;
        gtCombo.dispatchEvent(new Event("change"));
    } else {
        window.location.reload();
    }
}

function initGoogleTranslate(targetLang) {
    if (!document.getElementById("google_translate_element")) {
        const gtDiv = document.createElement("div");
        gtDiv.id = "google_translate_element";
        gtDiv.style.display = "none";
        document.body.appendChild(gtDiv);
    }

    window.googleTranslateElementInit = function() {
        try {
            new google.translate.TranslateElement({
                pageLanguage: "en",
                includedLanguages: "en,ha,ar",
                autoDisplay: false
            }, "google_translate_element");

            if (targetLang && targetLang !== "en") {
                setTimeout(() => {
                    const combo = document.querySelector(".goog-te-combo");
                    if (combo && combo.value !== targetLang) {
                        combo.value = targetLang;
                        combo.dispatchEvent(new Event("change"));
                    }
                }, 400);
            }
        } catch(e) {}
    };

    if (!document.getElementById("google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.type = "text/javascript";
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
    }
}




// Global System Settings & Numbers Sync Handler
async function syncGlobalSettings() {
    // 1. First apply any cached local values immediately
    const cachedMembers = localStorage.getItem('rhnd_custom_stat_members');
    if (cachedMembers) {
        document.querySelectorAll('#home-total-members-counter, #section-total-members-count, #stat-members-val, #membership-total-count, #dash-total-members-count, #dash-total-members-badge, .stat-members-count').forEach(el => {
            el.textContent = cachedMembers;
        });
    }
    const cachedNews = localStorage.getItem('rhnd_custom_stat_news');
    if (cachedNews) {
        document.querySelectorAll('#stat-news-val, .stat-news-count').forEach(el => { el.textContent = cachedNews; });
    }
    const cachedTickets = localStorage.getItem('rhnd_custom_stat_requests');
    if (cachedTickets) {
        document.querySelectorAll('#stat-tickets-val, .stat-requests-count').forEach(el => { el.textContent = cachedTickets; });
    }
    const cachedMedia = localStorage.getItem('rhnd_custom_stat_media');
    if (cachedMedia) {
        document.querySelectorAll('#stat-media-val, .stat-media-count').forEach(el => { el.textContent = cachedMedia; });
    }

    // 2. Fetch fresh live settings from the backend database
    try {
        const res = await fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
            const settings = await res.json();
            if (settings && typeof settings === 'object' && !settings.error) {
                if (settings.stat_members !== undefined && settings.stat_members !== '') {
                    localStorage.setItem('rhnd_custom_stat_members', settings.stat_members);
                    document.querySelectorAll('#home-total-members-counter, #section-total-members-count, #stat-members-val, #membership-total-count, #dash-total-members-count, #dash-total-members-badge, .stat-members-count').forEach(el => {
                        el.textContent = settings.stat_members;
                    });
                }
                if (settings.stat_news !== undefined && settings.stat_news !== '') {
                    localStorage.setItem('rhnd_custom_stat_news', settings.stat_news);
                    document.querySelectorAll('#stat-news-val, .stat-news-count').forEach(el => {
                        el.textContent = settings.stat_news;
                    });
                }
                if (settings.stat_requests !== undefined && settings.stat_requests !== '') {
                    localStorage.setItem('rhnd_custom_stat_requests', settings.stat_requests);
                    document.querySelectorAll('#stat-tickets-val, .stat-requests-count').forEach(el => {
                        el.textContent = settings.stat_requests;
                    });
                }
                if (settings.stat_media !== undefined && settings.stat_media !== '') {
                    localStorage.setItem('rhnd_custom_stat_media', settings.stat_media);
                    document.querySelectorAll('#stat-media-val, .stat-media-count').forEach(el => {
                        el.textContent = settings.stat_media;
                    });
                }
                if (settings.founder_phone !== undefined && settings.founder_phone !== '') {
                    localStorage.setItem('rhnd_founder_phone', settings.founder_phone);
                }
            }
        }
    } catch(e) {}
});

                const newsCountEls = document.querySelectorAll('#stat-news-val, .stat-news-count');
                newsCountEls.forEach(el => {
                    if (settings.stat_news) el.textContent = settings.stat_news;
                });

                const reqCountEls = document.querySelectorAll('#stat-tickets-val, .stat-requests-count');
                reqCountEls.forEach(el => {
                    if (settings.stat_requests) el.textContent = settings.stat_requests;
                });

                const mediaCountEls = document.querySelectorAll('#stat-media-val, .stat-media-count');
                mediaCountEls.forEach(el => {
                    if (settings.stat_media) el.textContent = settings.stat_media;
                });
            }
        }
    } catch(e) {}
}
