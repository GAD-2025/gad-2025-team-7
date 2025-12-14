const mysql = require('mysql2/promise');
const path = require('path');

// Resolve the path to the .env file located in the same directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: '+09:00', // Set timezone to KST (UTC+9)
    dateStrings: true, // Return dates as strings, not Date objects
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;