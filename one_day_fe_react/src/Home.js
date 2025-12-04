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

    return (
        <div className="main-content-wrapper">
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
            />
            <Dashboard
                selectedDate={selectedDate}
                events={events}
                setEvents={setEvents}
                todos={todos}
                setTodos={setTodos}
                diaries={diaries}
                setDiaries={setDiaries}
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