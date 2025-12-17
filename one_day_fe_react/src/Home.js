import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import './SlideOutNav.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';
import SlideOutNav from './SlideOutNav';
import { useData } from './DataContext'; // Import useData

const imgVector6551 = "https://www.figma.com/api/mcp/asset/13bd5b75-f6e3-45fe-8b16-c4abd3fdeb18";
const imgEllipse6 = "https://www.figma.com/api/mcp/asset/01034083-e09c-4c55-9cd8-edc56181f730";

const Home = () => {
    const { selectedDate, setSelectedDate } = useData(); // Get date from context
    
    const [nav, setNav] = useState(0);
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
        
        fetch(`${process.env.REACT_APP_API_URL}/api/events/${userId}/${selectedDate}`, { cache: 'no-cache' })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch day events')))
            .then(setDashboardEvents)
            .catch(console.error);

        fetch(`${process.env.REACT_APP_API_URL}/api/todos/${userId}/${selectedDate}`, { cache: 'no-cache' })
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
        <div className="home-container" onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
            <button className="bookmark-btn" onClick={() => setIsSlideOutNavOpen(true)}>
                <img src={imgVector6551} alt="Collection" className="bookmark-icon" />
            </button>
            <SlideOutNav isOpen={isSlideOutNavOpen} onClose={() => setIsSlideOutNavOpen(false)} />
            
            <header className="header">
                <div className="logo-container">
                    <p className="logo-text">OneDay</p>
                    <p className="subtitle-text">하루를 하나로 관리하다.</p>
                </div>
                <div className="profile-container">
                    <p className="profile-name">
                        <span className="profile-name-main">수정</span>
                        <span className="profile-name-sub">님</span>
                    </p>
                    <img alt="profile" className="profile-img" src={imgEllipse6} />
                </div>
            </header>

            <div className="calendar-area">
                <Calendar
                    nav={nav}
                    setNav={setNav}
                    events={calendarEvents}
                    isDragging={isDragging}
                    dragStartDayString={dragStartDayString}
                    dragEndDayString={dragEndDayString}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
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
    );
};

export default Home;