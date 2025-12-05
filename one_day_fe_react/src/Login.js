import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleResponse = (data) => {
        if (data.userId) {
            localStorage.setItem('userId', data.userId);
            window.location.href = '/'; // Redirect to main page
        } else {
            setError(data.msg || data.message || '오류가 발생했습니다.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || '로그인 실패');
            handleResponse(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || '회원가입 실패');
            alert('회원가입이 완료되었습니다! 로그인 해주세요.');
            setIsLogin(true); // Switch to login form
        } catch (err) {
            setError(err.message);
        }
    };

    const showSignup = (e) => {
        e.preventDefault();
        setError('');
        setIsLogin(false);
    };

    const showLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLogin(true);
    };

    return (
        <div className="main-wrapper">
            <div className="info-panel">
                <h2>당신의 하루를<br />한 곳에 담다</h2>
                <p>'One Day'와 함께라면 당신의 모든 순간이<br />더욱 특별해집니다.</p>
            </div>
            <div className="form-wrapper">
                {isLogin ? (
                    <div className="form-container" id="login-form">
                        <h1>One Day</h1>
                        <form onSubmit={handleLogin}>
                            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            {error && <p className="error-message">{error}</p>}
                            <div className="options">
                                <label><input type="checkbox" /> 자동 로그인</label>
                            </div>
                            <button type="submit">로그인</button>
                        </form>
                        <div className="social-login">
                            <p>SNS로 로그인</p>
                            <div className="social-icons">
                                <a href="#" id="google-login"><img src="https://via.placeholder.com/40" alt="Google" /></a>
                                <a href="#" id="naver-login"><img src="https://via.placeholder.com/40" alt="Naver" /></a>
                                <a href="#" id="kakao-login"><img src="https://via.placeholder.com/40" alt="Kakao" /></a>
                            </div>
                        </div>
                        <p className="toggle-form">계정이 없으신가요? <a href="#" id="show-signup" onClick={showSignup}>회원가입</a></p>
                    </div>
                ) : (
                    <div className="form-container" id="signup-form">
                        <h1>One Day</h1>
                        <form onSubmit={handleSignup}>
                            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            {error && <p className="error-message">{error}</p>}
                            <div className="terms">
                                <label><input type="checkbox" required /> 이용약관 동의 (필수)</label>
                                <label><input type="checkbox" required /> 개인정보 수집 및 이용 동의 (필수)</label>
                            </div>
                            <button type="submit">회원가입</button>
                        </form>
                        <p className="toggle-form">이미 계정이 있으신가요? <a href="#" id="show-login" onClick={showLogin}>로그인</a></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
