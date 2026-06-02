// ============================================
// ADMIN PANEL FUNCTIONS
// ============================================

const ADMIN_PASSWORD = "CbhWR7PWwdWpAwHvYp"; //

function checkAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminData();
    } else {
        document.getElementById('loginError').textContent = '❌ Incorrect password';
    }
}

async function loadAdminData() {
    await loadAdminRats();
    await loadAdminHunters();
}

async function loadAdminRats() {
    const container = document.getElementById('adminRatsList');
    if (!container) return;
    
    const data = await getData();
    const rats = data.rats || [];
    
    if (rats.length === 0) {
        container.innerHTML = '<p>No rat reports.</p>';
        return;
    }
    
    container.innerHTML = rats.map(rat => `
        <div class="item" id="rat-${rat.id}">
            <div class="item-info">
                <strong>🐀 ${escapeHtml(rat.name)}</strong><br>
                <small>${escapeHtml(rat.evidence.substring(0, 100))}</small><br>
                <small>Reported: ${new Date(rat.timestamp).toLocaleString()}</small>
                <select class="status-select" data-id="${rat.id}" data-type="rat" onchange="updateStatus('rat', ${rat.id}, this.value)">
                    <option value="Under Investigation" ${rat.status === 'Under Investigation' ? 'selected' : ''}>Under Investigation</option>
                    <option value="Confirmed" ${rat.status === 'Confirmed' ? 'selected' : ''}>Confirmed Rat</option>
                    <option value="Captured" ${rat.status === 'Captured' ? 'selected' : ''}>Captured</option>
                </select>
            </div>
            <button class="delete-btn" onclick="deleteItem('rat', ${rat.id})">🗑️ Delete</button>
        </div>
    `).join('');
}

async function loadAdminHunters() {
    const container = document.getElementById('adminHuntersList');
    if (!container) return;
    
    const data = await getData();
    const hunters = data.hunters || [];
    
    if (hunters.length === 0) {
        container.innerHTML = '<p>No crew members.</p>';
        return;
    }
    
    container.innerHTML = hunters.map(hunter => `
        <div class="item" id="hunter-${hunter.id}">
            <div class="item-info">
                <strong>👤 ${escapeHtml(hunter.name)}</strong><br>
                Role: ${escapeHtml(hunter.role)}<br>
                Joined: ${new Date(hunter.joinedDate).toLocaleDateString()}<br>
                Rats caught: ${hunter.ratsCaught || 0}
            </div>
            <button class="delete-btn" onclick="deleteItem('hunter', ${hunter.id})">🗑️ Remove</button>
        </div>
    `).join('');
}

async function updateStatus(type, id, newStatus) {
    const data = await getData();
    const items = type === 'rat' ? data.rats : data.hunters;
    const item = items.find(i => i.id === id);
    
    if (item) {
        item.status = newStatus;
        if (await saveData(data)) {
            console.log(`✅ Updated ${type} ${id} status to ${newStatus}`);
            if (type === 'rat') {
                loadWantedList();
                updateAllStats();
            }
        }
    }
}

async function deleteItem(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
        return;
    }
    
    const data = await getData();
    const items = type === 'rat' ? data.rats : data.hunters;
    const index = items.findIndex(i => i.id === id);
    
    if (index !== -1) {
        items.splice(index, 1);
        if (await saveData(data)) {
            console.log(`✅ Deleted ${type} ${id}`);
            // Refresh all displays
            loadAdminData();
            updateAllStats();
            if (type === 'rat') {
                loadWantedList();
                loadRecentReports();
            } else {
                loadCrewList();
            }
        }
    }
}

// Make admin functions global
window.checkAdminLogin = checkAdminLogin;
window.updateStatus = updateStatus;
window.deleteItem = deleteItem;
window.loadAdminData = loadAdminData;