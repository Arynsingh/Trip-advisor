document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevents the default form submission.

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Verification logic: email must end with @gmail.com
            // and the password must be similar to the email's username part.
            const emailRegex = /(.+)@gmail\.com$/;
            const match = email.match(emailRegex);

            if (!match) {
                alert('Please enter a valid email address ending with @gmail.com.');
                return;
            }

            const username = match[1];
            if (!password.includes(username)) {
                alert('Password must be similar to the email username.');
                return;
            }

            // In a real application, you would send this data to a server for authentication.
            alert('Login successful! Redirecting to trip planner...');

            // Redirect to the trip planner page
            window.location.href = 'suggest.html';
        });
    }
});
