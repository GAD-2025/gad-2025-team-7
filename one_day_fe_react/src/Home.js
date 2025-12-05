import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';
import Profile from './Profile'; // Import the Profile component

const Home = () => {
    const [nav, setNav] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState([]);
    const [todos, setTodos] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false); // State to control profile modal visibility
    const [user, setUser] = useState(null); // Add user state
    const [lastUpdated, setLastUpdated] = useState(Date.now()); // To trigger refetch

    // New states for drag selection
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDayString, setDragStartDayString] = useState(null);
    const [dragEndDayString, setDragEndDayString] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false); // State to control event creation modal
    const [initialEventStartDate, setInitialEventStartDate] = useState(null);
    const [initialEventEndDate, setInitialEventEndDate] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            window.location.href = '/login';
            return;
        }

        // Fetch user profile
        fetch(`http://localhost:3001/api/auth/profile/${userId}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch user'))
            .then(userData => setUser(userData))
            .catch(error => console.error("Failed to fetch user:", error));

        if (!selectedDate) return;

        // Fetch events for the selected date
        fetch(`http://localhost:3001/api/events/${userId}/${selectedDate}`)
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch events'))
            .then(eventData => setEvents(eventData))
            .catch(error => console.error("Error fetching events:", error));

        // Fetch todos for the selected date
        fetch(`http://localhost:3001/api/todos/${userId}/${selectedDate}`)
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch todos'))
            .then(todoData => setTodos(todoData))
            .catch(error => console.error("Error fetching todos:", error));

    }, [userId, selectedDate, lastUpdated]);

    const onDataUpdate = () => {
        setLastUpdated(Date.now());
    };

    const handleOpenProfileModal = () => {
        setShowProfileModal(true);
    };


    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser);
        setShowProfileModal(false); // Close modal on successful update
    };

    // Drag selection handlers
    const handleDragStart = (dayString) => {
        setIsDragging(true);
        setDragStartDayString(dayString);
        setDragEndDayString(dayString); // Initialize end date to start date
    };

    const handleDragMove = (dayString) => {
        if (isDragging) {
            setDragEndDayString(dayString);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (dragStartDayString && dragEndDayString) {
            // Only show event modal if a range is selected (start and end are different)
            if (dragStartDayString !== dragEndDayString) {
                // Ensure start date is before end date
                const startDate = new Date(dragStartDayString);
                const endDate = new Date(dragEndDayString);
                if (startDate > endDate) {
                    setInitialEventStartDate(dragEndDayString);
                    setInitialEventEndDate(dragStartDayString);
                } else {
                    setInitialEventStartDate(dragStartDayString);
                    setInitialEventEndDate(dragEndDayString);
                }
                setShowEventModal(true); // Open event creation modal
            } else {
                // If it's a single day click, just select the date
                setSelectedDate(dragStartDayString);
            }
        }
        setDragStartDayString(null);
        setDragEndDayString(null);
    };

    return (
        <div className="main-content-wrapper" onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
            <button className="profile-settings-button" onClick={handleOpenProfileModal}>
                프로필 설정
            </button>
            {/* TODO: Consider using react-router-dom for better navigation management */}
            <Calendar
                nav={nav}
                setNav={setNav}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                events={events}
                // Props for drag selection
                isDragging={isDragging}
                dragStartDayString={dragStartDayString}
                dragEndDayString={dragEndDayString}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
            />
            <Dashboard
                userId={userId}
                selectedDate={selectedDate}
                events={events}
                todos={todos}
                onDataUpdate={onDataUpdate} // Pass the refetch function
                // Props for event modal from drag selection
                showEventModal={showEventModal}
                setShowEventModal={setShowEventModal}
                initialEventStartDate={initialEventStartDate}
                initialEventEndDate={initialEventEndDate}
            />

            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <Profile
                            user={user}
                            onClose={handleCloseProfileModal}
                            onProfileUpdate={handleProfileUpdate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;