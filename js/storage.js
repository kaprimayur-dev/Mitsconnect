/**
 * storage.js
 * Centralized data manager for the application using LocalStorage.
 * Handles fetching and saving application state (Users, Teams, Current User).
 */

const STORAGE_KEYS = {
    USERS: 'mitsconnect_users',
    TEAMS: 'mitsconnect_teams',
    CURRENT_USER: 'mitsconnect_current_user'
};

/**
 * Safely parses JSON from LocalStorage.
 * @param {string} key - The LocalStorage key.
 * @param {any} defaultValue - The default value to return if parsing fails or key is missing.
 * @returns {any} The parsed data or default value.
 */
function safeGetItem(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error parsing LocalStorage key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Safely stringifies and saves data to LocalStorage.
 * @param {string} key - The LocalStorage key.
 * @param {any} value - The data to save.
 */
function safeSetItem(key, value) {
    try {
        const stringified = JSON.stringify(value);
        localStorage.setItem(key, stringified);
    } catch (error) {
        console.error(`Error saving to LocalStorage key "${key}":`, error);
    }
}

/**
 * Retrieves all users from LocalStorage.
 * @returns {Array} Array of user objects. Returns empty array if none exist.
 */
function getUsers() {
    return safeGetItem(STORAGE_KEYS.USERS, []);
}

/**
 * Saves the users array to LocalStorage.
 * @param {Array} users - Array of user objects to persist.
 */
function saveUsers(users) {
    if (!Array.isArray(users)) {
        console.error("saveUsers requires an array as an argument");
        return;
    }
    safeSetItem(STORAGE_KEYS.USERS, users);
}

/**
 * Retrieves all teams from LocalStorage.
 * @returns {Array} Array of team objects. Returns empty array if none exist.
 */
function getTeams() {
    return safeGetItem(STORAGE_KEYS.TEAMS, []);
}

/**
 * Saves the teams array to LocalStorage.
 * @param {Array} teams - Array of team objects to persist.
 */
function saveTeams(teams) {
    if (!Array.isArray(teams)) {
        console.error("saveTeams requires an array as an argument");
        return;
    }
    safeSetItem(STORAGE_KEYS.TEAMS, teams);
}

/**
 * Retrieves the currently logged-in user.
 * @returns {Object|null} The current user object, or null if no user is logged in.
 */
function getCurrentUser() {
    return safeGetItem(STORAGE_KEYS.CURRENT_USER, null);
}

/**
 * Sets the currently logged-in user.
 * @param {Object|null} user - The user object to set as active, or null to log out.
 */
function setCurrentUser(user) {
    safeSetItem(STORAGE_KEYS.CURRENT_USER, user);
}

/**
 * Generates a unique string ID (useful for new users or teams).
 * Uses a combination of base-36 timestamp and a random string.
 * @returns {string} A unique identifier.
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Checks whether a user is currently logged in.
 * A user is considered logged in if currentUser exists and has a name.
 * @returns {boolean} True if a user session exists.
 */
function isLoggedIn() {
    const user = getCurrentUser();
    return user !== null && typeof user.name === 'string' && user.name.length > 0;
}
