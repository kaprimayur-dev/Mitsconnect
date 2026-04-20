/**
 * home.js
 * Dynamically loads the latest teams from LocalStorage
 * and renders them on the homepage.
 * Depends on: storage.js, main.js (for showToast)
 */

document.addEventListener('DOMContentLoaded', () => {
    const homeTeamsList = document.getElementById('home-teams-list');
    if (!homeTeamsList) return; // Guard: only run on homepage

    renderHomeTeams();

    function renderHomeTeams() {
        const teams = getTeams();
        homeTeamsList.innerHTML = '';

        // No teams exist
        if (teams.length === 0) {
            homeTeamsList.innerHTML = `
                <div class="team-card" style="text-align:center; min-width:100%;">
                    <h3>No teams available yet</h3>
                    <p>Be the first to create a team!</p>
                    <button class="home-create-btn">Create Team</button>
                </div>
            `;
            const createBtn = homeTeamsList.querySelector('.home-create-btn');
            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    window.location.href = 'teams.html';
                });
            }
            return;
        }

        // Get latest 4 teams (most recent first)
        const latestTeams = teams.slice(-4).reverse();

        latestTeams.forEach(team => {
            // Build skill tags from lookingFor
            const skillsText = team.lookingFor || 'General';

            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <h3>${team.name}</h3>
                <p><strong>Looking for:</strong> ${skillsText}</p>
                <button class="home-join-btn" data-team-id="${team.id}">Join Team</button>
            `;
            homeTeamsList.appendChild(card);
        });

        // Attach join handlers
        homeTeamsList.querySelectorAll('.home-join-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleHomeJoin(parseInt(btn.dataset.teamId, 10) || btn.dataset.teamId);
            });
        });
    }

    function handleHomeJoin(teamId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showToast('Please log in to join a team.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 800);
            return;
        }

        const teams = getTeams();
        const team = teams.find(t => t.id === teamId);

        if (!team) {
            showToast('Team not found.', 'error');
            return;
        }

        // Prevent duplicate joining
        if (team.members && team.members.some(m => m.id === currentUser.id)) {
            showToast('You are already a member of this team.', 'info');
            return;
        }

        // Prevent joining if team is full
        const maxMembers = team.maxMembers || 4;
        if (team.members && team.members.length >= maxMembers) {
            showToast(`"${team.name}" is full.`, 'error');
            return;
        }

        // Add user to team
        if (!team.members) team.members = [];
        team.members.push({ id: currentUser.id, name: currentUser.name });
        saveTeams(teams);

        showToast(`You have joined "${team.name}"!`, 'success');
        renderHomeTeams(); // Re-render cards
    }
});
