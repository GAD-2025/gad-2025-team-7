const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

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
        const [existingUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ msg: '이미 사용중인 이메일입니다.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
        };

        const [result] = await pool.query('INSERT INTO users SET ?', newUser);

        res.status(201).json({
            msg: '회원가입이 완료되었습니다. 프로필 설정 페이지로 이동합니다.',
            userId: result.insertId
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

module.exports = router;