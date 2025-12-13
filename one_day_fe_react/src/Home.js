import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import './SlideOutNav.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';
// Profile component is no longer used directly here
import SlideOutNav from './SlideOutNav';

const Home = () => {
    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [nav, setNav] = useState(0);
    const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
    const [dashboardEvents, setDashboardEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [todos, setTodos] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [isSlideOutNavOpen, setIsSlideOutNavOpen] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDayString, setDragStartDayString] = useState(null);
    const [dragEndDayString, setDragEndDayString] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [initialEventStartDate, setInitialEventStartDate] = useState(null);
    const [initialEventEndDate, setInitialEventEndDate] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId || !selectedDate) return;
        
        // Removed user profile fetch, now handled by context

        fetch(`http://localhost:3001/api/events/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch day events')))
            .then(setDashboardEvents)
            .catch(console.error);

        fetch(`http://localhost:3001/api/todos/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch todos')))
            .then(setTodos)
            .catch(console.error);

    }, [userId, selectedDate, lastUpdated]);

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
            <button className="bookmark-btn" onClick={() => setIsSlideOutNavOpen(true)}></button>
            <SlideOutNav isOpen={isSlideOutNavOpen} onClose={() => setIsSlideOutNavOpen(false)} />
            
            {/* Removed the old profile settings button and modal */}
            <Calendar
                nav={nav}
                setNav={setNav}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                events={calendarEvents}
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
                dayEvents={dashboardEvents}
                monthEvents={calendarEvents}
                todos={todos}
                onDataUpdate={onDataUpdate}
                showEventModal={showEventModal}
                setShowEventModal={setShowEventModal}
                initialEventStartDate={initialEventStartDate}
                initialEventEndDate={initialEventEndDate}
            />

        </div>
    );
};

export default Home;
