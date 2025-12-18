import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext';
import './ProfileHeader.css';

const ProfileHeader = () => {
    const { profile, loading } = useProfile();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/profile');
    };

    if (loading) {
        return <div className="profile-header-container skeleton"></div>;
    }

    return (
        <div className="profile-header-container" onClick={handleProfileClick}>
            <span className="profile-nickname">{profile.nickname}</span>
            <div className="profile-image-wrapper">
                {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="profile-image" />
                ) : (
                    <div className="profile-image-default"></div>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;
