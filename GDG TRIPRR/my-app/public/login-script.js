document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevents the default form submission.

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Basic validation to check for non-empty fields
            if (email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
                alert('Please fill out all fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }

            // In a real application, you would send this data to a server to create an account.
            alert('Account created successfully! You will be redirected to the login page.');
            
            // Redirect to the login page after successful sign-up
            window.location.href = 'index.html';
        });
    }
});
