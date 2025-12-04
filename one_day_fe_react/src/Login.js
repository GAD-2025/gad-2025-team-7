import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);

    const showSignup = (e) => {
        e.preventDefault();
        setIsLogin(false);
    };

    const showLogin = (e) => {
        e.preventDefault();
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
                        <form>
                            <input type="email" placeholder="이메일" required />
                            <input type="password" placeholder="비밀번호" required />
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
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Simulate successful registration
                            alert('회원가입이 완료되었습니다! 프로필을 설정해주세요.');
                            window.location.href = '/profile-setup';
                        }}>
                            <input type="email" placeholder="이메일" required />
                            <input type="password" placeholder="비밀번호" required />
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
