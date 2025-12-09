import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';
import Profile from './Profile'; // Import the Profile component

const Home = () => {
    const [nav, setNav] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dashboardEvents, setDashboardEvents] = useState([]); // For "Today's Schedule"
    const [calendarEvents, setCalendarEvents] = useState([]); // For Calendar month view
    const [todos, setTodos] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [user, setUser] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // New states for drag selection
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDayString, setDragStartDayString] = useState(null);
    const [dragEndDayString, setDragEndDayString] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [initialEventStartDate, setInitialEventStartDate, ] = useState(null);
    const [initialEventEndDate, setInitialEventEndDate] = useState(null);

    const userId = localStorage.getItem('userId');

    // Effect for data dependent on the selected date (for Dashboard)
    useEffect(() => {
        if (!userId || !selectedDate) return;

        // Fetch user profile
        fetch(`http://localhost:3001/api/auth/profile/${userId}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch user')))
            .then(setUser)
            .catch(console.error);

        // Fetch events for the selected date for "Today's Schedule"
        fetch(`http://localhost:3001/api/events/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch day events')))
            .then(setDashboardEvents)
            .catch(console.error);

        // Fetch todos for the selected date
        fetch(`http://localhost:3001/api/todos/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch todos')))
            .then(setTodos)
            .catch(console.error);

    }, [userId, selectedDate, lastUpdated]);

    // Effect for data dependent on the month view (for Calendar)
    useEffect(() => {
        if (!userId) return;

        const dt = new Date();
        if (nav !== 0) {
            dt.setMonth(new Date().getMonth() + nav);
        }
        const year = dt.getFullYear();
        const month = dt.getMonth();
        const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const lastDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        fetch(`http://localhost:3001/api/events/range/${userId}?startDate=${firstDayOfMonth}&endDate=${lastDayOfMonth}`, { cache: 'no-cache' })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.msg) });
                }
                return res.json();
            })
            .then(setCalendarEvents)
            .catch(error => {
                console.error("Error fetching month events:", error);
            });

    }, [userId, nav, lastUpdated]);

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
        onDataUpdate();
        setShowProfileModal(false);
    };

    // Drag selection handlers
    const handleDragStart = (dayString) => {
        setIsDragging(true);
        setDragStartDayString(dayString);
        setDragEndDayString(dayString);
    };

    const handleDragMove = (dayString) => {
        if (isDragging) {
            setDragEndDayString(dayString);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (dragStartDayString && dragEndDayString) {
            if (dragStartDayString !== dragEndDayString) {
                const startDate = new Date(dragStartDayString);
                const endDate = new Date(dragEndDayString);
                if (startDate > endDate) {
                    setInitialEventStartDate(dragEndDayString);
                    setInitialEventEndDate(dragStartDayString);
                } else {
                    setInitialEventStartDate(dragStartDayString);
                    setInitialEventEndDate(dragEndDayString);
                }
                setShowEventModal(true);
            } else {
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
            <Calendar
                nav={nav}
                setNav={setNav}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                events={calendarEvents} // Pass calendar-specific events
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
                events={dashboardEvents} // Pass dashboard-specific events
                todos={todos}
                onDataUpdate={onDataUpdate}
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