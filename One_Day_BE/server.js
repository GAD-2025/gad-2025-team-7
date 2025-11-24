const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const healthcareRoutes = require('./routes/healthcare');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
=======
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const port = 3000;

>>>>>>> 769570e3beec0aa0a72e4a0b17a8c59102c6ea83
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

<<<<<<< HEAD
// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/healthcare', healthcareRoutes);

// Basic route for checking if server is up
app.get('/', (req, res) => {
    res.send('One Day Backend Server is running.');
=======
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 정보 저장
        const [result] = await db.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        res.status(201).json({ message: '회원가입이 완료되었습니다.', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 사용중인 이메일입니다.' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다. 다시 시도해주세요.' });
    }
>>>>>>> 769570e3beec0aa0a72e4a0b17a8c59102c6ea83
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> 769570e3beec0aa0a72e4a0b17a8c59102c6ea83
