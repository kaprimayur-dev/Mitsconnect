/**
 * guard.js
 * Session guard for protected pages.
 * Redirects unauthenticated users to login.html with a toast message.
 * 
 * Include this script ONLY on pages that require a logged-in user.
 * Do NOT include on: index.html, profile.html, login.html
 * Depends on: storage.js (must be loaded first)
 */

(function () {
    // Run immediately — do not wait for DOMContentLoaded
    // so the redirect happens before the page renders
    if (!isLoggedIn()) {
        // Defer toast until after redirect page loads
        sessionStorage.setItem('mitsconnect_guard_message', 'Please log in first to access this feature');
        window.location.href = 'login.html';
    }
})();
