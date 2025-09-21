document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevents the default form submission.

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Simple verification logic based on user's request
            const isEmailValid = email.endsWith('@gmail.com');
            const emailPrefix = email.split('@')[0];
            const isPasswordSimilar = password.includes(emailPrefix);

            // Check if the entered credentials are correct
            if (isEmailValid && isPasswordSimilar) {
                alert('Login successful! Redirecting to trip planner...');
                // Redirect to the trip planner page
                window.location.href = 'suggest.html';
            } else {
                alert('Invalid email or password. Please try again.');
            }
        });
    }
});
