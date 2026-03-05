const API_ORIGIN = 'https://portfolio-backend-4b4m.onrender.com';

async function getData(endpoint) {
    try {
        const res = await fetch(`${API_ORIGIN}${endpoint}`, { credentials: 'include' });
        handleUnauthorized(res);
        return await readJsonSafely(res);
    } catch (err) {
        console.error('API GET Error:', err);
        return null;
    }
}

async function readJsonSafely(res) {
    try {
        return await res.json();
    } catch (err) {
        return null;
    }
}

function handleUnauthorized(res) {
    if (res && res.status === 401 && typeof window !== 'undefined') {
        try {
            sessionStorage.removeItem('adminSession');
        } catch (err) {}
        window.location.href = 'admin.html';
    }
}

async function postData(endpoint, data) {
    try {
        const res = await fetch(`${API_ORIGIN}${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        handleUnauthorized(res);
        return await readJsonSafely(res);
    } catch (err) {
        console.error('API POST Error:', err);
        return null;
    }
}

async function putData(endpoint, data) {
    try {
        const res = await fetch(`${API_ORIGIN}${endpoint}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        handleUnauthorized(res);
        return await readJsonSafely(res);
    } catch (err) {
        console.error('API PUT Error:', err);
        return null;
    }
}

async function deleteData(endpoint) {
    try {
        const res = await fetch(`${API_ORIGIN}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        handleUnauthorized(res);
        return await readJsonSafely(res);
    } catch (err) {
        console.error('API DELETE Error:', err);
        return null;
    }
}

// Skills API
export async function fetchSkills() {
    const response = await getData('/api/skills');
    return response && response.success ? response.data : null;
}

export async function addSkill(skill) {
    return await postData('/api/skills', { skill });
}

export async function updateSkill(id, data) {
    return await putData(`/api/skills/${id}`, data);
}

export async function deleteSkill(id) {
    return await deleteData(`/api/skills/${id}`);
}

// Projects API
export async function fetchProjects() {
    const response = await getData('/api/projects');
    return response && response.success ? response.data : null;
}

export async function addProject(project) {
    return await postData('/api/projects', project);
}

export async function updateProject(id, data) {
    return await putData(`/api/projects/${id}`, data);
}

export async function deleteProject(id) {
    return await deleteData(`/api/projects/${id}`);
}

// Reviews API
export async function fetchReviews() {
    const response = await getData('/api/reviews');
    return response && response.success ? response.data : null;
}

export async function addReview(review) {
    return await postData('/api/reviews', review);
}

export async function updateReview(reviewId, updates) {
    return await putData(`/api/reviews/${reviewId}`, updates);
}

export async function deleteReview(reviewId) {
    return await deleteData(`/api/reviews/${reviewId}`);
}
