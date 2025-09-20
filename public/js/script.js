const { resolve } = require("path");

function showReportForm() {
    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    reportModal.show();
}

function submitIssue() {
    // Simulate issue submission
    alert('Issue submitted successfully! You will receive updates via email.');
    bootstrap.Modal.getInstance(document.getElementById('reportModal')).hide();

    // Update stats
    const raisedCount = document.getElementById('raisedCount');
    const currentCount = parseInt(raisedCount.textContent);
    raisedCount.textContent = currentCount + 1;
}

function voteIssue(issueId, event) {
    event.stopPropagation();
    const voteElement = document.getElementById(`votes-${issueId}`);
    const currentVotes = parseInt(voteElement.textContent);
    voteElement.textContent = currentVotes + 1;

    // Visual feedback
    event.target.style.background = 'var(--primary-green)';
    event.target.style.color = 'white';

    setTimeout(() => {
        event.target.style.background = '';
        event.target.style.color = '';
    }, 1000);
}
async function forwardGeocode(address) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: address,
            limit: 5,
            language: ['en'] // Optional: specify language
        }).send();

        if (response && response.body && response.body.features.length > 0) {
            const features = response.body.features;
            return features.map(feature => ({
                formatted_address: feature.place_name,
                coordinates: {
                    lng: feature.center[0],
                    lat: feature.center[1]
                },
                place_type: feature.place_type,
                relevance: feature.relevance,
                context: feature.context || [] // Additional location info
            }));
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Mapbox forward geocoding error:', error);
        throw error;
    }
}

async function searchLocation() {
    const location = document.getElementById('locationInput').value;
    console.log(location);
    if (location) {
        alert(`Searching for issues near: ${location}`);
        // Simulate loading new issues based on location
        //     async function searchNearbyIssues(address, radius = 5) {
        // try {
        // Show loading
        // document.getElementById('loading').style.display = 'block';
        // document.getElementById('results').innerHTML = '';

        const response = await fetch('/search-nearby-issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: location,
                // radius: 5
            })
        });
        console.log(response[0].json());
        // console.log(Array.isArray(data));  // true
        // console.log(data.length);          // number of issues

        // data.forEach(issue => {
        //     console.log("ID:", issue.id);
        //     console.log("Title:", issue.title);
        //     console.log("Location:", issue.location);
        // });

        // console.log(data.issues[0]['_id']);

        // }catch(e){
        //     console.log(e);
        // }
    }
}



function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            alert('Location detected! Loading nearby issues...');
            // Simulate location-based issue loading
        }, function () {
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by this browser');
    }
}

function showIssues(type) {
    alert(`Showing all ${type} issues in your area`);
}

function showIssueDetails(issueId) {
    alert(`Opening detailed view for issue #${issueId}`);
}

function loadMoreIssues() {
    alert('Loading more issues...');
}

function trackIssue() {
    const issueId = prompt('Enter Issue ID to track:');
    if (issueId) {
        alert(`Tracking issue #${issueId}. You will receive notifications about updates.`);
    }
}

function showMap() {
    alert('Opening interactive map view of all issues in your area...');
}

function showLeaderboard() {
    alert('Community leaderboard - Top contributors to civic improvement!');
}

// Auto-update stats periodically (simulation)
setInterval(function () {
    const elements = ['raisedCount', 'resolvedCount', 'pendingCount', 'activeUsers'];
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    const element = document.getElementById(randomElement);
    const currentValue = parseInt(element.textContent.replace(',', ''));

    if (Math.random() > 0.8) { // 20% chance to update
        element.textContent = (currentValue + 1).toLocaleString();

        // Visual feedback
        element.style.color = 'var(--primary-green)';
        element.style.transform = 'scale(1.1)';

        setTimeout(() => {
            element.style.color = '';
            element.style.transform = '';
        }, 500);
    }
}, 5000);
