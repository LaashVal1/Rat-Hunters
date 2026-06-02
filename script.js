// ============================================
// THE KARMA PROJECT - RATS HUNTER
// Complete working script
// ============================================

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
const JSONBIN_BIN_ID = "6a1ea716f5f4af5e29ac50b8";  // Your bin ID from JSONBin
const JSONBIN_API_KEY = "$2a$10$EEln8qKG6To8EKOo9w0Fi.98I8khXGC0Jneu.Br8j1rFu6LX5kkFG";  // Your Master Key or Access Key

// API URLs
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// ============================================
// INITIALIZATION
// ============================================

// Check if bin exists and has correct structure when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log("The Karma Project - Rats Hunter loaded");
    await initializeDataStructure();
    await displayRatsList();
    await displayHuntersList();
});

// Initialize the data structure if needed
async function initializeDataStructure() {
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        
        // Check if structure is correct
        let needsUpdate = false;
        
        if (!currentData.rats) {
            currentData.rats = [];
            needsUpdate = true;
        }
        
        if (!currentData.hunters) {
            currentData.hunters = [];
            needsUpdate = true;
        }
        
        // If structure was missing arrays, update the bin
        if (needsUpdate) {
            const updateResponse = await fetch(JSONBIN_API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({
                    rats: currentData.rats,
                    hunters: currentData.hunters
                })
            });
            
            if (updateResponse.ok) {
                console.log("Data structure initialized successfully");
            }
        }
    } catch (error) {
        console.error("Error initializing data structure:", error);
    }
}

// ============================================
// SUBMIT RAT FUNCTION
// ============================================

async function submitRat() {
    console.log("Form submitted!");
    
    // Get input values
    const ratName = document.getElementById('ratName')?.value;
    const ratEvidence = document.getElementById('ratEvidence')?.value;
    
    // Validate inputs
    if (!ratName || ratName.trim() === "") {
        alert("Please enter the rat's name");
        return;
    }
    
    if (!ratEvidence || ratEvidence.trim() === "") {
        alert("Please provide evidence");
        return;
    }
    
    try {
        // 1. Fetch current data from JSONBin
        const fetchResponse = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const jsonResponse = await fetchResponse.json();
        const currentData = jsonResponse.record; // CRITICAL: use .record
        
        // 2. Ensure rats array exists
        if (!currentData.rats) {
            currentData.rats = [];
        }
        
        // 3. Create new rat object
        const newRat = {
            id: Date.now(), // Unique ID
            name: ratName.trim(),
            evidence: ratEvidence.trim(),
            reportedBy: "Crew Member",
            timestamp: new Date().toISOString(),
            status: "Under Investigation"
        };
        
        // 4. Add to array
        currentData.rats.push(newRat);
        
        // 5. Save back to JSONBin
        const updateResponse = await fetch(JSONBIN_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(currentData)
        });
        
        if (updateResponse.ok) {
            alert(`✅ Rat "${ratName}" has been reported successfully!`);
            
            // Clear the form
            document.getElementById('ratName').value = '';
            document.getElementById('ratEvidence').value = '';
            
            // Refresh the displayed list
            await displayRatsList();
        } else {
            const errorText = await updateResponse.text();
            console.error("Update failed:", errorText);
            alert("❌ Failed to submit rat. Check console for details.");
        }
    } catch (error) {
        console.error("Error in submitRat:", error);
        alert("Network error - please check your connection and API keys");
    }
}

// ============================================
// JOIN CREW FUNCTION
// ============================================

async function joinCrew() {
    console.log("Join crew form submitted!");
    
    // Get input values
    const hunterName = document.getElementById('hunterName')?.value;
    const hunterRole = document.getElementById('hunterRole')?.value;
    
    // Validate inputs
    if (!hunterName || hunterName.trim() === "") {
        alert("Please enter your name");
        return;
    }
    
    if (!hunterRole || hunterRole.trim() === "") {
        alert("Please enter your role (e.g., Tracker, Sniper, Scout)");
        return;
    }
    
    try {
        // 1. Fetch current data from JSONBin
        const fetchResponse = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const jsonResponse = await fetchResponse.json();
        const currentData = jsonResponse.record; // CRITICAL: use .record
        
        // 2. Ensure hunters array exists
        if (!currentData.hunters) {
            currentData.hunters = [];
        }
        
        // 3. Create new hunter object
        const newHunter = {
            id: Date.now(), // Unique ID
            name: hunterName.trim(),
            role: hunterRole.trim(),
            joinedDate: new Date().toISOString(),
            status: "Active",
            reputation: 0,
            ratsCaught: 0
        };
        
        // 4. Add to array
        currentData.hunters.push(newHunter);
        
        // 5. Save back to JSONBin
        const updateResponse = await fetch(JSONBIN_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(currentData)
        });
        
        if (updateResponse.ok) {
            alert(`✅ Welcome to the crew, ${hunterName}! Your role: ${hunterRole}`);
            
            // Clear the form
            document.getElementById('hunterName').value = '';
            document.getElementById('hunterRole').value = '';
            
            // Refresh the displayed list
            await displayHuntersList();
        } else {
            const errorText = await updateResponse.text();
            console.error("Update failed:", errorText);
            alert("❌ Failed to join the crew. Check console for details.");
        }
    } catch (error) {
        console.error("Error in joinCrew:", error);
        alert("Network error - please check your connection and API keys");
    }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

// Display list of reported rats
async function displayRatsList() {
    const ratsListElement = document.getElementById('ratsList');
    if (!ratsListElement) return;
    
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        const rats = currentData.rats || [];
        
        if (rats.length === 0) {
            ratsListElement.innerHTML = '<p style="color: #aaa;">No rats reported yet. Be the first!</p>';
            return;
        }
        
        // Display rats in a nice format
        let html = '<div class="rats-grid">';
        rats.slice().reverse().forEach(rat => { // Show newest first
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

// Display list of crew hunters
async function displayHuntersList() {
    const huntersListElement = document.getElementById('huntersList');
    if (!huntersListElement) return;
    
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        const hunters = currentData.hunters || [];
        
        if (hunters.length === 0) {
            huntersListElement.innerHTML = '<p style="color: #aaa;">No crew members yet. Join the crew!</p>';
            return;
        }
        
        // Display hunters in a nice format
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

// Helper function to prevent XSS attacks
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Function to get total stats
async function getStats() {
    try {
        const response = await fetch(JSONBIN_API_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const jsonResponse = await response.json();
        const currentData = jsonResponse.record;
        
        const totalRats = (currentData.rats || []).length;
        const totalHunters = (currentData.hunters || []).length;
        
        return { totalRats, totalHunters };
    } catch (error) {
        console.error("Error getting stats:", error);
        return { totalRats: 0, totalHunters: 0 };
    }
}

// Optional: Update stats display if you have elements for them
async function updateStatsDisplay() {
    const stats = await getStats();
    const ratsCountElement = document.getElementById('ratsCount');
    const huntersCountElement = document.getElementById('huntersCount');
    
    if (ratsCountElement) ratsCountElement.textContent = stats.totalRats;
    if (huntersCountElement) huntersCountElement.textContent = stats.totalHunters;
}

// ============================================
// ADD THIS TO YOUR HTML
// ============================================
/*
Make sure your HTML has these elements:

<!-- Submit Rat Form -->
<input type="text" id="ratName" placeholder="Rat's name">
<textarea id="ratEvidence" placeholder="Evidence"></textarea>
<button onclick="submitRat()">Submit Rat</button>

<!-- Join Crew Form -->
<input type="text" id="hunterName" placeholder="Your name">
<input type="text" id="hunterRole" placeholder="Your role">
<button onclick="joinCrew()">Join the Crew</button>

<!-- Display Areas -->
<div id="ratsList"></div>
<div id="huntersList"></div>
*/