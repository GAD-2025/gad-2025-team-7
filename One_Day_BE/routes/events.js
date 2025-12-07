const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/events/:userId/:date
// @desc    Get all events for a user on a specific date
// @access  Private
router.get('/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;
    try {
        const [events] = await db.query(
            'SELECT * FROM events WHERE user_id = ? AND `date` = ? ORDER BY `time`',
            [userId, date]
        );
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: `Database error: ${err.message}` });
    }
});

// @route   GET /api/events/range/:userId
// @desc    Get all events for a user within a date range
// @access  Private
router.get('/range/:userId', async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ msg: 'Start date and end date are required.' });
    }

    try {
        const [events] = await db.query(
            'SELECT * FROM events WHERE user_id = ? AND `date` >= ? AND `date` <= ? ORDER BY `date`, `time`',
            [userId, startDate, endDate]
        );
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: `Database error: ${err.message}` });
    }
});

// @route   POST /api/events
// @desc    Create a new event or multiple recurring events
// @access  Private
router.post('/', async (req, res) => {
    const {
        userId,
        title,
        time,
        category,
        setReminder,
        startDate,
        endDate,
        selectedDays
    } = req.body;

    if (!userId || !title || !startDate) {
        return res.status(400).json({ msg: 'userId, title, and startDate are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let newEvents = [];
        if (selectedDays && selectedDays.length > 0) {
            // Create recurring events for 1 year
            const start = new Date(startDate);
            for (let i = 0; i < 365; i++) {
                const day = new Date(start);
                day.setDate(day.getDate() + i);

                if (selectedDays.includes(day.getDay())) {
                    newEvents.push([
                        userId,
                        day.toISOString().split('T')[0],
                        title,
                        time || null,
                        category || 'personal',
                        setReminder || false
                    ]);
                }
            }
        } else {
            // Create single or range event
            const start = new Date(startDate);
            const end = endDate ? new Date(endDate) : new Date(startDate);
            let currentDate = new Date(start);
            while (currentDate <= end) {
                newEvents.push([
                    userId,
                    currentDate.toISOString().split('T')[0],
                    title,
                    time || null,
                    category || 'personal',
                    setReminder || false
                ]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        if (newEvents.length > 0) {
            const sql = 'INSERT INTO events (user_id, `date`, title, `time`, category, setReminder) VALUES ?';
            await connection.query(sql, [newEvents]);
        }

        await connection.commit();
        res.status(201).json({ msg: 'Event(s) created successfully.' });

    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).json({ msg: `Database error: ${err.message}` });
    } finally {
        connection.release();
    }
});

// @route   PUT /api/events/:eventId/complete
// @desc    Toggle event completion status
// @access  Private
router.put('/:eventId/complete', async (req, res) => {
    const { eventId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ msg: 'Completed status must be a boolean.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE events SET completed = ? WHERE id = ?',
            [completed, eventId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Event not found.' });
        }
        res.json({ msg: 'Event completion status updated.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: `Database error: ${err.message}` });
    }
});

// @route   DELETE /api/events/:eventId
// @desc    Delete an event
// @access  Private
router.delete('/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
        const [result] = await db.query('DELETE FROM events WHERE id = ?', [eventId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Event not found.' });
        }
        res.json({ msg: 'Event deleted.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: `Database error: ${err.message}` });
    }
});

module.exports = router;
