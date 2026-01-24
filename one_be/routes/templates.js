const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.use(express.json());

// @route   POST /api/templates
// @desc    Create a new template
// @access  Private
router.post('/', async (req, res) => {
    const { userId, title, type, color } = req.body;

    if (!userId || !title || !type) {
        return res.status(400).json({ msg: 'userId, title, and type are required.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO templates (user_id, title, type, color) VALUES (?, ?, ?, ?)',
            [userId, title, type, color || '#FFE79D'] // Default color if not provided
        );
        res.status(201).json({ msg: 'Template created successfully.', templateId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: `Database error: ${err.message}` });
    }
});

module.exports = router;
