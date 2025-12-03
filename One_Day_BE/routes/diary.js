const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/diaries/:userId/:date
// @desc    Get diary entry for a specific user and date
// @access  Private
router.get('/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;

    try {
        const [diaries] = await db.query(
            'SELECT * FROM diaries WHERE user_id = ? AND date = ?',
            [userId, date]
        );

        if (diaries.length > 0) {
            res.json(diaries[0]);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/diaries
// @desc    Create or update a diary entry (upsert)
// @access  Private
router.post('/', async (req, res) => {
    const { userId, date, title, canvasData } = req.body;

    if (!userId || !date) {
        return res.status(400).json({ msg: 'User ID and date are required.' });
    }

    try {
        const sql = `
            INSERT INTO diaries (user_id, `date`, title, canvasData)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            canvasData = VALUES(canvasData)
        `;
        const [result] = await db.query(sql, [userId, date, title, canvasData]);
        res.status(201).json({ msg: 'Diary saved.', insertId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
