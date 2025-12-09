const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Corrected to use pool

// @route   GET /api/healthcare/cycles/:userId
// @desc    Get all menstrual cycles for a user and predict the next one
// @access  Private
router.get('/cycles/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [cycles] = await pool.query(
            'SELECT start_date, end_date FROM menstrual_cycles WHERE user_id = ? ORDER BY start_date DESC',
            [userId]
        );

        if (cycles.length < 2) {
            return res.json({
                prediction: null,
                history: cycles,
                message: '예측을 위해 최소 2번의 주기 기록이 필요합니다.'
            });
        }

        // --- Prediction Logic ---
        let cycleLengths = [];
        for (let i = 0; i < cycles.length - 1; i++) {
            const startDate1 = new Date(cycles[i].start_date);
            const startDate2 = new Date(cycles[i+1].start_date);
            const diffTime = Math.abs(startDate1 - startDate2);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            cycleLengths.push(diffDays);
        }
        const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;

        let durations = [];
        for (let cycle of cycles) {
            const startDate = new Date(cycle.start_date);
            const endDate = new Date(cycle.end_date);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
            durations.push(diffDays);
        }
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        const lastStartDate = new Date(cycles[0].start_date);
        const predictedStartDate = new Date(new Date(lastStartDate).setDate(lastStartDate.getDate() + Math.round(avgCycleLength)));
        const predictedEndDate = new Date(new Date(predictedStartDate).setDate(predictedStartDate.getDate() + Math.round(avgDuration - 1)));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dDay = Math.ceil((predictedStartDate - today) / (1000 * 60 * 60 * 24));

        res.json({
            prediction: {
                startDate: predictedStartDate.toISOString().split('T')[0],
                endDate: predictedEndDate.toISOString().split('T')[0],
                dDay: dDay
            },
            history: cycles
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/healthcare/cycles
// @desc    Add a menstrual cycle record
// @access  Private
router.post('/cycles', async (req, res) => {
    const { startDate, endDate, userId } = req.body;

    if (!startDate || !endDate || !userId) {
        return res.status(400).json({ msg: '사용자 ID, 시작일, 종료일을 모두 입력해주세요.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO menstrual_cycles (user_id, start_date, end_date) VALUES (?, ?, ?)',
            [userId, startDate, endDate]
        );
        res.status(201).json({ msg: '주기 기록이 저장되었습니다.', insertId: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/healthcare/cycles/:cycleId
// @desc    Delete a menstrual cycle record
// @access  Private
router.delete('/cycles/:cycleId', async (req, res) => {
    const { cycleId } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM menstrual_cycles WHERE id = ?',
            [cycleId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: '주기 기록을 찾을 수 없습니다.' });
        }

        res.status(200).json({ msg: '주기 기록이 삭제되었습니다.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/healthcare/steps/:userId/:date
// @desc    Get steps for a specific user and date
// @access  Private
router.get('/steps/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT steps FROM daily_steps WHERE user_id = ? AND date = ?',
            [userId, date]
        );
        if (rows.length > 0) {
            res.json({ steps: rows[0].steps });
        } else {
            res.json({ steps: 0 }); // If no record, return 0 steps
        }
    } catch (err) {
        console.error('Get steps error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/healthcare/steps
// @desc    Save/update steps for a user and date
// @access  Private
router.post('/steps', async (req, res) => {
    const { userId, date, steps } = req.body;
    if (userId === undefined || date === undefined || steps === undefined) {
        return res.status(400).json({ msg: 'userId, date, and steps are required.' });
    }

    try {
        const sql = `
            INSERT INTO daily_steps (user_id, \`date\`, steps)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE steps = VALUES(steps);
        `;
        await pool.query(sql, [userId, date, steps]);
        res.status(200).json({ msg: 'Steps saved successfully.' });
    } catch (err) {
        console.error('Save steps error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/healthcare/weekly_summary/:userId/:endDate
// @desc    Get weekly health summary (steps, calories) for a user
// @access  Private
router.get('/weekly_summary/:userId/:endDate', async (req, res) => {
    const { userId, endDate } = req.params;
    const end = new Date(endDate);
    const start = new Date(endDate);
    start.setDate(end.getDate() - 6); // 7 days including the end date

    const startDate = start.toISOString().split('T')[0];
    const queryEndDate = end.toISOString().split('T')[0];

    try {
        const sql = `
            SELECT 
                ds.date,
                IFNULL(ds.steps, 0) as steps,
                IFNULL(SUM(mf.calories * mf.quantity), 0) as totalConsumedCalories
            FROM
                (SELECT DISTINCT date FROM daily_steps WHERE user_id = ? AND date BETWEEN ? AND ?) ds_dates
            LEFT JOIN daily_steps ds ON ds_dates.date = ds.date AND ds.user_id = ?
            LEFT JOIN meals m ON ds_dates.date = m.date AND m.user_id = ?
            LEFT JOIN meal_foods mf ON m.id = mf.meal_id
            WHERE ds_dates.date BETWEEN ? AND ?
            GROUP BY ds_dates.date
            ORDER BY ds_dates.date;
        `;
        // Need to combine with dates that might not have steps but have meals
        const combinedSql = `
            SELECT
                dates.date,
                IFNULL(ds.steps, 0) as steps,
                IFNULL(SUM(mf.calories * mf.quantity), 0) as totalConsumedCalories
            FROM
                (SELECT DISTINCT date AS date FROM daily_steps WHERE user_id = ? AND date BETWEEN ? AND ?
                 UNION
                 SELECT DISTINCT date AS date FROM meals WHERE user_id = ? AND date BETWEEN ? AND ?
                ) AS dates
            LEFT JOIN daily_steps ds ON dates.date = ds.date AND ds.user_id = ?
            LEFT JOIN meals m ON dates.date = m.date AND m.user_id = ?
            LEFT JOIN meal_foods mf ON m.id = mf.meal_id
            GROUP BY dates.date
            ORDER BY dates.date;
        `;

        const [rows] = await pool.query(combinedSql, [
            userId, startDate, queryEndDate, // for daily_steps dates
            userId, startDate, queryEndDate, // for meals dates
            userId, userId
        ]);

        const weeklySummary = rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            steps: row.steps,
            caloriesBurned: Math.round(row.steps * 0.04), // 1 step = 0.04 kcal
            totalConsumedCalories: Math.round(row.totalConsumedCalories)
        }));

        res.json(weeklySummary);

    } catch (err) {
        console.error('Get weekly summary error:', err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;