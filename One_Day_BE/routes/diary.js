const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

// @route   GET /api/diaries/:userId
// @desc    Get all diary entries for a specific user
// @access  Private
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [diaries] = await db.query(
            'SELECT * FROM diaries WHERE user_id = ? ORDER BY date DESC',
            [userId]
        );

        const processedDiaries = diaries.map(diary => {
            try {
                if (typeof diary.texts === 'string') {
                    diary.texts = JSON.parse(diary.texts);
                }
                if (typeof diary.images === 'string') {
                    diary.images = JSON.parse(diary.images);
                }
            } catch (e) {
                console.error("Error parsing diary data from DB:", e);
                diary.texts = diary.texts || [];
                diary.images = diary.images || [];
            }
            return diary;
        });

        res.json(processedDiaries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
            const diary = diaries[0];
            if (typeof diary.texts === 'string') {
                try {
                    diary.texts = JSON.parse(diary.texts);
                } catch (e) {
                    console.error("Error parsing texts from DB:", e);
                    diary.texts = [];
                }
            }
            if (typeof diary.images === 'string') {
                try {
                    diary.images = JSON.parse(diary.images);
                } catch (e) {
                    console.error("Error parsing images from DB:", e);
                    diary.images = [];
                }
            }
            res.json(diary);
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

    let canvasImagePath = '';
    if (canvasData) {
        try {
            const base64Data = canvasData.replace(/^data:image\/png;base64,/, "");
            const fileName = `${Date.now()}_${userId}.png`;
            const filePath = path.join(__dirname, '..', 'uploads', fileName);
            
            fs.writeFileSync(filePath, base64Data, 'base64');
            
            canvasImagePath = `/uploads/${fileName}`;
        } catch (err) {
            console.error("Error saving canvas image:", err);
            return res.status(500).send('Error saving canvas image.');
        }
    }

    try {
        const sql = `
            INSERT INTO diaries (user_id, \`date\`, title, canvasImagePath, texts, images)
            VALUES (?, ?, ?, ?, '[]', '[]')
            ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            canvasImagePath = VALUES(canvasImagePath),
            texts = '[]',
            images = '[]'
        `;
        const params = [userId, date, title, canvasImagePath];
        const [result] = await db.query(sql, params);
        res.status(201).json({ msg: 'Diary saved.', insertId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
