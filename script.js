// ============================================
// CONFIGURATION - YOU MUST EDIT THESE
// ============================================
// Go to JSONBin.io, get your Bin ID and API Key
// Replace the values below with YOUR actual values

const JSONBIN_BIN_ID = "6a1ea716f5f4af5e29ac50b8";      // ← CHANGE THIS
const JSONBIN_API_KEY = "$2a$10$EEln8qKG6To8EKOo9w0Fi.98I8khXGC0Jneu.Br8j1rFu6LX5kkFG";    // ← CHANGE THIS

// Admin password - CHANGE THIS to something you'll remember
const ADMIN_PASSWORD = "CbhWR7PWwdWpAwHvYp";       // ← CHANGE THIS

// ============================================
// DO NOT EDIT BELOW THIS LINE (unless you know code)
// ============================================

let currentData = { rats: [], hunters: [] };
let adminLoggedIn = false;

// Helper: Fetch data from JSONBin
async function fetchData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const data = await response.json();
        currentData = data.record;
        if (!currentData.rats) currentData.rats = [];
        if (!currentData.hunters) currentData.hunters = [];
        return currentData;
    } catch (error) {
        console.error('Fetch error:', error);
        return { rats: [], hunters: [] };
    }
}

// Helper: Save data to JSONBin
async function saveData() {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(currentData)
        });
        return true;
    } catch (error) {
        console.error('Save error:', error);
        return false;
    }
}

// Render Most Wanted board
function renderRats() {
    const container = document.getElementById('ratsList');
    if (!container) return;
    
    if (currentData.rats.length === 0) {
        container.innerHTML = '<div class="loading">🐀 No Rats reported yet. Be the first to submit one!</div>';
        return;
    }
    
    // Sort by score (most wanted first)
    const sorted = [...currentData.rats].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    container.innerHTML = sorted.map(rat => `
        <div class="rat-card" data-id="${rat.id}">
            <h3>🐀 ${escapeHtml(rat.name)}</h3>
            <div class="evidence">📸 Evidence: ${escapeHtml(rat.evidence)}</div>
            <div class="votes">
                <button class="vote-btn up" data-id="${rat.id}">⬆️ Upvote</button>
                <span class="score">Score: ${rat.score || 0}</span>
                <button class="vote-btn down" data-id="${rat.id}">⬇️ Downvote</button>
            </div>
            <div class="reported-by">Reported by: ${escapeHtml(rat.reporter || 'Anonymous')}</div>
        </div>
    `).join('');
    
    // Attach vote events
    document.querySelectorAll('.vote-btn.up').forEach(btn => {
        btn.addEventListener('click', () => vote(btn.dataset.id, 1));
    });
    document.querySelectorAll('.vote-btn.down').forEach(btn => {
        btn.addEventListener('click', () => vote(btn.dataset.id, -1));
    });
}

// Handle voting
async function vote(ratId, delta) {
    const rat = currentData.rats.find(r => r.id === ratId);
    if (rat) {
        rat.score = (rat.score || 0) + delta;
        await saveData();
        renderRats();
    }
}

// Render hunters list
function renderHunters() {
    const container = document.getElementById('huntersList');
    if (!container) return;
    
    if (currentData.hunters.length === 0) {
        container.innerHTML = '<div class="loading">🛡️ No Hunters yet. Join the Crew!</div>';
        return;
    }
    
    container.innerHTML = currentData.hunters.map(hunter => `
        <div class="hunter-card">
            <h3>⚔️ ${escapeHtml(hunter.name)}</h3>
            <div class="platform">Platform: ${escapeHtml(hunter.platform || 'Unknown')}</div>
        </div>
    `).join('');
}

// Submit a new Rat
document.getElementById('submitRatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ratName').value.trim();
    const evidence = document.getElementById('ratEvidence').value.trim();
    const reporter = document.getElementById('reporterName').value.trim() || 'Anonymous';
    
    if (!name || !evidence) {
        showMessage('submitMessage', 'Please fill in all required fields', 'error');
        return;
    }
    
    const newRat = {
        id: Date.now().toString(),
        name: name,
        evidence: evidence,
        reporter: reporter,
        score: 0,
        date: new Date().toISOString()
    };
    
    currentData.rats.push(newRat);
    await saveData();
    showMessage('submitMessage', 'Rat added to Most Wanted board!', 'success');
    document.getElementById('submitRatForm').reset();
    renderRats();
});

// Join Guild
document.getElementById('joinForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('hunterName').value.trim();
    const platform = document.getElementById('platform').value.trim();
    
    if (!name) {
        showMessage('joinMessage', 'Please enter your hunter name', 'error');
        return;
    }
    
    const newHunter = {
        id: Date.now().toString(),
        name: name,
        platform: platform || 'Not specified'
    };
    
    currentData.hunters.push(newHunter);
    await saveData();
    showMessage('joinMessage', `Welcome to The Cleanup Crew, ${name}!`, 'success');
    document.getElementById('joinForm').reset();
    renderHunters();
});

// Admin login
document.getElementById('adminLoginBtn')?.addEventListener('click', () => {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        adminLoggedIn = true;
        document.getElementById('adminPanel').style.display = 'block';
        populateDeleteSelect();
        showMessage('adminMessage', 'Admin access granted', 'success');
    } else {
        showMessage('adminMessage', 'Wrong password', 'error');
    }
});

function populateDeleteSelect() {
    const select = document.getElementById('deleteRatSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Rat to Delete --</option>' + 
        currentData.rats.map(rat => `<option value="${rat.id}">${escapeHtml(rat.name)} (Score: ${rat.score || 0})</option>`).join('');
}

document.getElementById('deleteRatBtn')?.addEventListener('click', async () => {
    if (!adminLoggedIn) {
        showMessage('adminMessage', 'Login as admin first', 'error');
        return;
    }
    const ratId = document.getElementById('deleteRatSelect').value;
    if (!ratId) {
        showMessage('adminMessage', 'Select a Rat to delete', 'error');
        return;
    }
    currentData.rats = currentData.rats.filter(r => r.id !== ratId);
    await saveData();
    showMessage('adminMessage', 'Rat removed from Most Wanted board', 'success');
    renderRats();
    populateDeleteSelect();
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        // Refresh data when switching tabs
        if (tabId === 'wanted') renderRats();
        if (tabId === 'hunters') renderHunters();
        if (tabId === 'admin' && adminLoggedIn) populateDeleteSelect();
    });
});

// Helper functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<div class="message ${type}">${text}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 3000);
    }
}

// Initialize
async function init() {
    await fetchData();
    renderRats();
    renderHunters();
}
init();