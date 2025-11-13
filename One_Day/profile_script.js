document.addEventListener('DOMContentLoaded', () => {
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('profile-preview');
    const nicknameInput = document.getElementById('nickname-input');
    const saveProfileBtn = document.getElementById('save-profile');

    // 프로필 사진 미리보기
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 닉네임 특수문자 입력 방지
    nicknameInput.addEventListener('input', (e) => {
        const regex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]*$/;
        if (!regex.test(e.target.value)) {
            alert('닉네임에는 특수문자를 사용할 수 없습니다.');
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
        }
    });

    // 저장 버튼 클릭 이벤트 (기능 추가 시 사용)
    saveProfileBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value;
        if (!nickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        alert(`프로필이 저장되었습니다!\n닉네임: ${nickname}`);
        // 여기서 서버로 프로필 정보를 전송하는 로직을 추가할 수 있습니다.
    });
});
