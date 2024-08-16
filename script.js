document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirect to login page if no token is found
        window.location.href = 'login.html';
    }

    // Fetch user data on page load
    fetchUserData();

    // Handle form submission for adding transactions
    const transactionForm = document.getElementById('expenseForm');
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

            // Check if response is in JSON format
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response, got something else');
            }

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

    // Function to fetch and display user data
    async function fetchUserData() {
        try {
            const response = await fetch('http://localhost:3000/userdata', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check if response is in JSON format
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response, got something else');
            }

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

    // Function to update the UI with user data
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

        // Update the chart after updating the UI
        fetchDataAndUpdateChart('http://localhost:3000/transactions'); // Adjust the URL if needed
    }

    // Function to fetch data from the API and update the chart
    async function fetchDataAndUpdateChart(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            // Check if response is in JSON format
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response, got something else');
            }

            const data = await response.json();

            // Assuming the data is in the following format:
            // { labels: ['label1', 'label2', ...], values: [value1, value2, ...] }
            const labels = data.labels || [];
            const values = data.values || [];

            // Update the chart with the fetched data
            updateChart(labels, values);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to create or update the chart
    function updateChart(labels, data) {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        // Check if there's already a chart instance, if so destroy it before creating a new one
        if (window.expenseChart) {
            window.expenseChart.destroy();
        }

        window.expenseChart = new Chart(ctx, {
            type: 'bar', // Chart type
            data: {
                labels: labels, // X-axis labels
                datasets: [{
                    label: 'Expenses',
                    data: data, // Data for the chart
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true // Start the y-axis at zero
                    }
                }
            }
        });
    }
});
