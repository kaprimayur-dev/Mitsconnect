/**
 * profile.js
 * Handles loading and saving the user profile form data.
 * Depends on: storage.js (must be loaded first)
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    if (!form) return; // Guard: only run on profile page

    const nameInput   = document.getElementById('profile-name');
    const emailInput  = document.getElementById('profile-email');
    const skillsInput = document.getElementById('profile-skills');
    const availSelect = document.getElementById('profile-availability');

    // --- Load saved profile data on page load ---
    loadProfile();

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

    function loadProfile() {
        const user = getCurrentUser();
        if (!user) return; // No saved data — leave fields empty

        if (user.name)         nameInput.value   = user.name;
        if (user.email)        emailInput.value  = user.email;
        if (user.skills)       skillsInput.value = user.skills;
        if (user.availability) availSelect.value  = user.availability;
    }

    // --- Save profile on form submit ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentUser = getCurrentUser() || {};
        
        const profileData = {
            ...currentUser, // preserve password and other unseen fields
            id:           currentUser.id || generateId(),
            name:         nameInput.value.trim(),
            email:        emailInput.value.trim(),
            skills:       skillsInput.value.trim(),
            availability: availSelect.value
        };

        // Persist as current user
        setCurrentUser(profileData);

        // Also upsert into the users list
        const users = getUsers();
        const existingIndex = users.findIndex(u => u.id === profileData.id);
        if (existingIndex !== -1) {
            users[existingIndex] = profileData;
        } else {
            users.push(profileData);
        }
        saveUsers(users);

        // Show success feedback and redirect to homepage
        if (typeof showToast === 'function') {
            showToast('Profile saved successfully! Redirecting...', 'success');
        } else {
            alert('Profile saved successfully!');
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
});
