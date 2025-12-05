import React, { useState, useEffect } from 'react';
import './Profile.css';
import ImageUploader from './ImageUploader';

const Profile = ({ user, onClose, onProfileUpdate }) => {
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [email, setEmail] = useState('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            if (user.profile_image_url) {
                setPreviewImage(`http://localhost:3001${user.profile_image_url}`);
            } else {
                setPreviewImage('');
            }
        }
    }, [user]);

    const handleImageUpload = (file, dataUrl) => {
        setProfileImage(file);
        setPreviewImage(dataUrl);
    };

    const handleSave = async () => {
        if (!userId) return;

        const formData = new FormData();
        formData.append('username', username);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            const res = await fetch(`http://localhost:3001/api/auth/profile/${userId}`, {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                alert('프로필이 성공적으로 업데이트되었습니다.');
                onProfileUpdate(data.user); // Pass the updated user to the parent
            } else {
                const errorData = await res.json();
                alert(`프로필 업데이트 실패: ${errorData.msg}`);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert(`프로필 업데이트 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="profile-container">
            <button onClick={onClose} className="close-profile-modal-button">닫기</button>
            <h1>프로필 설정</h1>

            <div className="profile-form-group">
                <label>프로필 사진:</label>
                <ImageUploader onImageUpload={handleImageUpload} />
                {previewImage && <img src={previewImage} alt="Profile Preview" className="profile-picture-preview" />}
            </div>

            <div className="profile-form-group">
                <label htmlFor="username">닉네임:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                />
            </div>
            
            <div className="profile-form-group">
                <label htmlFor="email">이메일:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    disabled // Email is not editable
                />
            </div>

            <div className="profile-actions">
                <button onClick={handleSave} className="save-button">저장</button>
                <button onClick={onClose} className="back-button">취소</button>
            </div>

            <div className="profile-settings-options">
                <button onClick={() => alert('아이디 변경 기능 준비 중입니다.')} className="settings-button">아이디 변경하기</button>
                <button onClick={() => alert('비밀번호 변경 기능 준비 중입니다.')} className="settings-button">비밀번호 변경하기</button>
            </div>

            <button onClick={handleLogout} className="logout-button">로그아웃</button>
        </div>
    );
};

export default Profile;