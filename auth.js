/**
 * auth.js
 * Handles login and registration form logic.
 * Depends on: storage.js, main.js (for showToast)
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (!loginForm || !registerForm) return; // Guard: only run on login page

    // --- Show guard redirect message if present ---
    const guardMsg = sessionStorage.getItem('mitsconnect_guard_message');
    if (guardMsg) {
        sessionStorage.removeItem('mitsconnect_guard_message');
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast(guardMsg, 'error');
            }
        }, 300);
    }

    // --- Toggle between login and register forms ---
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin    = document.getElementById('switch-to-login');

    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display    = 'none';
        registerForm.style.display = 'block';
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display    = 'block';
    });

    // --- Registration ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name     = document.getElementById('register-name').value.trim();
        const email    = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        // Check if email is already registered (case-insensitive)
        const users = getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast('An account with this email already exists.', 'error');
            return;
        }

        const newUser = {
            id:           generateId(),
            name:         name,
            email:        email,
            password:     password, // Note: plain text for demo only
            skills:       '',
            availability: ''
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);

        showToast('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    });

    // --- Login ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const users = getUsers();
        const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!user) {
            showToast('Invalid email or password.', 'error');
            return;
        }

        setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
});
