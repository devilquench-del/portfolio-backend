// Smooth scroll to section
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: "smooth"
        });
    }
}

const API_ORIGIN = 'https://portfolio-backend-4b4m.onrender.com';

const DEFAULT_PORTFOLIO_DATA = {
    skills: ['HTML', 'CSS', 'JavaScript', 'AI Integration', 'Chatbot Development', 'Node.js'],
    projects: [
        { title: 'AI Chatbot', desc: 'Smart chatbot using OpenAI API for real-time conversations.', tech: 'HTML • CSS • JavaScript • AI' },
        { title: 'Modern Portfolio', desc: 'Dark-themed responsive portfolio with animations.', tech: 'HTML • CSS • JS' },
        { title: 'E-commerce Frontend', desc: 'Product-based UI with clean layout and cart logic.', tech: 'HTML • CSS • JavaScript' }
    ]
};
const PORTFOLIO_DATA_KEY = 'portfolioData';
let portfolioData = loadPortfolioData();
let apiModulePromise = null;

function getApiModule() {
    if (!apiModulePromise) {
        apiModulePromise = import('./frontend/js/api.js');
    }
    return apiModulePromise;
}

async function getPortfolioDataForHomepage() {
    try {
        const skillsRes = await fetch(`${API_ORIGIN}/api/skills`, { credentials: 'include' });
        const projectsRes = await fetch(`${API_ORIGIN}/api/projects`, { credentials: 'include' });
        const skillsPayload = await skillsRes.json();
        const projectsPayload = await projectsRes.json();

        if (!skillsPayload || skillsPayload.success !== true || !Array.isArray(skillsPayload.data)) {
            throw new Error('Invalid backend payload for skills');
        }
        if (!projectsPayload || projectsPayload.success !== true || !Array.isArray(projectsPayload.data)) {
            throw new Error('Invalid backend payload for projects');
        }

        const normalizedSkills = normalizeSkills(skillsPayload.data);
        const normalizedProjects = normalizeProjects(projectsPayload.data);

        portfolioData = {
            skills: normalizedSkills,
            projects: normalizedProjects
        };
        savePortfolioData(portfolioData);

        return portfolioData;
    } catch (e) {
        showToast('Failed to load skills/projects from backend', 'error');
        const cached = localStorage.getItem(PORTFOLIO_DATA_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const skills = normalizeSkills(parsed && parsed.skills);
                const projects = normalizeProjects(parsed && parsed.projects);
                portfolioData = {
                    skills: skills.length > 0 ? skills : [...DEFAULT_PORTFOLIO_DATA.skills],
                    projects: projects.length > 0 ? projects : DEFAULT_PORTFOLIO_DATA.projects.map(p => ({ ...p }))
                };
                return portfolioData;
            } catch (err) {
                // Fall through to defaults if cache is invalid
            }
        }
        portfolioData = {
            skills: [...DEFAULT_PORTFOLIO_DATA.skills],
            projects: DEFAULT_PORTFOLIO_DATA.projects.map(p => ({ ...p }))
        };
        return portfolioData;
    }
}

async function renderHomepageContent() {
    const skillsContainer = document.getElementById('homeSkillsContainer');
    const projectsContainer = document.getElementById('homeProjectsContainer');
    if (!skillsContainer || !projectsContainer) return;

    await getPortfolioDataForHomepage();

    skillsContainer.textContent = '';
    portfolioData.skills.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.textContent = skill;
        skillsContainer.appendChild(card);
    });

    projectsContainer.textContent = '';
    portfolioData.projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        const title = document.createElement('h3');
        title.textContent = project.title || '';

        const desc = document.createElement('p');
        desc.textContent = project.desc || '';

        const tech = document.createElement('span');
        tech.textContent = project.tech || '';

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(tech);
        projectsContainer.appendChild(card);
    });
}

function normalizeSkills(skills) {
    if (!Array.isArray(skills)) return [];
    return skills
        .map(skill => String(skill || '').trim())
        .filter(skill => skill.length > 0);
}

function normalizeProjects(projects) {
    if (!Array.isArray(projects)) return [];
    return projects
        .map(project => ({
            title: String(project && project.title ? project.title : '').trim(),
            desc: String(project && project.desc ? project.desc : '').trim(),
            tech: String(project && project.tech ? project.tech : '').trim()
        }))
        .filter(project => project.title || project.desc || project.tech);
}

function loadPortfolioData() {
    try {
        const raw = localStorage.getItem(PORTFOLIO_DATA_KEY);
        if (!raw) {
            return {
                skills: [...DEFAULT_PORTFOLIO_DATA.skills],
                projects: DEFAULT_PORTFOLIO_DATA.projects.map(p => ({ ...p }))
            };
        }

        const parsed = JSON.parse(raw);
        const skills = normalizeSkills(parsed && parsed.skills);
        const projects = normalizeProjects(parsed && parsed.projects);

        return {
            skills: skills.length > 0 ? skills : [...DEFAULT_PORTFOLIO_DATA.skills],
            projects: projects.length > 0 ? projects : DEFAULT_PORTFOLIO_DATA.projects.map(p => ({ ...p }))
        };
    } catch (e) {
        return {
            skills: [...DEFAULT_PORTFOLIO_DATA.skills],
            projects: DEFAULT_PORTFOLIO_DATA.projects.map(p => ({ ...p }))
        };
    }
}

function savePortfolioData(data) {
    localStorage.setItem(PORTFOLIO_DATA_KEY, JSON.stringify(data));
}

// Initialize navigation when DOM is ready
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-links a");
    
    if (navLinks.length === 0) {
        console.log("No nav links found");
        return;
    }
    
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            
            // Only intercept anchor links (starting with #)
            if (href && href.startsWith("#")) {
                e.preventDefault();
                const target = href.substring(1);
                scrollToSection(target);
            }
            // Allow normal navigation for all .html files and external links
        });
    });
}

// Try multiple ways to ensure initialization
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initNavigation();
        void renderHomepageContent();
    });
} else {
    // DOM already loaded (script loaded at end of body)
    initNavigation();
    void renderHomepageContent();
}

/* ==================== REVIEWS & RATINGS ==================== */
const REVIEWS_KEY = 'projectReviews';

function loadReviews() {
    try {
        const raw = localStorage.getItem(REVIEWS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveReviews(reviews) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function normalizeReview(review, index = 0) {
    const parsedRating = Number.parseInt(review && review.rating, 10);
    const rating = Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : 5;
    const parsedTs = Number(review && review.ts);

    return {
        id: review && review.id !== undefined ? review.id : null,
        name: review && review.name ? String(review.name) : 'Anonymous',
        email: review && review.email ? String(review.email) : '',
        rating,
        text: review && review.text ? String(review.text) : '',
        ts: Number.isFinite(parsedTs) && parsedTs > 0 ? parsedTs : Date.now() + index,
        provider: review && review.provider ? String(review.provider) : 'local',
        approved: review && review.approved !== undefined ? !!review.approved : false,
        flagged: !!(review && review.flagged)
    };
}

async function syncHomepageReviewsFromBackend() {
    try {
        const api = await getApiModule();
        const backendReviews = await api.fetchReviews();

        if (!Array.isArray(backendReviews)) {
            showToast('Failed to load reviews from backend', 'error');
            return;
        }

        const normalizedReviews = backendReviews.map((review, index) => normalizeReview(review, index));
        saveReviews(normalizedReviews);
        renderReviews();
    } catch (err) {
        console.error('Load reviews error:', err);
        showToast('Failed to load reviews from backend', 'error');
    }
}

function renderReviews() {
    const list = document.getElementById('reviewsList');
    if (!list) return;
    // Only render approved reviews on the public site
    const reviews = loadReviews().filter(r => r.approved).sort((a,b)=> b.ts - a.ts);
    list.textContent = '';
    if (reviews.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'no-projects';
        empty.textContent = 'No reviews yet. Be the first to review!';
        list.appendChild(empty);
        return;
    }
    reviews.forEach(r => {
        const div = document.createElement('div');
        div.className = 'review-item';
        const time = new Date(r.ts).toLocaleString();
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

        const header = document.createElement('div');
        header.className = 'review-header';

        const left = document.createElement('div');
        const nameEl = document.createElement('span');
        nameEl.className = 'review-name';
        nameEl.textContent = r.name || 'Anonymous';

        const timeEl = document.createElement('span');
        timeEl.className = 'review-time';
        timeEl.textContent = `• ${time}`;

        left.appendChild(nameEl);
        left.appendChild(document.createTextNode(' '));
        left.appendChild(timeEl);

        const ratingEl = document.createElement('div');
        ratingEl.className = 'review-rating';
        ratingEl.textContent = stars;

        header.appendChild(left);
        header.appendChild(ratingEl);

        const body = document.createElement('div');
        body.className = 'review-body';
        body.textContent = r.text || '';

        div.appendChild(header);
        div.appendChild(body);
        list.appendChild(div);
    });
    // update average rating display after rendering
    renderAverageRating();
}

function computeAverageRating() {
    // Average calculated over approved reviews only
    const reviews = loadReviews().filter(r => r.approved);
    if (!reviews || reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0);
    const avg = sum / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

function renderAverageRating() {
    const el = document.getElementById('averageRating');
    if (!el) return;
    const { avg, count } = computeAverageRating();
    if (count === 0) {
        el.textContent = 'No ratings yet';
    } else {
        el.textContent = `${avg} ★  —  Based on ${count} review${count>1? 's':''}`;
    }
}

// Listen for storage events so the public page picks up admin changes (e.g., client ID)
window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === 'googleClientId') {
        const newId = e.newValue;
        if (newId) {
            try { loadGoogleIdentity(newId); } catch (err) { console.error(err); }
        }
    }
    if (e.key === 'projectReviews') {
        // reviews changed in another tab (admin deleted or new review added), re-render
        try { renderReviews(); } catch (err) { console.error(err); }
    }
});

function escapeHtml(str){
    if (!str) return '';
        return String(str).replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":"&#39;" }[s]));
}

function initReviews() {
    const starInput = document.getElementById('starInput');
    const submitBtn = document.getElementById('submitReview');
    const reviewText = document.getElementById('reviewText');
    let selectedRating = 0;

    if (starInput) {
        starInput.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRating = parseInt(btn.getAttribute('data-value')) || 5;
                starInput.querySelectorAll('button').forEach(b=> b.classList.remove('active'));
                // highlight those >= value
                starInput.querySelectorAll('button').forEach(b=>{
                    if (parseInt(b.getAttribute('data-value')) <= selectedRating) b.classList.add('active');
                });
            });
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            try {
                const text = reviewText ? reviewText.value.trim() : '';
                if (!text) { showToast('Please write a short review', 'error'); return; }
                const rating = Number(selectedRating);
                if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                    showToast('Please select a rating between 1 and 5 stars', 'error');
                    return;
                }

                // get signed-in user if available
                const user = window.__signedInUser || {name: 'Anonymous', email: ''};
                const api = await getApiModule();
                const created = await api.addReview({
                    name: user.name || 'Anonymous',
                    email: user.email || '',
                    rating,
                    text,
                    ts: Date.now(),
                    provider: user.provider || 'local',
                    approved: false,
                    flagged: false
                });
                if (!created) {
                    showToast('Failed to submit review', 'error');
                    return;
                }
                if (!created.data) {
                    showToast(created.message || 'Failed to submit review', 'error');
                    return;
                }

                const backendReviews = await api.fetchReviews();
                if (!Array.isArray(backendReviews)) {
                    showToast('Failed to refresh reviews', 'error');
                    return;
                }
                const normalizedReviews = backendReviews.map((review, index) => normalizeReview(review, index));
                saveReviews(normalizedReviews);
                renderReviews();
                if (reviewText) reviewText.value = '';
                showToast('Thanks for your review!', 'success');
                // Inform user that review was sent to admin for moderation
                showToast('YOUR REVIEW HAS BEEN SENT TO THE ADMIN', 'info', 5000);
            } catch (err) {
                console.error('Submit review error:', err);
                showToast('Failed to submit review', 'error');
            }
        });
    }

    // Initialize Google sign-in if client ID configured
    const clientId = localStorage.getItem('googleClientId');
    if (clientId) {
        loadGoogleIdentity(clientId);
    }

    renderReviews();
    void syncHomepageReviewsFromBackend();
}

function loadGoogleIdentity(clientId) {
    if (!clientId) return;
    const scriptId = 'google-identity-script';
    if (document.getElementById(scriptId)) return;
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.id = scriptId;
    s.onload = () => {
        /* global google */
        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredential
        });
        // render button
        google.accounts.id.renderButton(document.getElementById('gsiButtonWrapper'), { theme: 'outline', size: 'large' });
    };
    document.head.appendChild(s);
}

function handleGoogleCredential(response) {
    try {
        const jwt = response.credential;
        const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        const user = { name: payload.name, email: payload.email, picture: payload.picture, provider: 'google' };
        window.__signedInUser = user;
        const signedDiv = document.getElementById('signedInUser');
        if (signedDiv) {
            signedDiv.style.display = 'block';
            signedDiv.innerHTML = `<img src="${user.picture}" style="width:32px;height:32px;border-radius:50%;vertical-align:middle;margin-right:8px;"> <strong style="color:#d4af37">${escapeHtml(user.name)}</strong> (<span style="color:#888">${escapeHtml(user.email)}</span>)`;
        }
    } catch (e) {
        console.error('Google sign-in error', e);
    }
}

// Initialize reviews after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviews);
} else {
    initReviews();
}

/* ================= TOAST HELPERS ================= */
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
    toast.innerHTML = `<div class="toast-body">${escapeHtml(message)}</div><button class="close-btn" aria-label="Close">✕</button>`;
    const closeBtn = toast.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    });
    container.appendChild(toast);
    // allow CSS transition
    requestAnimationFrame(() => toast.classList.add('show'));
    if (timeout > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 200);
        }, timeout);
    }
    return toast;
}
