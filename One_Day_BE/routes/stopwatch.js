const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/stopwatch/:userId
// @desc    Get all stopwatch records for a specific user
// @access  Private
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [records] = await db.query(
            'SELECT * FROM stopwatch_records WHERE user_id = ? ORDER BY date DESC',
            [userId]
        );

        const processedRecords = records.map(record => {
            try {
                record.tasks_data = JSON.parse(record.tasks_data);
                record.categories_data = JSON.parse(record.categories_data);
            } catch (e) {
                console.error("Error parsing stopwatch data from DB:", e);
                record.tasks_data = [];
                record.categories_data = [];
            }
            return record;
        });

        res.json(processedRecords);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/stopwatch/:userId/:date
// @desc    Get stopwatch records for a specific user and date
// @access  Private
router.get('/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;

    try {
        const [records] = await db.query(
            'SELECT * FROM stopwatch_records WHERE user_id = ? AND date = ?',
            [userId, date]
        );

        if (records.length > 0) {
            const record = records[0];
            try {
                record.tasks_data = JSON.parse(record.tasks_data);
                record.categories_data = JSON.parse(record.categories_data);
            } catch (e) {
                console.error("Error parsing stopwatch data from DB:", e);
                record.tasks_data = [];
                record.categories_data = [];
            }
            res.json(record);
        } else {
            res.json(null); // No record found for this date
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/stopwatch
// @desc    Create or update a stopwatch record (upsert)
// @access  Private
router.post('/', async (req, res) => {
    const { userId, date, tasksData, categoriesData } = req.body;

    if (!userId || !date) {
        return res.status(400).json({ msg: 'User ID and date are required.' });
    }

    try {
        const sql = 'INSERT INTO stopwatch_records (user_id, `date`, tasks_data, categories_data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE tasks_data = VALUES(tasks_data), categories_data = VALUES(categories_data)';
        const params = [
            userId,
            date,
            JSON.stringify(tasksData || []),
            JSON.stringify(categoriesData || [])
        ];
        const [result] = await db.query(sql, params);
        res.status(201).json({ msg: 'Stopwatch data saved.', insertId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
