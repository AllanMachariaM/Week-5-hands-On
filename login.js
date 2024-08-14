document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const authMsg = document.getElementById('auth-msg');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Display error message
                authMsg.textContent = data.message || 'An error occurred';
                authMsg.style.color = 'red'; // Optionally style error message
            } else {
                // Display success message
                authMsg.textContent = data.message || 'Login successful!';
                authMsg.style.color = 'green'; // Optionally style success message
                
                // Store the token if needed (e.g., in localStorage)
                localStorage.setItem('token', data.token);

                // Redirect to the index page
                window.location.href = 'index.html'; // Change to the actual path of your index page
            }
        } catch (err) {
            // Handle fetch or network errors
            authMsg.textContent = 'Network error: ' + err.message;
            authMsg.style.color = 'red'; // Optionally style error message
        }
    });
});document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const authMsg = document.getElementById('auth-msg');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // Display error message
                authMsg.textContent = data.message || 'An error occurred';
                authMsg.style.color = 'red'; // Optionally style error message
            } else {
                // Display success message
                authMsg.textContent = data.message || 'Login successful!';
                authMsg.style.color = 'green'; // Optionally style success message
                
                // Store the token if needed (e.g., in localStorage)
                localStorage.setItem('token', data.token);

                // Redirect to the index page
                window.location.href = 'index.html'; // Change to the actual path of your index page
            }
        } catch (err) {
            // Handle fetch or network errors
            authMsg.textContent = 'Network error: ' + err.message;
            authMsg.style.color = 'red'; // Optionally style error message
        }
    });
});



