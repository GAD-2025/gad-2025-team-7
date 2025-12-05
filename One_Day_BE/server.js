const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');
const mealRoutes = require('./routes/meals');
const eventRoutes = require('./routes/events');
const todoRoutes = require('./routes/todos');

app.use('/api/auth', authRoutes);
app.use('/api/diaries', diaryRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/todos', todoRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
