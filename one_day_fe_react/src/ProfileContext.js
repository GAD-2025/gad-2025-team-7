import React, { createContext, useState, useEffect, useContext } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({ nickname: 'Guest', profileImage: null });
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        setLoading(true);
        const userId = localStorage.getItem('userId');

        if (!userId) {
            setProfile({ nickname: 'Guest', profileImage: null });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/auth/profile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setProfile({
                    userId: data.id, // Store the user ID from response
                    nickname: data.username,
                    profileImage: data.profile_image_url ? `http://localhost:3001${data.profile_image_url}` : null
                });
            } else {
                console.error('Failed to fetch profile, using default.');
                setProfile({ nickname: 'Guest', profileImage: null });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile({ nickname: 'Guest', profileImage: null });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    // This function will be called from the profile page after a successful update
    const updateProfileContext = (newProfileData) => {
        const { id, username, profile_image_url } = newProfileData;
        const newImage = profile_image_url ? `http://localhost:3001${profile_image_url}` : profile.profileImage;
        
        setProfile({
            userId: id,
            nickname: username || profile.nickname,
            profileImage: newImage
        });
    };

    const value = {
        profile,
        loading,
        updateProfileContext, // Expose the context update function
        refreshProfile: fetchProfile // Allow components to manually trigger a refresh
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
