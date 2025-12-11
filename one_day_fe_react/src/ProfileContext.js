import React, { createContext, useState, useEffect, useContext } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({ userId: 1, nickname: 'Guest', profileImage: null });
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // Assuming user ID 1 for now. This should be dynamic in a real app.
            const response = await fetch('http://localhost:3001/api/auth/profile/1');
            if (response.ok) {
                const data = await response.json();
                setProfile({
                    userId: 1, // Store the user ID
                    nickname: data.username,
                    // Prepend backend URL to the image path
                    profileImage: data.profile_image_url ? `http://localhost:3001${data.profile_image_url}` : null
                });
            } else {
                console.error('Failed to fetch profile, using default.');
                setProfile({ userId: 1, nickname: 'Guest', profileImage: null });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile({ userId: 1, nickname: 'Guest', profileImage: null });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // This function will be called from the profile page after a successful update
    const updateProfileContext = (newProfileData) => {
        const { username, profile_image_url } = newProfileData;
        const newImage = profile_image_url ? `http://localhost:3001${profile_image_url}` : profile.profileImage;
        
        setProfile({
            ...profile,
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
