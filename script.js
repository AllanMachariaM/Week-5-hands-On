document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to login page if no token is found
        window.location.href = 'login.html';
    }

    // Fetch user data
    fetchUserData();

    // Add transaction form submit handler
    const transactionForm = document.getElementById('transactionForm');
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = document.getElementById('type').checked ? 'Expense' : 'Income';
        const name = transactionForm.name.value;
        const amount = parseFloat(transactionForm.amount.value);
        const date = transactionForm.date.value;

        try {
            const response = await fetch('http://localhost:3000/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, name, amount, date })
            });

            const data = await response.json();

            if (!response.ok) {
                document.getElementById('status').textContent = data.message || 'An error occurred';
                document.getElementById('status').style.color = 'red';
            } else {
                document.getElementById('status').textContent = 'Transaction added successfully!';
                document.getElementById('status').style.color = 'green';
                fetchUserData(); // Refresh the transaction list and balance
            }
        } catch (err) {
            document.getElementById('status').textContent = 'Network error: ' + err.message;
            document.getElementById('status').style.color = 'red';
        }
    });

    // Fetch and display user data
    async function fetchUserData() {
        try {
            const response = await fetch('http://localhost:3000/userdata', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                updateUI(data);
            } else {
                console.error('Error fetching user data:', data.message);
                document.getElementById('status').textContent = 'Error fetching data.';
                document.getElementById('status').style.color = 'red';
            }
        } catch (err) {
            console.error('Network error:', err.message);
        }
    }

    // Update the UI with user data
    function updateUI(data) {
        document.getElementById('balance').textContent = `$${data.balance.toFixed(2)}`;
        document.getElementById('income').textContent = `$${data.income.toFixed(2)}`;
        document.getElementById('expense').textContent = `$${data.expense.toFixed(2)}`;

        const transactionList = document.getElementById('transactionList');
        transactionList.innerHTML = ''; // Clear existing list

        data.transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.textContent = `${transaction.date} - ${transaction.type}: ${transaction.name} - $${transaction.amount.toFixed(2)}`;
            transactionList.appendChild(li);
        });
    }
});
