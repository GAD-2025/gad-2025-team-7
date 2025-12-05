const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Use db.js for consistency

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
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
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
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


module.exports = router;