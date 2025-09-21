document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevents the default form submission.

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Simple validation
            if (email.trim() === '' || password.trim() === '') {
                alert('Please enter both email and password.');
                return;
            }

            // In a real application, you would authenticate with a server.
            // For this example, we'll simulate a successful login.
            alert('Login successful! Redirecting to trip planner...');

            // Redirect to the suggest spots page
            window.location.href = 'suggest.html';
        });
    }
});