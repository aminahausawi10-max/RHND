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
            // In a real app, this would trigger a language change or redirect
        });
    }

    // Search functionality placeholder
    const searchBtn = document.querySelector(".search-box button");
    if(searchBtn) {
        searchBtn.addEventListener("click", function() {
            const query = document.querySelector(".search-box input").value;
            if(query) {
                console.log("Searching for: " + query);
                alert("Search functionality will be integrated in backend phase.");
            }
        });
    }
});

