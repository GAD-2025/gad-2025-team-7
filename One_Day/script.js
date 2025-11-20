document.addEventListener('DOMContentLoaded', () => {
    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const signupForm = signupFormContainer.querySelector('form');

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        signupFormContainer.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });

    // 회원가입 처리
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;

        fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.userId) {
                // 회원가입 성공 시 프로필 설정 페이지로 이동
                window.location.href = 'profile_setup.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        });
    });

    // 이메일 로그인
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const overlay = document.getElementById('transition-overlay');
        overlay.classList.add('active');

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 500);
    });

    // 소셜 로그인 버튼 시뮬레이션
    const socialLogins = [
        { id: 'google-login', name: 'Google' },
        { id: 'naver-login', name: 'Naver' },
        { id: 'kakao-login', name: 'Kakao' },
    ];

    socialLogins.forEach(social => {
        const btn = document.getElementById(social.id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`실제 앱에서는 여기에서 ${social.name} 로그인 페이지로 이동하여 인증을 진행합니다.\n\n시뮬레이션을 위해 홈 화면으로 이동합니다.`);
                
                const overlay = document.getElementById('transition-overlay');
                overlay.classList.add('active');

                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 500);
            });
        }
    });
});