// ============================================
// THE KARMA PROJECT - SHARED FUNCTIONS
// ============================================

const JSONBIN_BIN_ID = "6a1ea716f5f4af5e29ac50b8";
const JSONBIN_API_KEY = "$2a$10$EEln8qKG6To8EKOo9w0Fi.98I8khXGC0Jneu.Br8j1rFu6LX5kkFG";
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// ============================================
// CORE FUNCTIONS
// ============================================

async function getData() {
    const response = await fetch(JSONBIN_API_URL, {
        headers: { 'X-Access-Key': JSONBIN_API_KEY }
    });
    const json = await response.json();
    return json.record;
}

async function saveData(data) {
    const response = await fetch(JSONBIN_API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(data)
    });
    return response.ok;
}

// ============================================
// SUBMIT RAT
// ============================================

async function submitRat() {
    const name = document.getElementById('ratName')?.value;
    const evidence = document.getElementById('ratEvidence')?.value;
    
    if (!name || !evidence) {
        alert("Please fill both fields");
        return;
    }
    
    try {
        const data = await getData();
        if (!data.rats) data.rats = [];
        
        data.rats.push({
            id: Date.now(),
            name: name.trim(),
            evidence: evidence.trim(),
            timestamp: new Date().toISOString(),
            status: "Under Investigation",
            reportedBy: "Crew Member"
        });
        
        if (await saveData(data)) {
            alert(`✅ Rat "${name}" reported!`);
            document.getElementById('ratName').value = '';
            document.getElementById('ratEvidence').value = '';
            updateAllStats();
            loadRecentReports();
        }
    } catch (error) {
        console.error(error);
        alert("Error submitting rat");
    }
}

// ============================================
// JOIN CREW
// ============================================

async function joinCrew() {
    const name = document.getElementById('hunterName')?.value;
    const role = document.getElementById('hunterRole')?.value;
    
    if (!name || !role) {
        alert("Please fill both fields");
        return;
    }
    
    try {
        const data = await getData();
        if (!data.hunters) data.hunters = [];
        
        data.hunters.push({
            id: Date.now(),
            name: name.trim(),
            role: role,
            joinedDate: new Date().toISOString(),
            status: "Active",
            ratsCaught: 0
        });
        
        if (await saveData(data)) {
            alert(`✅ Welcome to the crew, ${name}!`);
            document.getElementById('hunterName').value = '';
            updateAllStats();
            if (typeof loadCrewList === 'function') loadCrewList();
        }
    } catch (error) {
        console.error(error);
        alert("Error joining crew");
    }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

async function updateAllStats() {
    const data = await getData();
    const ratsCount = document.getElementById('ratsCount');
    const huntersCount = document.getElementById('huntersCount');
    const wantedCount = document.getElementById('wantedCount');
    
    if (ratsCount) ratsCount.textContent = data.rats?.length || 0;
    if (huntersCount) huntersCount.textContent = data.hunters?.length || 0;
    if (wantedCount) wantedCount.textContent = data.rats?.filter(r => r.status !== "Captured").length || 0;
}

async function loadRecentReports() {
    const container = document.getElementById('recentReports');
    if (!container) return;
    
    const data = await getData();
    const rats = data.rats || [];
    
    if (rats.length === 0) {
        container.innerHTML = '<p>No reports yet.</p>';
        return;
    }
    
    const recent = [...rats].reverse().slice(0, 5);
    container.innerHTML = recent.map(rat => `
        <div style="background:#1a1a2e; padding:10px; margin:10px 0; border-left: 3px solid #ff4444;">
            <strong>🐀 ${escapeHtml(rat.name)}</strong><br>
            ${escapeHtml(rat.evidence.substring(0, 100))}...<br>
            <small>${new Date(rat.timestamp).toLocaleString()}</small>
        </div>
    `).join('');
}

async function loadWantedList() {
    const container = document.getElementById('wantedList');
    if (!container) return;
    
    const data = await getData();
    let rats = data.rats || [];
    rats = rats.filter(r => r.status !== "Captured");
    
    if (rats.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No wanted rats at this time.</p>';
        return;
    }
    
    container.innerHTML = rats.map(rat => `
        <div class="wanted-card">
            <div class="wanted-badge">⚠️ WANTED</div>
            <div class="rat-name">🐀 ${escapeHtml(rat.name)}</div>
            <div class="evidence">${escapeHtml(rat.evidence)}</div>
            <div class="meta">Reported: ${new Date(rat.timestamp).toLocaleDateString()}</div>
            <div class="status status-${rat.status === 'Under Investigation' ? 'pending' : 'investigating'}">${rat.status}</div>
        </div>
    `).join('');
}

async function loadCrewList() {
    const container = document.getElementById('crewList');
    if (!container) return;
    
    const data = await getData();
    const hunters = data.hunters || [];
    
    if (hunters.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No crew members yet. Join on the home page!</p>';
        return;
    }
    
    const totalHunters = document.getElementById('totalHunters');
    if (totalHunters) totalHunters.textContent = hunters.length;
    
    container.innerHTML = hunters.map(hunter => `
        <div class="crew-card">
            <div class="hunter-name">👤 ${escapeHtml(hunter.name)}</div>
            <div class="role">${escapeHtml(hunter.role)}</div>
            <div class="joined-date">Joined: ${new Date(hunter.joinedDate).toLocaleDateString()}</div>
            <div style="margin-top: 10px;">🐀 Rats caught: ${hunter.ratsCaught || 0}</div>
        </div>
    `).join('');
}

function applyFilters() {
    const status = document.getElementById('statusFilter')?.value;
    const search = document.getElementById('searchFilter')?.value.toLowerCase();
    // Re-implement filtering if needed
    loadWantedList();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Make functions global
window.submitRat = submitRat;
window.joinCrew = joinCrew;
window.applyFilters = applyFilters;