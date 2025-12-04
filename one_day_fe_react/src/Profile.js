import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ onClose }) => { // Accept onClose prop
    const [profileName, setProfileName] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [isProfileSaved, setIsProfileSaved] = useState(false);
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

    useEffect(() => {
        const savedProfileName = localStorage.getItem('userProfileName');
        const savedProfilePictureUrl = localStorage.getItem('userProfilePictureUrl');

        if (savedProfileName) {
            setProfileName(savedProfileName);
            setIsProfileSaved(true);
        }
        if (savedProfilePictureUrl) {
            setProfilePictureUrl(savedProfilePictureUrl);
        }
    }, []);

    const handleSavePersonalInfo = () => {
        if (profileName.trim()) {
            localStorage.setItem('userProfileName', profileName.trim());
            localStorage.setItem('userProfilePictureUrl', profilePictureUrl.trim());
            setIsProfileSaved(true);
            setIsEditingPersonalInfo(false);
            alert('개인 정보가 저장되었습니다!');
        } else {
            alert('이름을 입력해주세요.');
        }
    };

    const handleCancelEdit = () => {
        // Revert to saved state or clear if nothing was saved
        const savedProfileName = localStorage.getItem('userProfileName');
        const savedProfilePictureUrl = localStorage.getItem('userProfilePictureUrl');
        setProfileName(savedProfileName || '');
        setProfilePictureUrl(savedProfilePictureUrl || '');
        setIsEditingPersonalInfo(false);
    };

    return (
        <div className="profile-container">
            <button onClick={onClose} className="close-profile-modal-button">닫기</button> {/* Close button */}
            <h1>프로필 설정</h1>

            {isEditingPersonalInfo ? (
                <div className="personal-info-edit-form">
                    <div className="profile-form-group">
                        <label htmlFor="profileName">닉네임:</label>
                        <input
                            type="text"
                            id="profileName"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                        />
                    </div>
                    <div className="profile-form-group">
                        <label htmlFor="profilePictureUrl">프로필 사진 URL:</label>
                        <input
                            type="text"
                            id="profilePictureUrl"
                            value={profilePictureUrl}
                            onChange={(e) => setProfilePictureUrl(e.target.value)}
                            placeholder="프로필 사진 URL을 입력하세요"
                        />
                        {profilePictureUrl && <img src={profilePictureUrl} alt="Profile Preview" className="profile-picture-preview" />}
                    </div>
                    <div className="profile-actions">
                        <button onClick={handleSavePersonalInfo} className="save-button">저장</button>
                        <button onClick={handleCancelEdit} className="back-button">취소</button>
                    </div>
                </div>
            ) : (
                <>
                    {isProfileSaved ? (
                        <div className="profile-display">
                            {profilePictureUrl && <img src={profilePictureUrl} alt="Profile" className="profile-picture" />}
                            <p className="saved-name">{profileName}님</p>
                        </div>
                    ) : (
                        <div className="profile-form-group">
                            <label htmlFor="profileName">닉네임:</label>
                            <input
                                type="text"
                                id="profileName"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                            />
                        </div>
                    )}
                    <div className="profile-actions">
                        {!isProfileSaved && <button onClick={handleSavePersonalInfo} className="save-button">저장</button>}
                    </div>
                </>
            )}

            <div className="profile-settings-options">
                <button onClick={() => setIsEditingPersonalInfo(true)} className="settings-button">개인정보 변경하기</button>
                <button onClick={() => alert('아이디 변경 기능 준비 중입니다.')} className="settings-button">아이디 변경하기</button>
                <button onClick={() => alert('비밀번호 변경 기능 준비 중입니다.')} className="settings-button">비밀번호 변경하기</button>
            </div>
        </div>
    );
};

export default Profile;
