
// Interactive functionality for the civic issue platform

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

function searchLocation() {
    const location = document.getElementById('locationInput').value;
    if (location) {
        alert(`Searching for issues near: ${location}`);
        // Simulate loading new issues based on location
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
