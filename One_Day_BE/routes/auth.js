const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Use db.js for consistency

// Create a JSON parsing middleware that will be used for specific routes
const jsonParser = express.json();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', jsonParser, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    try {
        // Check for existing user
        const [existingUser] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ msg: '이미 사용중인 이메일입니다.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
        };

        const [result] = await db.query('INSERT INTO users SET ?', newUser);

        res.status(201).json({
            msg: '회원가입이 완료되었습니다.',
            userId: result.insertId
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: `Server error: ${err.message}` });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', jsonParser, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ msg: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ msg: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        res.status(200).json({ msg: '로그인 성공', userId: user.id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: '서버 오류가 발생했습니다. 다시 시도해주세요.' });
    }
});

const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});

const uploadMiddleware = multer({ storage: storage }).single('profileImage');

// @route   POST /api/auth/profile/:userId
// @desc    Update user profile with nickname and/or image
// @access  Private
// IMPORTANT: This route uses multer for multipart/form-data, so it does NOT use the jsonParser.
router.post('/profile/:userId', uploadMiddleware, async (req, res, next) => { // Added next for error handling
    console.log('[PROFILE UPDATE] Route entered.');
    try {
        const { userId } = req.params;
        const { username } = req.body;
        let profileImageUrl = null;

        console.log('[PROFILE UPDATE] UserID:', userId);
        console.log('[PROFILE UPDATE] Request Body (username):', username);
        console.log('[PROFILE UPDATE] Request File (image):', req.file);

        if (req.file) {
            profileImageUrl = `/uploads/${req.file.filename}`;
            console.log('[PROFILE UPDATE] Image URL to be saved:', profileImageUrl);
        }

        const updates = [];
        const params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (profileImageUrl) {
            updates.push('profile_image_url = ?');
            params.push(profileImageUrl);
        }

        if (updates.length === 0) {
            console.log('[PROFILE UPDATE] No data provided. Sending 400.');
            return res.status(400).json({ msg: 'No profile data provided to update.' });
        }

        params.push(userId); // for the WHERE clause

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        console.log('[PROFILE UPDATE] Executing SQL:', sql);
        console.log('[PROFILE UPDATE] With Params:', params);

        await db.query(sql, params);
        console.log('[PROFILE UPDATE] SQL update query successful.');

        const [updatedUsers] = await db.query(
            'SELECT id, username, email, profile_image_url, weight FROM users WHERE id = ?',
            [userId]
        );
        console.log('[PROFILE UPDATE] Fetched updated user, sending response.');

        res.json(updatedUsers[0]);

    } catch (error) {
        console.error('[PROFILE UPDATE] CRITICAL ERROR in route handler:', error);
        // Pass to the global error handler
        next(error);
    }
});

// @route   GET /api/auth/profile/:userId
// @desc    Get user profile
// @access  Private
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [users] = await db.query('SELECT id, username, email, profile_image_url, weight FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
        }
        res.json(users[0]); // Reverted to original response structure
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ msg: `Database error: ${error.message}` });
    }
});

// @route   PUT /api/auth/profile/:userId
// @desc    Update user profile
// @access  Private
router.put('/profile/:userId', jsonParser, async (req, res) => {
    // Simplified handler for weight update
    const { userId } = req.params;
    const { weight } = req.body;

    if (weight === undefined) {
        // If other profile updates are intended, they should be handled here.
        // For now, we are focusing only on the weight update.
        return res.status(400).json({ msg: 'Weight data is required.' });
    }

    try {
        // First, update the weight
        await db.query(
            'UPDATE users SET weight = ? WHERE id = ?',
            [weight, userId]
        );

        // Then, fetch the complete updated user profile
        const [updatedUsers] = await db.query(
            'SELECT id, username, email, profile_image_url, weight FROM users WHERE id = ?',
            [userId]
        );

        if (updatedUsers.length === 0) {
            return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
        }

        // Respond with the updated user object
        res.json(updatedUsers[0]);

    } catch (error) {
        console.error('Update profile (weight) error:', error);
        res.status(500).json({ msg: `서버 오류: ${error.message}` });
    }
});

// @route   PUT /api/auth/change-password/:userId
// @desc    Change user password
// @access  Private
router.put('/change-password/:userId', jsonParser, async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ msg: '모든 필드를 입력해주세요.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: '현재 비밀번호가 일치하지 않습니다.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ msg: '비밀번호가 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ msg: `Database error: ${error.message}` });
    }
});

// @route   PUT /api/auth/change-email/:userId
// @desc    Change user email (ID)
// @access  Private
router.put('/change-email/:userId', jsonParser, async (req, res) => {
    const { userId } = req.params;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
        return res.status(400).json({ msg: '모든 필드를 입력해주세요.' });
    }

    try {
        const [existingUser] = await db.query('SELECT email FROM users WHERE email = ?', [newEmail]);
        if (existingUser.length > 0) {
            return res.status(400).json({ msg: '이미 사용중인 이메일입니다.' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: '비밀번호가 일치하지 않습니다.' });
        }

        await db.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);

        res.json({ msg: '이메일(아이디)이 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error('Change email error:', error);
        res.status(500).json({ msg: `Database error: ${error.message}` });
    }
});


module.exports = router;
