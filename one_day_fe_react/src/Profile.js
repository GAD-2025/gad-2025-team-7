import React, { useState, useEffect } from 'react';
import './Profile.css';
import ImageUploader from './ImageUploader'; // Import ImageUploader

// Helper function to calculate D-day
const calculateDday = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Use Math.ceil to count current day as D-day 0

    if (diffDays === 0) return 'D-day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
};

const Profile = ({ onClose }) => {
    const [profileName, setProfileName] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [isProfileSaved, setIsProfileSaved] = useState(false);
    const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
    const [showAddDdayModal, setShowAddDdayModal] = useState(false);
    const [ddayName, setDdayName] = useState('');
    const [ddayDate, setDdayDate] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('❤️'); // New state for selected icon
    const [ddayList, setDdayList] = useState([]);

    useEffect(() => {
        const savedProfileName = localStorage.getItem('userProfileName');
        const savedProfilePictureUrl = localStorage.getItem('userProfilePictureUrl');
        const savedDdayList = JSON.parse(localStorage.getItem('ddayList')) || [];

        if (savedProfileName) {
            setProfileName(savedProfileName);
            setIsProfileSaved(true);
        }
        if (savedProfilePictureUrl) {
            setProfilePictureUrl(savedProfilePictureUrl);
        }
        setDdayList(savedDdayList);
    }, []);

    useEffect(() => {
        localStorage.setItem('ddayList', JSON.stringify(ddayList));
    }, [ddayList]);

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
        const savedProfileName = localStorage.getItem('userProfileName');
        const savedProfilePictureUrl = localStorage.getItem('userProfilePictureUrl');
        setProfileName(savedProfileName || '');
        setProfilePictureUrl(savedProfilePictureUrl || '');
        setIsEditingPersonalInfo(false);
    };

    const handleAddDday = () => {
        if (ddayName.trim() && ddayDate && selectedIcon) {
            const newDday = {
                id: Date.now(),
                name: ddayName.trim(),
                startDate: ddayDate,
                icon: selectedIcon,
            };
            setDdayList((prevList) => [...prevList, newDday]);
            setDdayName('');
            setDdayDate('');
            setSelectedIcon('❤️');
            setShowAddDdayModal(false);
        } else {
            alert('D-day 이름, 시작일, 아이콘을 모두 입력해주세요.');
        }
    };

    const handleDeleteDday = (id) => {
        setDdayList((prevList) => prevList.filter((dday) => dday.id !== id));
    };

    const handleCancelAddDday = () => {
        setDdayName('');
        setDdayDate('');
        setSelectedIcon('❤️');
        setShowAddDdayModal(false);
    };

    return (
        <div className="profile-container">
            <button onClick={onClose} className="close-profile-modal-button">닫기</button>
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
                        <label htmlFor="profilePictureUrl">프로필 사진:</label> {/* Changed label */}
                        <ImageUploader onImageUpload={setProfilePictureUrl} /> {/* ImageUploader component */}
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
                            <p>표시할 D-day</p>
                            {ddayList.map((dday) => (
                                <div key={dday.id} className="dday-item">
                                    <span>{dday.icon} {dday.name}: {calculateDday(dday.startDate)}</span>
                                    <button onClick={() => handleDeleteDday(dday.id)} className="delete-dday-button">x</button>
                                </div>
                            ))}
                            <button onClick={() => setShowAddDdayModal(true)} className="add-dday-button">+</button>
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

            {/* D-day Add Modal */}
            {showAddDdayModal && (
                <div className="dday-modal-overlay">
                    <div className="dday-modal-content">
                        <h2>D-day 추가</h2>
                        <div className="profile-form-group">
                            <label htmlFor="ddayName">이름:</label>
                            <input
                                type="text"
                                id="ddayName"
                                value={ddayName}
                                onChange={(e) => setDdayName(e.target.value)}
                                placeholder="D-day+명을 입력하세요."
                            />
                        </div>
                        <div className="profile-form-group">
                            <label htmlFor="ddayDate">시작일:</label>
                            <input
                                type="date"
                                id="ddayDate"
                                value={ddayDate}
                                onChange={(e) => setDdayDate(e.target.value)}
                            />
                        </div>
                        <div className="profile-form-group">
                            <label>아이콘 선택:</label>
                            <div className="icon-selection">
                                <button
                                    className={`icon-button ${selectedIcon === '❤️' ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon('❤️')}
                                >
                                    ❤️
                                </button>
                                <button
                                    className={`icon-button ${selectedIcon === '✏️' ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon('✏️')}
                                >
                                    ✏️
                                </button>
                                <button
                                    className={`icon-button ${selectedIcon === '📝' ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon('📝')}
                                >
                                    📝
                                </button>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <button onClick={handleAddDday} className="save-button">저장</button>
                            <button onClick={handleCancelAddDday} className="back-button">취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
