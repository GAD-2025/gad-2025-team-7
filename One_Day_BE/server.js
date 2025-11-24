const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const healthcareRoutes = require('./routes/healthcare');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/healthcare', healthcareRoutes);

// Basic route for checking if server is up
app.get('/', (req, res) => {
    res.send('One Day Backend Server is running.');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});