/**
 * teams.js
 * Handles team creation, browsing, and joining.
 * Depends on: storage.js, main.js (for showToast)
 */

document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('create-team-form');
    const teamsList  = document.getElementById('teams-list');

    if (!createForm || !teamsList) return; // Guard: only run on teams page

    // --- Tab Switching ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels  = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Deactivate all tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            // Activate selected tab
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Refresh the browse list when switching to it
            if (targetTab === 'browse-tab') {
                renderTeams();
            }
        });
    });

    // --- Auto-switch to Browse Tab if requested via URL ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'browse') {
        const browseBtn = document.querySelector('.tab-btn[data-tab="browse-tab"]');
        if (browseBtn) browseBtn.click();
    }

    // --- Search & Filter Controls ---
    const searchInput  = document.getElementById('team-search');
    const skillFilter  = document.getElementById('team-skill-filter');

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => renderTeams(), 200);
        });
    }

    if (skillFilter) {
        skillFilter.addEventListener('change', () => renderTeams());
    }

    // --- Create Team ---
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentUser = getCurrentUser();
        if (!currentUser) {
            showToast('Please log in before creating a team.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 800);
            return;
        }

        const teamName    = document.getElementById('team-name').value.trim();
        const description = document.getElementById('team-description').value.trim();
        const lookingFor  = document.getElementById('team-looking-for').value.trim();
        const maxMembers  = parseInt(document.getElementById('team-max-members').value, 10);
        const hackathon   = document.getElementById('team-hackathon').value;

        // Validation
        if (!teamName || !description || !lookingFor) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 10) {
            showToast('Max members must be between 2 and 10.', 'error');
            return;
        }

        // Build team object with Date.now() as unique ID
        const newTeam = {
            id:          Date.now(),
            name:        teamName,
            description: description,
            lookingFor:  lookingFor,
            maxMembers:  maxMembers,
            hackathon:   hackathon,
            leaderId:    currentUser.id,
            leaderName:  currentUser.name,
            members:     [{ id: currentUser.id, name: currentUser.name }],
            createdAt:   new Date().toISOString()
        };

        const teams = getTeams();
        teams.push(newTeam);
        saveTeams(teams);

        showToast(`Team "${teamName}" created successfully! You are the team leader.`, 'success');
        createForm.reset();
        document.getElementById('team-max-members').value = 4; // Reset default
    });

    // --- Render Available Teams ---
    function renderTeams() {
        // Show loading spinner
        teamsList.innerHTML = `
            <div class="state-container state-fade-in">
                <div class="spinner"></div>
                <p>Loading teams...</p>
            </div>
        `;

        // Simulate async load with small delay for UX
        setTimeout(() => {
            try {
                const allTeams = getTeams();

                // Read current filter values
                const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
                const skillValue  = skillFilter ? skillFilter.value.toLowerCase() : '';

                // Apply filters
                const teams = allTeams.filter(team => {
                    const name   = (team.name || '').toLowerCase();
                    const skills = (team.lookingFor || '').toLowerCase();

                    const matchesSearch = !searchQuery ||
                        name.includes(searchQuery) ||
                        skills.includes(searchQuery);

                    const matchesSkill = !skillValue ||
                        skills.includes(skillValue);

                    return matchesSearch && matchesSkill;
                });

                teamsList.innerHTML = '';

                // Empty state: no teams exist at all
                if (allTeams.length === 0) {
                    teamsList.innerHTML = `
                        <div class="state-container state-fade-in">
                            <span class="state-icon">📭</span>
                            <h3>No teams found</h3>
                            <p>Be the first to create a team and start collaborating!</p>
                        </div>
                    `;
                    return;
                }

                // Empty state: no teams match filters
                if (teams.length === 0) {
                    teamsList.innerHTML = `
                        <div class="state-container state-fade-in">
                            <span class="state-icon">🔍</span>
                            <h3>No teams found</h3>
                            <p>Try adjusting your search or filter criteria.</p>
                        </div>
                    `;
                    return;
                }

                const currentUser = getCurrentUser();

                teams.forEach(team => {
            // Build skill tags
            const skills = team.lookingFor
                ? team.lookingFor.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')
                : '';

            // Member count
            const memberCount    = team.members ? team.members.length : 1;
            const maxMembers     = team.maxMembers || 4;
            const isFull         = memberCount >= maxMembers;
            const remainingSlots = Math.max(0, maxMembers - memberCount);

            // Check if current user is already in the team
            const isAlreadyMember = currentUser && team.members &&
                team.members.some(m => m.id === currentUser.id);

            // Determine button state
            let joinBtnHTML = '';
            if (isAlreadyMember) {
                joinBtnHTML = `<button class="join-team-btn joined" disabled>✓ Joined</button>`;
            } else if (isFull) {
                joinBtnHTML = `<button class="join-team-btn full" disabled>Team Full</button>`;
            } else {
                joinBtnHTML = `<button class="join-team-btn" data-team-id="${team.id}">Join Team</button>`;
            }

            // Build members bullet list
            let membersHTML = '';
            if (team.members && team.members.length > 0) {
                const memberItems = team.members.map(m => {
                    const isLeader = m.id === team.leaderId;
                    return `<li>${isLeader ? '👑 ' : ''}${m.name}${isLeader ? ' <span class="leader-badge">Leader</span>' : ''}</li>`;
                }).join('');
                membersHTML = `
                    <div class="team-members">
                        <h4>Members</h4>
                        <ul class="member-list">${memberItems}</ul>
                        <p class="slots-remaining">${remainingSlots > 0 ? remainingSlots + ' slot' + (remainingSlots > 1 ? 's' : '') + ' remaining' : 'No slots remaining'}</p>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = 'team-listing-card state-fade-in';
            card.innerHTML = `
                <h3>${team.name}</h3>
                <p class="team-meta">
                    <span class="team-leader">👑 Led by ${team.leaderName || team.creatorName || 'Unknown'}</span>
                    ${team.hackathon ? `<span class="team-hackathon">🎯 ${team.hackathon}</span>` : ''}
                </p>
                ${team.description ? `<p class="team-desc">${team.description}</p>` : ''}
                ${skills ? `<div class="team-skills">${skills}</div>` : ''}
                ${membersHTML}
                <div class="team-footer">
                    <span class="member-count">👥 ${memberCount} / ${maxMembers} members</span>
                    ${joinBtnHTML}
                </div>
            `;
            teamsList.appendChild(card);
        });

                // Attach join handlers to active buttons
                document.querySelectorAll('.join-team-btn:not([disabled])').forEach(btn => {
                    btn.addEventListener('click', () => {
                        handleJoinTeam(parseInt(btn.dataset.teamId, 10));
                    });
                });

            } catch (error) {
                // Error state
                console.error('Error loading teams:', error);
                teamsList.innerHTML = `
                    <div class="state-container state-fade-in state-error">
                        <span class="state-icon">⚠️</span>
                        <h3>Something went wrong</h3>
                        <p>Unable to load teams. Please try again later.</p>
                    </div>
                `;
            }
        }, 300);
    }

    // --- Join Team ---
    function handleJoinTeam(teamId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showToast('Please log in before joining a team.', 'error');
            setTimeout(() => { window.location.href = 'login.html'; }, 800);
            return;
        }

        const teams = getTeams();
        const team  = teams.find(t => t.id === teamId);

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
            showToast(`"${team.name}" is full (${maxMembers}/${maxMembers} members).`, 'error');
            return;
        }

        // Add user to team
        if (!team.members) team.members = [];
        team.members.push({ id: currentUser.id, name: currentUser.name });
        saveTeams(teams);

        showToast(`You have joined "${team.name}" successfully!`, 'success');
        renderTeams(); // Re-render to reflect changes
    }

    // Initial render of available teams
    renderTeams();
});
