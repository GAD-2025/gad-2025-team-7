import React, { createContext, useState, useEffect, useContext } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    // Add weight to the profile state
    const [profile, setProfile] = useState({ 
        userId: null, 
        nickname: 'Guest', 
        profileImage: null, 
        weight: null 
    });
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        setLoading(true);
        const userId = localStorage.getItem('userId');

        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/auth/profile/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setProfile({
                    userId: data.id,
                    nickname: data.username,
                    profileImage: data.profile_image_url ? `http://localhost:3001${data.profile_image_url}` : null,
                    weight: data.weight || null // Set weight from fetched data
                });
            } else {
                console.error('Failed to fetch profile, using default.');
                setProfile({ userId: null, nickname: 'Guest', profileImage: null, weight: null });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile({ userId: null, nickname: 'Guest', profileImage: null, weight: null });
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

    // This function can be used for general profile updates (like username/image)
    const updateProfileContext = (newProfileData) => {
        const { id, username, profile_image_url, weight } = newProfileData;
        
        setProfile(prev => ({
            ...prev,
            userId: id || prev.userId,
            nickname: username || prev.nickname,
            profileImage: profile_image_url ? `http://localhost:3001${profile_image_url}` : prev.profileImage,
            weight: weight !== undefined ? weight : prev.weight
        }));
    };
    
    // New function specifically for updating weight
    const updateWeight = async (newWeight) => {
        if (!profile.userId) throw new Error("User not logged in");
        
        const response = await fetch(`http://localhost:3001/api/auth/profile/${profile.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: parseFloat(newWeight) }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to update weight');
        }
        
        const updatedProfileData = await response.json();
        // Update the context with the full updated profile from the server
        updateProfileContext(updatedProfileData); 
    };

    const value = {
        profile,
        loading,
        updateProfileContext,
        updateWeight, // Expose the new function
        refreshProfile: fetchProfile
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};