import React, { useState, useEffect } from 'react';
import './Home.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';
import Profile from './Profile'; // Import the Profile component

const Home = () => {
    const [nav, setNav] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState(JSON.parse(localStorage.getItem('events')) || []);
    const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('todos')) || []);
    const [diaries, setDiaries] = useState(JSON.parse(localStorage.getItem('diaries')) || []);
    const [showProfileModal, setShowProfileModal] = useState(false); // State to control profile modal visibility

    // New states for drag selection
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDayString, setDragStartDayString] = useState(null);
    const [dragEndDayString, setDragEndDayString] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false); // State to control event creation modal
    const [initialEventStartDate, setInitialEventStartDate] = useState(null);
    const [initialEventEndDate, setInitialEventEndDate] = useState(null);

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }, [events, todos, diaries]);

    const handleOpenProfileModal = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
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
                selectedDate={selectedDate}
                events={events}
                setEvents={setEvents}
                todos={todos}
                setTodos={setTodos}
                diaries={diaries}
                setDiaries={setDiaries}
                // Props for event modal from drag selection
                showEventModal={showEventModal}
                setShowEventModal={setShowEventModal}
                initialEventStartDate={initialEventStartDate}
                initialEventEndDate={initialEventEndDate}
            />

            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <Profile onClose={handleCloseProfileModal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;