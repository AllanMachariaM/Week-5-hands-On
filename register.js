document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const authMsg = document.getElementById('auth-msg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If the response is not OK, display the error message
                authMsg.textContent = data.message || 'An error occurred';
                authMsg.style.color = 'red'; // Set text color for error messages
            } else {
                // If the response is OK, display the success message
                authMsg.textContent = data.message || 'Success!';
                authMsg.style.color = 'green'; // Set text color for success messages
            }
        } catch (err) {
            authMsg.textContent = 'An unexpected error occurred: ' + err.message;
            authMsg.style.color = 'red'; // Set text color for unexpected errors
        }
    });
});
