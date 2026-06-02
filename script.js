// ============================================
// THE KARMA PROJECT - RATS HUNTER
// COMPLETE WORKING SCRIPT
// ============================================

// Configuration - YOUR WORKING VALUES
const JSONBIN_BIN_ID = "6a1ea716f5f4af5e29ac50b8";
const JSONBIN_API_KEY = "$2a$10$EEln8qKG6To8EKOo9w0Fi.98I8khXGC0Jneu.Br8j1rFu6LX5kkFG";

// API URLs
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("The Karma Project - Rats Hunter loaded");
    await initializeDataStructure();
    await displayRatsList();
    await displayHuntersList();
    await updateStatsDisplay();
});

async function initializeDataStructure() {
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        
        let needsUpdate = false;
        
        if (!currentData.rats) {
            currentData.rats = [];
            needsUpdate = true;
        }
        
        if (!currentData.hunters) {
            currentData.hunters = [];
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            const updateResponse = await fetch(JSONBIN_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({
                    rats: currentData.rats,
                    hunters: currentData.hunters
                })
            });
            
            if (updateResponse.ok) {
                console.log("✅ Data structure initialized successfully");
            }
        } else {
            console.log("✅ Data structure already correct");
        }
    } catch (error) {
        console.error("Error initializing data structure:", error);
    }
}

// ============================================
// SUBMIT RAT FUNCTION
// ============================================

async function submitRat() {
    console.log("Submit rat form submitted!");
    
    const ratName = document.getElementById('ratName')?.value;
    const ratEvidence = document.getElementById('ratEvidence')?.value;
    
    if (!ratName || ratName.trim() === "") {
        alert("Please enter the rat's name");
        return;
    }
    
    if (!ratEvidence || ratEvidence.trim() === "") {
        alert("Please provide evidence");
        return;
    }
    
    try {
        // Fetch current data
        const fetchResponse = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const jsonResponse = await fetchResponse.json();
        const currentData = jsonResponse.record;
        
        // Ensure rats array exists
        if (!currentData.rats) {
            currentData.rats = [];
        }
        
        // Add new rat
        const newRat = {
            id: Date.now(),
            name: ratName.trim(),
            evidence: ratEvidence.trim(),
            reportedBy: "Crew Member",
            timestamp: new Date().toISOString(),
            status: "Under Investigation"
        };
        
        currentData.rats.push(newRat);
        
        // Save back to JSONBin
        const updateResponse = await fetch(JSONBIN_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(currentData)
        });
        
        if (updateResponse.ok) {
            alert(`✅ Rat "${ratName}" has been reported successfully!`);
            document.getElementById('ratName').value = '';
            document.getElementById('ratEvidence').value = '';
            await displayRatsList();
            await updateStatsDisplay();
        } else {
            const errorText = await updateResponse.text();
            console.error("Update failed:", errorText);
            alert("❌ Failed to submit rat. Check console for details.");
        }
    } catch (error) {
        console.error("Error in submitRat:", error);
        alert("Network error - check console for details");
    }
}

// ============================================
// JOIN CREW FUNCTION
// ============================================

async function joinCrew() {
    console.log("Join crew form submitted!");
    
    const hunterName = document.getElementById('hunterName')?.value;
    const hunterRole = document.getElementById('hunterRole')?.value;
    
    if (!hunterName || hunterName.trim() === "") {
        alert("Please enter your name");
        return;
    }
    
    if (!hunterRole || hunterRole.trim() === "") {
        alert("Please enter your role");
        return;
    }
    
    try {
        // Fetch current data
        const fetchResponse = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const jsonResponse = await fetchResponse.json();
        const currentData = jsonResponse.record;
        
        // Ensure hunters array exists
        if (!currentData.hunters) {
            currentData.hunters = [];
        }
        
        // Add new hunter
        const newHunter = {
            id: Date.now(),
            name: hunterName.trim(),
            role: hunterRole.trim(),
            joinedDate: new Date().toISOString(),
            status: "Active",
            reputation: 0,
            ratsCaught: 0
        };
        
        currentData.hunters.push(newHunter);
        
        // Save back to JSONBin
        const updateResponse = await fetch(JSONBIN_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(currentData)
        });
        
        if (updateResponse.ok) {
            alert(`✅ Welcome to the crew, ${hunterName}!`);
            document.getElementById('hunterName').value = '';
            document.getElementById('hunterRole').value = '';
            await displayHuntersList();
            await updateStatsDisplay();
        } else {
            const errorText = await updateResponse.text();
            console.error("Update failed:", errorText);
            alert("❌ Failed to join the crew. Check console for details.");
        }
    } catch (error) {
        console.error("Error in joinCrew:", error);
        alert("Network error - check console for details");
    }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

async function displayRatsList() {
    const ratsListElement = document.getElementById('ratsList');
    if (!ratsListElement) return;
    
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        const rats = currentData.rats || [];
        
        if (rats.length === 0) {
            ratsListElement.innerHTML = '<p style="color: #aaa;">No rats reported yet. Be the first!</p>';
            return;
        }
        
        let html = '<div class="rats-grid">';
        [...rats].reverse().forEach(rat => {
            html += `
                <div class="rat-card" style="background: #1a1a2e; padding: 10px; margin: 10px 0; border-left: 3px solid #ff4444;">
                    <strong>🐀 ${escapeHtml(rat.name)}</strong><br>
                    <small style="color: #aaa;">Evidence: ${escapeHtml(rat.evidence)}</small><br>
                    <small style="color: #666;">Reported: ${new Date(rat.timestamp).toLocaleString()}</small>
                </div>
            `;
        });
        html += '</div>';
        
        ratsListElement.innerHTML = html;
    } catch (error) {
        console.error("Error displaying rats:", error);
        ratsListElement.innerHTML = '<p style="color: #ff4444;">Error loading rats list</p>';
    }
}

async function displayHuntersList() {
    const huntersListElement = document.getElementById('huntersList');
    if (!huntersListElement) return;
    
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        const hunters = currentData.hunters || [];
        
        if (hunters.length === 0) {
            huntersListElement.innerHTML = '<p style="color: #aaa;">No crew members yet. Join the crew!</p>';
            return;
        }
        
        let html = '<div class="hunters-grid">';
        hunters.forEach(hunter => {
            html += `
                <div class="hunter-card" style="background: #1a1a2e; padding: 10px; margin: 10px 0; border-left: 3px solid #44ff44;">
                    <strong>👤 ${escapeHtml(hunter.name)}</strong><br>
                    <small>Role: ${escapeHtml(hunter.role)}</small><br>
                    <small style="color: #666;">Joined: ${new Date(hunter.joinedDate).toLocaleDateString()}</small>
                </div>
            `;
        });
        html += '</div>';
        
        huntersListElement.innerHTML = html;
    } catch (error) {
        console.error("Error displaying hunters:", error);
        huntersListElement.innerHTML = '<p style="color: #ff4444;">Error loading crew list</p>';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function getStats() {
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        
        return {
            totalRats: (currentData.rats || []).length,
            totalHunters: (currentData.hunters || []).length
        };
    } catch (error) {
        console.error("Error getting stats:", error);
        return { totalRats: 0, totalHunters: 0 };
    }
}

async function updateStatsDisplay() {
    const stats = await getStats();
    const ratsCountElement = document.getElementById('ratsCount');
    const huntersCountElement = document.getElementById('huntersCount');
    
    if (ratsCountElement) ratsCountElement.textContent = stats.totalRats;
    if (huntersCountElement) huntersCountElement.textContent = stats.totalHunters;
}
