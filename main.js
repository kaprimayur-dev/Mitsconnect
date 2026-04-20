document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navsection');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    // 2. Scroll Reveal Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Toast Notification System (exposed globally for use by other scripts)
    window.showToast = function showToast(message, type = 'info') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-message">${message}</span>`;
        
        toastContainer.appendChild(toast);

        // Trigger reflow to ensure animation plays
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // 4. Helper: show toast then navigate after 800ms delay
    function toastAndNavigate(message, type, url) {
        showToast(message, type);
        setTimeout(() => {
            window.location.href = url;
        }, 800);
    }

    // 5. Update Navbar Login State
    const loginBtn = document.querySelector('.button button');
    const buttonContainer = document.querySelector('.button');
    if (loginBtn && buttonContainer && typeof getCurrentUser === 'function') {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.name) {
            // Show user name on the existing button
            loginBtn.textContent = currentUser.name;
            loginBtn.classList.add('user-name-btn');
            loginBtn.removeAttribute('onclick'); // Prevent accidental redirect

            // Create a dedicated Logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Logout';
            logoutBtn.className = 'logout-btn';
            buttonContainer.appendChild(logoutBtn);

            logoutBtn.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                setCurrentUser(null);
                showToast('You have been logged out', 'info');
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            });
        }
    }

    // 6. Helper: navigate with login check
    function guardedNavigate(message, type, url) {
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            showToast('Please log in first to access this feature', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 800);
            return;
        }
        toastAndNavigate(message, type, url);
    }

    // 7. Interactive Buttons with navigation
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        // Skip buttons that have their own handlers (forms, tabs, etc.)
        if (button.type === 'submit' || button.classList.contains('tab-btn') ||
            button.classList.contains('join-team-btn') || button.classList.contains('home-join-btn') ||
            button.classList.contains('home-create-btn') || button.classList.contains('logout-btn') ||
            button.hasAttribute('onclick')) {
            return;
        }

        button.addEventListener('click', (e) => {
            const btnText = button.textContent.toLowerCase().trim();
            if (btnText === 'login') {
                window.location.href = 'login.html'; // instant redirect for login button
            } else if (btnText.includes('create team')) {
                guardedNavigate('Opening team creation wizard...', 'success', 'teams.html');
            } else if (btnText.includes('join')) {
                guardedNavigate('Exploring available teams...', 'success', 'teams.html');
            } else if (btnText.includes('view details') || btnText.includes('hackathon')) {
                guardedNavigate('Loading hackathon details...', 'info', 'hackathons.html');
            }
        });
    });

    // Also apply to action links and dropdown menu items
    const actionLinks = document.querySelectorAll('.cta-primary, .cta-secondary, .profilebtn, .dropdown-content a');
    actionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkText = link.textContent.toLowerCase().trim();
            if (linkText.includes('profile')) {
                guardedNavigate('Navigating to your profile...', 'info', 'profile.html');
            } else if (linkText.includes('create team')) {
                guardedNavigate('Opening team creation wizard...', 'success', 'teams.html');
            } else if (linkText.includes('join')) {
                guardedNavigate('Exploring available teams...', 'success', 'teams.html');
            } else {
                // Fallback for other links in the dropdown
                window.location.href = link.getAttribute('href');
            }
        });
    });
});
