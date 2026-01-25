import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import './Home.css';
import './SlideOutNav.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';
import { useData } from './DataContext';
import ViewToggle from './ViewToggle'; // Import ViewToggle

const Home = () => {
    const { setIsSlideOutNavOpen } = useOutletContext();
    const { selectedDate, setSelectedDate } = useData();
    const [isMonthView, setIsMonthView] = useState(true); // State for month/week view
    
    const [monthOffset, setMonthOffset] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0);
    const [dashboardEvents, setDashboardEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [todos, setTodos] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const [isDragging, setIsDragging] = useState(false); // Re-introduced
    const [dragStartDayString, setDragStartDayString] = useState(null); // Re-introduced
    const [dragEndDayString, setDragEndDayString] = useState(null); // Re-introduced
    const [showEventModal, setShowEventModal] = useState(false);
    const [initialEventStartDate, setInitialEventStartDate] = useState(null);
    const [initialEventEndDate, setInitialEventEndDate] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId || !selectedDate) return;
        console.log('Home.js - userId for dashboardEvents:', userId); // Debug log
        console.log('Home.js - selectedDate for dashboardEvents:', selectedDate); // Debug log
        console.log('Home.js - selectedDate:', selectedDate); // Debug log
        
        fetch(`${process.env.REACT_APP_API_URL}/api/events/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch day events')))
            .then(data => {
                setDashboardEvents(data);
                console.log('Home.js - dashboardEvents:', data); // Debug log
            })
            .catch(console.error);

        fetch(`${process.env.REACT_APP_API_URL}/api/todos/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch todos')))
            .then(setTodos)
            .catch(console.error);

    }, [userId, selectedDate, lastUpdated]);

    useEffect(() => {
        if (!userId) return;

        const dt = new Date();
        if (monthOffset !== 0) {
            dt.setMonth(new Date().getMonth() + monthOffset);
        }
        const year = dt.getFullYear();
        const month = dt.getMonth();
        const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const lastDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        fetch(`${process.env.REACT_APP_API_URL}/api/events/range/${userId}?startDate=${firstDayOfMonth}&endDate=${lastDayOfMonth}`, { cache: 'no-cache' })
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

    }, [userId, monthOffset, lastUpdated]);

    const onDataUpdate = () => {
        setLastUpdated(Date.now());
    };

    const handleDragStart = (dayString) => { // Re-introduced
        setIsDragging(true);
        setDragStartDayString(dayString);
        setDragEndDayString(dayString);
    };

    const handleDragMove = (dayString) => { // Re-introduced
        if (isDragging) {
            setDragEndDayString(dayString);
        }
    };

    const handleDragEnd = () => { // Re-introduced
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
        <div className="home-container" onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
            <ViewToggle isMonthView={isMonthView} setIsMonthView={setIsMonthView} /> {/* Render ViewToggle here */}
            <div className="calendar-dashboard-wrapper"> {/* New wrapper */}
                <div className="calendar-area">
                    <Calendar
                        monthOffset={monthOffset}
                        setMonthOffset={setMonthOffset}
                        weekOffset={weekOffset}
                        setWeekOffset={setWeekOffset}
                        events={calendarEvents}
                        isDragging={isDragging}
                        dragStartDayString={dragStartDayString}
                        dragEndDayString={dragEndDayString}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        isMonthView={isMonthView} // Pass isMonthView to Calendar
                    />
                </div>

                <div className="dashboard-area">
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
            </div>
        </div>
    );
};

export default Home;