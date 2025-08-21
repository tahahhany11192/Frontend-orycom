document.addEventListener('DOMContentLoaded', function() {
    const courseForm = document.getElementById('courseForm');
    const messageDiv = document.getElementById('message');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check authentication
    checkAuth();

    // Load user info
    loadUserInfo();

    // Logout button
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '../Pages/login.html';
    });

    // Helper functions
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../Pages/login.html';
        }
    }

    function loadUserInfo() {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            document.getElementById('username').textContent = payload.name;
        }
    }
});