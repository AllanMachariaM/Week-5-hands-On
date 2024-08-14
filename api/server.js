const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL with threadId:', db.threadId);

    // Create database and tables
    db.query('CREATE DATABASE IF NOT EXISTS `expense_tracker`', (err) => {
        if (err) {
            console.error('Error creating database:', err.message);
            return;
        }
        console.log('Database `expense_tracker` created or checked.');

        db.query('USE `expense_tracker`', (err) => {
            if (err) {
                console.error('Error selecting database:', err.message);
                return;
            }

            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255) NOT NULL
                )
            `;

            db.query(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                } else {
                    console.log('Users table checked/created.');
                }
            });
        });
    });
});

// Registration route
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the user already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error querying database:', err.message);
                return res.status(500).json({ message: 'Server error.' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already in use.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            const query = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
            db.query(query, [email, username, hashedPassword], (err) => {
                if (err) {
                    console.error('Error inserting user:', err.message);
                    return res.status(500).json({ message: 'Error registering user.' });
                }

                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (err) {
        console.error('Error hashing password:', err.message);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).json({ message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token });
    });
});



// Start the server
app.listen(3000, () => {
    console.log('Server is running on PORT 3000');
});



