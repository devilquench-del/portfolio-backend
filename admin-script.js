// ==================== AUTHENTICATION ====================
const ADMIN_AUTH_SESSION_KEY = 'adminSession';
const API_ORIGIN = resolveApiOrigin();
const APP_LOCAL_STORAGE_KEYS = [
    'portfolioData',
    'projectReviews',
    'contactMessages',
    'portfolioTitle',
    'theme',
    'googleClientId'
];

function resolveApiOrigin() {
    if (typeof window === 'undefined') {
        return 'https://portfolio-backend-4b4m.onrender.com';
    }
    try {
        const override = localStorage.getItem('apiOrigin');
        if (override && typeof override === 'string') {
            return override.replace(/\/+$/, '');
        }
    } catch (err) {}
    return 'http://localhost:5000';
}

function isAdminAuthenticated() {
    return sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true';
}

function setAdminAuthenticated(value) {
    if (value) {
        sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
    } else {
        sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
    }
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showAdminDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminDashboard').classList.remove('hidden');
}

function requireAdminAuth(redirectOnFail = true) {
    if (isAdminAuthenticated()) return true;
    if (redirectOnFail) {
        showLoginPage();
    }
    return false;
}

let isLoggedIn = false;
let portfolioData = {
    skills: ['HTML', 'CSS', 'JavaScript', 'AI Integration', 'Chatbot Development', 'Node.js'],
    projects: [
        { title: 'AI Chatbot', desc: 'Smart chatbot using OpenAI API for real-time conversations.', tech: 'HTML • CSS • JavaScript • AI' },
        { title: 'Modern Portfolio', desc: 'Dark-themed responsive portfolio with animations.', tech: 'HTML • CSS • JS' },
        { title: 'E-commerce Frontend', desc: 'Product-based UI with clean layout and cart logic.', tech: 'HTML • CSS • JavaScript' },
        { title: 'Realtime Chat App', desc: 'Websocket-based realtime chat with typing indicators and presence.', tech: 'HTML • CSS • JavaScript • Node.js • WebSocket' },
        { title: 'Portfolio Redesign', desc: 'A redesign project focused on performance, accessibility, and modern UI.', tech: 'HTML • CSS • JavaScript • Performance' }
    ],
    contact: {
        email: 'manoj@example.com',
        phone: ''
    }
};
// Index of project currently being edited (null when adding new)
let editingProjectIndex = null;
let editingSkillIndex = null;
let apiModulePromise = null;

function getApiModule() {
    if (!apiModulePromise) {
        apiModulePromise = import('./frontend/js/api.js');
    }
    return apiModulePromise;
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('portfolioData');
    if (saved) {
        portfolioData = JSON.parse(saved);
    }
    portfolioData.skills = normalizeSkillRecords(portfolioData.skills);
    portfolioData.projects = normalizeProjectRecords(portfolioData.projects);
}

function normalizeSkillRecords(skills) {
    if (!Array.isArray(skills)) return [];
    return skills
        .map((entry) => {
            if (typeof entry === 'string') {
                return { id: '', name: entry.trim() };
            }
            const label = typeof entry?.name === 'string'
                ? entry.name.trim()
                : (typeof entry?.skill === 'string' ? entry.skill.trim() : '');
            const id = entry?._id ? String(entry._id) : (entry?.id ? String(entry.id) : '');
            return { id, name: label };
        })
        .filter((entry) => entry.name);
}

function normalizeProjectRecords(projects) {
    if (!Array.isArray(projects)) return [];
    return projects
        .map((project) => ({
            id: project?.id ? String(project.id) : (project?._id ? String(project._id) : ''),
            title: typeof project?.title === 'string' ? project.title.trim() : '',
            desc: typeof project?.desc === 'string' ? project.desc.trim() : '',
            tech: typeof project?.tech === 'string' ? project.tech.trim() : ''
        }))
        .filter((project) => project.title && project.desc && project.tech);
}

/* ================= TOAST HELPERS (ADMIN) ================= */
function ensureToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info', timeout = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    // escape basic HTML
    const safe = typeof message === 'string' ? message.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s])) : String(message);
    toast.innerHTML = `<div class="toast-body">${safe}</div><button class="close-btn" aria-label="Close">✕</button>`;
    const closeBtn = toast.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    });
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    if (timeout > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 200);
        }, timeout);
    }
    return toast;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    addActivity(`Data updated`);
}

// ==================== ACTIVITY LOG ====================
function addActivity(message) {
    const log = document.getElementById('activityLog');
    if (!log) return; // Prevent error if element doesn't exist
    
    const timestamp = new Date().toLocaleTimeString();
    const li = document.createElement('li');
    li.textContent = `${message} - ${timestamp}`;
    log.insertBefore(li, log.firstChild);
    
    // Keep only last 10 activities
    while (log.children.length > 10) {
        log.removeChild(log.lastChild);
    }

    // Update last updated time
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleDateString();
    }
}

// ==================== LOGIN ====================
document.addEventListener('DOMContentLoaded', async function() {
    const hasSession = isAdminAuthenticated();
    isLoggedIn = hasSession;
    if (hasSession) {
        showAdminDashboard();
        loadData();
        await initializeDashboard();
    } else {
        showLoginPage();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_ORIGIN}/api/auth/login`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const payload = await response.json();
                if (!payload || payload.success !== true) {
                    showToast(payload?.message || 'Login failed', 'error');
                    setAdminAuthenticated(false);
                    return;
                }

                setAdminAuthenticated(true);
                isLoggedIn = true;
                showAdminDashboard();
                loadData();
                await initializeDashboard();
                addActivity('Admin logged in');
            } catch (err) {
                setAdminAuthenticated(false);
                showToast('Login failed', 'error');
            }
        });
    }

    // ==================== LOGOUT ====================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch(`${API_ORIGIN}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {}
            setAdminAuthenticated(false);
            isLoggedIn = false;
            showLoginPage();
            document.getElementById('loginForm').reset();
            addActivity('Admin logged out');
            window.location.href = 'admin.html';
        });
    }

    // ==================== CLOSE LOGIN MODAL ====================
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            // Log action then navigate to homepage
            addActivity('Login modal closed - redirecting to home');
            // Redirect user to the site's homepage
            window.location.href = 'index.html';
        });
    }

    // ==================== NAVIGATION ====================
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (!requireAdminAuth()) return;
            const section = item.getAttribute('data-section');
            
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(section).classList.add('active');
        });
    });

    loadData();
});

// ==================== DASHBOARD INITIALIZATION ====================
async function syncPortfolioFromBackend() {
    try {
        const api = await getApiModule();
        const skills = await api.fetchSkills();
        const projects = await api.fetchProjects();

        if (!Array.isArray(skills)) {
            showToast('Failed to fetch skills from backend', 'error');
        } else {
            portfolioData.skills = normalizeSkillRecords(skills);
        }

        if (!Array.isArray(projects)) {
            showToast('Failed to fetch projects from backend', 'error');
        } else {
            portfolioData.projects = normalizeProjectRecords(projects);
        }

        localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    } catch (err) {
        console.error('Dashboard sync error:', err);
        showToast('Failed to sync dashboard data', 'error');
    }
}

async function initializeDashboard() {
    if (!requireAdminAuth()) return;
    await syncPortfolioFromBackend();
    updateDashboardStats();
    loadSkillsList();
    loadProjectsList();
    updateContactDisplay();
    // Load admin reviews and settings
    try { await loadAdminReviews(); } catch (e) {}
    try { populateGsiStatus(); } catch (e) {}
}

function updateDashboardStats() {
    const statNumbers = document.querySelectorAll('#dashboard .stat-number');
    if (statNumbers[0]) {
        statNumbers[0].textContent = Array.isArray(portfolioData.skills) ? portfolioData.skills.length : 0;
    }
    if (statNumbers[1]) {
        statNumbers[1].textContent = Array.isArray(portfolioData.projects) ? portfolioData.projects.length : 0;
    }
}

// ==================== SKILLS MANAGEMENT ====================
async function addSkill() {
    try {
        const input = document.getElementById('skillInput');
        const skill = input.value.trim();

        if (skill === '') {
            showToast('Please enter a skill name', 'error');
            return;
        }

        const api = await getApiModule();
        const addBtn = document.querySelector('#skills .btn-add');

        if (editingSkillIndex !== null && typeof editingSkillIndex === 'number') {
            const updatedSkills = [...portfolioData.skills];
            const currentSkill = updatedSkills[editingSkillIndex];
            if (!currentSkill || !currentSkill.id) {
                showToast('Failed to update skill', 'error');
                return;
            }

            const duplicate = updatedSkills.some((existingSkill, index) =>
                index !== editingSkillIndex &&
                typeof existingSkill?.name === 'string' &&
                existingSkill.name.trim().toLowerCase() === skill.toLowerCase()
            );
            if (duplicate) {
                showToast('Skill already exists', 'error');
                return;
            }

            const updated = await api.updateSkill(currentSkill.id, { skill });
            if (!updated) {
                showToast('Failed to update skill', 'error');
                return;
            }
            if (!updated.success) {
                showToast(updated.message || 'Failed to update skill', 'error');
                return;
            }

            const skills = await api.fetchSkills();
            if (!Array.isArray(skills)) {
                showToast('Failed to refresh skills', 'error');
                return;
            }
            portfolioData.skills = normalizeSkillRecords(skills);
            loadSkillsList();
            updateDashboardStats();
            input.value = '';
            editingSkillIndex = null;
            if (addBtn) addBtn.textContent = '+ Add Skill';
            addActivity(`Skill updated: ${currentSkill.name} -> ${skill}`);
            return;
        }

        const created = await api.addSkill(skill);
        if (!created) {
            showToast('Failed to add skill', 'error');
            return;
        }
        if (!created.success) {
            showToast(created.message || 'Failed to add skill', 'error');
            return;
        }

        const skills = await api.fetchSkills();
        if (!Array.isArray(skills)) {
            showToast('Failed to refresh skills', 'error');
            return;
        }
        portfolioData.skills = normalizeSkillRecords(skills);

        loadSkillsList();
        updateDashboardStats();
        input.value = '';
        editingSkillIndex = null;
        if (addBtn) addBtn.textContent = '+ Add Skill';
        addActivity(`Skill added: ${skill}`);
    } catch (err) {
        console.error('Add skill error:', err);
        showToast('Failed to add skill', 'error');
    }
}

async function deleteSkill(index) {
    const skill = portfolioData.skills[index];
    if (!skill || !skill.id) {
        showToast('Failed to delete skill', 'error');
        return;
    }
    if (confirm(`Delete skill: ${skill.name}?`)) {
        try {
            const api = await getApiModule();
            const deleted = await api.deleteSkill(skill.id);
            if (!deleted) {
                showToast('Failed to delete skill', 'error');
                return;
            }
            if (!deleted.success) {
                showToast(deleted.message || 'Failed to delete skill', 'error');
                return;
            }

            const skills = await api.fetchSkills();
            if (!Array.isArray(skills)) {
                showToast('Failed to refresh skills', 'error');
                return;
            }
            portfolioData.skills = normalizeSkillRecords(skills);
            loadSkillsList();
            updateDashboardStats();
            addActivity(`Skill deleted: ${skill.name}`);
        } catch (err) {
            console.error('Delete skill error:', err);
            showToast('Failed to delete skill', 'error');
        }
    }
}

function loadSkillsList() {
    const list = document.getElementById('skillsList');
    list.innerHTML = '';

    portfolioData.skills.forEach((skill, index) => {
        const li = document.createElement('li');
        const skillLabel = document.createElement('span');
        skillLabel.textContent = skill.name;

        const actions = document.createElement('div');

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editSkill(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteSkill(index));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(skillLabel);
        li.appendChild(actions);
        list.appendChild(li);
    });
}

function editSkill(index) {
    const skill = portfolioData.skills[index];
    if (!skill || typeof skill.name !== 'string') return;
    document.getElementById('skillInput').value = skill.name;
    editingSkillIndex = index;
    const addBtn = document.querySelector('#skills .btn-add');
    if (addBtn) addBtn.textContent = 'Save Changes';
    addActivity(`Editing skill: ${skill.name}`);
}

// ==================== PROJECTS MANAGEMENT ====================
async function uploadProjectImage(projectId, file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_ORIGIN}/api/projects/${projectId}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
    const payload = await response.json();
    if (!payload || !payload.success || !payload.url) {
        throw new Error(payload?.message || 'Image upload failed');
    }
    return payload.url;
}

async function addProject() {
    try {
        const title = document.getElementById('projectTitle').value.trim();
        const desc = document.getElementById('projectDesc').value.trim();
        const tech = document.getElementById('projectTech').value.trim();
        const imageInput = document.getElementById('projectImage');
        const imageFile = imageInput && imageInput.files ? imageInput.files[0] : null;

        if (!title || !desc || !tech) {
            showToast('Please fill all fields', 'error');
            return;
        }
        const api = await getApiModule();

        // If editing an existing project, update it
        if (editingProjectIndex !== null && typeof editingProjectIndex === 'number') {
            const addBtn = document.querySelector('#projects .btn-add');
            const updatedProjects = [...portfolioData.projects];
            const old = updatedProjects[editingProjectIndex];
            const duplicate = updatedProjects.some((project, index) =>
                index !== editingProjectIndex &&
                project &&
                typeof project.title === 'string' &&
                project.title.trim().toLowerCase() === title.toLowerCase()
            );
            if (duplicate) {
                showToast('Project title already exists', 'error');
                return;
            }

            const projectId = old && old.id ? old.id : null;
            if (!projectId) {
                showToast('Failed to update project', 'error');
                return;
            }

            if (imageFile) {
                try {
                    await uploadProjectImage(projectId, imageFile);
                } catch (uploadErr) {
                    showToast(uploadErr.message || 'Image upload failed', 'error');
                    return;
                }
            }

            const updated = await api.updateProject(projectId, { title, desc, tech });
            if (!updated) {
                showToast('Failed to update project', 'error');
                return;
            }
            if (!updated.success) {
                showToast(updated.message || 'Failed to update project', 'error');
                return;
            }

            const projects = await api.fetchProjects();
            if (!Array.isArray(projects)) {
                showToast('Failed to refresh projects', 'error');
                return;
            }
            portfolioData.projects = projects;
            loadProjectsList();
            updateDashboardStats();
            document.getElementById('projectTitle').value = '';
            document.getElementById('projectDesc').value = '';
            document.getElementById('projectTech').value = '';
            if (imageInput) imageInput.value = '';
            addActivity(`Project updated: ${title}`);
            editingProjectIndex = null;
            if (addBtn) addBtn.textContent = '+ Add Project';
            return;
        }

        // Otherwise add new project
        const created = await api.addProject({ title, desc, tech });
        if (!created) {
            showToast('Failed to add project', 'error');
            return;
        }
        if (!created.success) {
            showToast(created.message || 'Failed to add project', 'error');
            return;
        }
        const createdId = created.data && created.data.id ? created.data.id : null;
        if (createdId && imageFile) {
            try {
                await uploadProjectImage(createdId, imageFile);
            } catch (uploadErr) {
                showToast(uploadErr.message || 'Image upload failed', 'error');
            }
        }

        const projects = await api.fetchProjects();
        if (!Array.isArray(projects)) {
            showToast('Failed to refresh projects', 'error');
            return;
        }
        portfolioData.projects = projects;

        loadProjectsList();
        updateDashboardStats();
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectDesc').value = '';
        document.getElementById('projectTech').value = '';
        if (imageInput) imageInput.value = '';
        addActivity(`Project added: ${title}`);
    } catch (err) {
        console.error('Add project error:', err);
        showToast('Failed to add project', 'error');
    }
}

async function deleteProject(index) {
    const project = portfolioData.projects[index];
    if (confirm(`Delete project: ${project.title}?`)) {
        try {
            const api = await getApiModule();
            const projectId = project && project.id ? project.id : null;
            if (!projectId) {
                showToast('Failed to delete project', 'error');
                return;
            }
            const deleted = await api.deleteProject(projectId);
            if (!deleted) {
                showToast('Failed to delete project', 'error');
                return;
            }
            if (!deleted.success) {
                showToast(deleted.message || 'Failed to delete project', 'error');
                return;
            }

            const projects = await api.fetchProjects();
            if (!Array.isArray(projects)) {
                showToast('Failed to refresh projects', 'error');
                return;
            }
            portfolioData.projects = projects;
            loadProjectsList();
            updateDashboardStats();
            addActivity(`Project deleted: ${project.title}`);
        } catch (err) {
            console.error('Delete project error:', err);
            showToast('Failed to delete project', 'error');
        }
    }
}

function loadProjectsList() {
    const list = document.getElementById('projectsList');
    list.innerHTML = '';

    portfolioData.projects.forEach((project, index) => {
        const li = document.createElement('li');
        const details = document.createElement('div');

        const title = document.createElement('strong');
        title.textContent = project.title;

        const desc = document.createElement('p');
        desc.textContent = project.desc;

        const tech = document.createElement('small');
        tech.textContent = project.tech;

        details.appendChild(title);
        details.appendChild(desc);
        details.appendChild(tech);

        const actions = document.createElement('div');

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editProject(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteProject(index));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(details);
        li.appendChild(actions);
        list.appendChild(li);
    });
}

// Populate project form for editing
function editProject(index) {
    const project = portfolioData.projects[index];
    if (!project) return;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDesc').value = project.desc;
    document.getElementById('projectTech').value = project.tech;
    editingProjectIndex = index;
    const addBtn = document.querySelector('#projects .btn-add');
    if (addBtn) addBtn.textContent = 'Save Changes';
    addActivity(`Editing project: ${project.title}`);
}

// ==================== CONTACT MANAGEMENT ====================
function updateContact() {
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();

    if (!email) {
        showToast('Email is required', 'error');
        return;
    }

    portfolioData.contact.email = email;
    portfolioData.contact.phone = phone;
    saveData();
    updateContactDisplay();
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    addActivity('Contact information updated');
}

function updateContactDisplay() {
    document.getElementById('displayEmail').textContent = portfolioData.contact.email;
    document.getElementById('displayPhone').textContent = portfolioData.contact.phone || 'Not set';
    document.getElementById('contactEmail').value = portfolioData.contact.email;
    document.getElementById('contactPhone').value = portfolioData.contact.phone;
}

// ==================== SETTINGS ====================
function updatePortfolioTitle() {
    const title = document.getElementById('portfolioTitle').value.trim();
    if (title) {
        document.title = title;
        localStorage.setItem('portfolioTitle', title);
        addActivity(`Portfolio title updated to: ${title}`);
        showToast('Portfolio title updated!', 'success');
    }
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    localStorage.setItem('theme', theme);
    addActivity(`Theme changed to: ${theme}`);
    showToast(`Theme changed to ${theme} mode!`, 'info');
}

function resetAllData() {
    APP_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function resetData() {
    if (confirm('Are you sure? This will delete all customizations!')) {
        if (confirm('This action cannot be undone. Confirm again?')) {
            resetAllData();
            location.reload();
        }
    }
}

// small helper to escape HTML in admin UI
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":"&#39;" }[s]));
}

// ==================== GOOGLE CLIENT ID (ADMIN) ====================
function saveGoogleClientId() {
    const input = document.getElementById('googleClientIdInput');
    if (!input) return;
    const id = input.value.trim();
    if (!id) {
        if (confirm('Clear stored Google Client ID?')) {
            localStorage.removeItem('googleClientId');
            addActivity('Google Client ID cleared');
            populateGsiStatus();
            showToast('Google Client ID cleared', 'success');
        }
        return;
    }
    localStorage.setItem('googleClientId', id);
    addActivity('Google Client ID saved');
    populateGsiStatus();
    showToast('Google Client ID saved. Reload the public site to enable sign-in.', 'success');
}

function populateGsiStatus() {
    const current = document.getElementById('gsiCurrent');
    const input = document.getElementById('googleClientIdInput');
    const stored = localStorage.getItem('googleClientId');
    if (current) current.textContent = stored ? stored : 'Not configured';
    if (input) input.value = stored || '';
}

// ==================== REVIEWS MODERATION ====================
async function fetchAdminReviews() {
    try {
        const res = await fetch(`${API_ORIGIN}/api/reviews/admin`, { credentials: 'include' });
        const payload = await res.json();
        if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
            return null;
        }
        return payload.data;
    } catch (err) {
        return null;
    }
}

async function loadAdminReviews() {
    const listEl = document.getElementById('adminReviewsList');
    if (!listEl) return;
    try {
        const reviews = await fetchAdminReviews();
        if (reviews === null) {
            showToast('Failed to refresh reviews', 'error');
            listEl.innerHTML = '<li class="no-projects">No reviews submitted yet.</li>';
            return;
        }

        listEl.innerHTML = '';
        if (reviews.length === 0) {
            listEl.innerHTML = '<li class="no-projects">No reviews submitted yet.</li>';
            return;
        }

        reviews.forEach((r) => {
            const li = document.createElement('li');

            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.gap = '12px';

            const content = document.createElement('div');

            const name = document.createElement('strong');
            name.textContent = r.name || 'Anonymous';

            const meta = document.createElement('div');
            meta.className = 'small-text';
            meta.textContent = `${new Date(r.ts).toLocaleString()} - `;

            const status = document.createElement('span');
            status.style.color = r.approved ? '#4caf50' : '#ffa726';
            status.textContent = r.approved ? 'Approved' : 'Pending';
            meta.appendChild(status);

            const body = document.createElement('div');
            body.textContent = r.text || '';

            content.appendChild(name);
            content.appendChild(meta);
            content.appendChild(body);

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.flexDirection = 'column';
            actions.style.gap = '8px';
            actions.style.alignItems = 'flex-end';

            const approveBtn = document.createElement('button');
            approveBtn.className = 'btn-edit';
            approveBtn.textContent = r.approved ? 'Approved' : 'Approve';
            approveBtn.disabled = !!r.approved;
            approveBtn.addEventListener('click', () => approveReviewAdmin(r.id, r.name || 'Anonymous'));

            const rejectBtn = document.createElement('button');
            rejectBtn.className = 'btn-delete';
            rejectBtn.textContent = 'Reject';
            rejectBtn.addEventListener('click', () => rejectReviewAdmin(r.id, r.name || 'Anonymous'));

            actions.appendChild(approveBtn);
            actions.appendChild(rejectBtn);

            row.appendChild(content);
            row.appendChild(actions);
            li.appendChild(row);
            listEl.appendChild(li);
        });
    } catch (err) {
        console.error('Load admin reviews error:', err);
        showToast('Failed to load reviews', 'error');
    }
}

async function approveReviewAdmin(reviewId, reviewerName) {
    try {
        const response = await fetch(`${API_ORIGIN}/api/reviews/${reviewId}/approve`, {
            method: 'PATCH',
            credentials: 'include'
        });
        const payload = await response.json();
        if (!payload) {
            showToast('Failed to approve review', 'error');
            return;
        }
        if (!payload.success) {
            showToast(payload.message || 'Failed to approve review', 'error');
            return;
        }
        addActivity(`Review approved by admin (${reviewerName || 'Anonymous'})`);
        showToast('Review approved', 'success');
        await loadAdminReviews();
    } catch (err) {
        console.error('Approve review error:', err);
        showToast('Failed to approve review', 'error');
    }
}

async function rejectReviewAdmin(reviewId, reviewerName) {
    if (!confirm(`Reject review by ${reviewerName || 'Anonymous'}?`)) return;
    try {
        const response = await fetch(`${API_ORIGIN}/api/reviews/${reviewId}/reject`, {
            method: 'PATCH',
            credentials: 'include'
        });
        const payload = await response.json();
        if (!response) {
            showToast('Failed to reject review', 'error');
            return;
        }
        if (!payload.success) {
            showToast(payload.message || 'Failed to reject review', 'error');
            return;
        }
        addActivity(`Review rejected by admin (${reviewerName || 'Anonymous'})`);
        showToast('Review rejected', 'info');
        await loadAdminReviews();
    } catch (err) {
        console.error('Reject review error:', err);
        showToast('Failed to reject review', 'error');
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    loadData();
});
