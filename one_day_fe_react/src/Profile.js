import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed
import './Profile.css';
import ImageUploader from './ImageUploader';
import Modal from './Modal';
import { useProfile } from './ProfileContext'; // Import the context hook

const Profile = ({ show, onClose }) => { // Accept show and onClose props
    const { profile, updateProfileContext } = useProfile(); // Use the context
    // const navigate = useNavigate(); // Removed

    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null); // This is for the new file to be uploaded
    const [previewImage, setPreviewImage] = useState('');
    const [email, setEmail] = useState(''); // Email is not part of the context, will handle separately if needed

    // State for Change Password Modal
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // State for Change Email Modal
    const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [passwordForEmailChange, setPasswordForEmailChange] = useState('');
    const [emailError, setEmailError] = useState('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        // Populate form with data from context
        if (profile) {
            setUsername(profile.username || ''); // Use profile.username
            setPreviewImage(profile.profile_image_url || ''); // Use profile.profile_image_url
            setEmail(profile.email || ''); // Set email from profile
        }
    }, [profile]);

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
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile/${userId}`, {
                method: 'POST', // Changed from PUT to POST
                body: formData,
            });

            if (res.ok) {
                const updatedProfileData = await res.json();
                alert('프로필이 성공적으로 업데이트되었습니다.');
                updateProfileContext(updatedProfileData); // Update the global context
                onClose(); // Close modal after save
            } else {
                const errorData = await res.json();
                alert(`프로필 업데이트 실패: ${errorData.msg}`);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert(`프로필 업데이트 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    // ... (handleChangePassword, handleChangeEmail, handleLogout functions remain largely the same)
    const handleChangePassword = async () => {
        setPasswordError('');
        if (newPassword !== confirmPassword) {
            setPasswordError('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!currentPassword || !newPassword) {
            setPasswordError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/change-password/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.msg);
                setShowChangePasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(data.msg);
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    const handleChangeEmail = async () => {
        setEmailError('');
        if (!newEmail || !passwordForEmailChange) {
            setEmailError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/change-email/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail, password: passwordForEmailChange }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.msg);
                setShowChangeEmailModal(false);
                setNewEmail('');
                setPasswordForEmailChange('');
                // You might want to refresh user data here
            } else {
                setEmailError(data.msg);
            }
        } catch (error) {
            console.error('Failed to change email:', error);
            setEmailError(`이메일 변경 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };


    return (
        <Modal show={show} onClose={onClose}> {/* Wrap content in Modal */}
            <div className="profile-container">
                <h1>프로필 설정</h1>
                <div
                    className="profile-picture-container"
                    style={{ backgroundImage: previewImage ? `url(${previewImage})` : 'none' }}
                >
                    <ImageUploader onImageUpload={handleImageUpload} currentImageUrl={previewImage} />
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
                    <label htmlFor="email">이메일 (아이디):</label>
                    <input
                        type="email"
                        id="email"
                        value={profile.email || ''} // Use profile.email directly
                        disabled
                        placeholder="이메일 정보는 수정할 수 없습니다"
                    />
                </div>

                <div className="profile-actions">
                    <button onClick={handleSave} className="save-button">저장</button>
                    <button onClick={onClose} className="back-button">뒤로</button> {/* Close modal */}
                </div>

                <div className="profile-settings-options">
                    <button onClick={() => setShowChangeEmailModal(true)} className="settings-button">아이디 변경하기</button>
                    <button onClick={() => setShowChangePasswordModal(true)} className="settings-button">비밀번호 변경하기</button>
                </div>

                <button onClick={handleLogout} className="logout-button">로그아웃</button>
            </div>

            {/* Modals remain the same */}
            <Modal show={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)}>
                <h3>비밀번호 변경</h3>
                <div className="profile-form-group">
                    <input
                        type="password"
                        placeholder="현재 비밀번호"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className="profile-form-group">
                    <input
                        type="password"
                        placeholder="새 비밀번호"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="profile-form-group">
                    <input
                        type="password"
                        placeholder="새 비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                {passwordError && <p className="error-message">{passwordError}</p>}
                <div className="modal-actions">
                    <button onClick={handleChangePassword}>변경하기</button>
                    <button onClick={() => setShowChangePasswordModal(false)}>취소</button>
                </div>
            </Modal>

            <Modal show={showChangeEmailModal} onClose={() => setShowChangeEmailModal(false)}>
                <h3>아이디(이메일) 변경</h3>
                <div className="profile-form-group">
                    <input
                        type="email"
                        placeholder="새 이메일"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                </div>
                <div className="profile-form-group">
                    <input
                        type="password"
                        placeholder="현재 비밀번호"
                        value={passwordForEmailChange}
                        onChange={(e) => setPasswordForEmailChange(e.target.value)}
                    />
                </div>
                {emailError && <p className="error-message">{emailError}</p>}
                <div className="modal-actions">
                    <button onClick={handleChangeEmail}>변경하기</button>
                    <button onClick={() => setShowChangeEmailModal(false)}>취소</button>
                </div>
            </Modal>
        </Modal>
    );
};

export default Profile;