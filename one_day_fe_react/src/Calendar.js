import React, { useState, useEffect, useRef } from 'react';
import './Calendar.css';
import { useData } from './DataContext';
import DaySummaryPopover from './DaySummaryPopover';
// import ViewToggle from './ViewToggle'; // Removed

const Calendar = ({
    nav,
    setNav,
    events,
    isDragging,
    dragStartDayString,
    dragEndDayString,
    onDragStart,
    onDragMove,
    onDragEnd,
    isMonthView, // Accept isMonthView as prop
}) => {
    const { selectedDate, setSelectedDate, pedometerDataByDate } = useData();
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const [popoverDate, setPopoverDate] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const calendarDaysRef = useRef(null);
    const [clickedCellEl, setClickedCellEl] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // New state for user profile
    const [dailyCalorieGoal, setDailyCalorieGoal] = useState(0); // New state for daily calorie goal

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const userId = localStorage.getItem('userId'); // Get userId

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);
                    // Set daily calorie goal from profile or default
                    setDailyCalorieGoal(data.target_calories || 2000); // Use target_calories from profile
                } else {
                    console.error("Failed to fetch user profile:", await res.text());
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };
        fetchUserProfile();
    }, [userId]);

    const handleDateClick = async (event, dayInfo) => {
        setSelectedDate(dayInfo.dayString);
        console.log('Calendar.js - selectedDate after click:', dayInfo.dayString); // Debug log
        sessionStorage.setItem('popoverOpenForDate', dayInfo.dayString); // Save popover state

        setClickedCellEl(event.currentTarget);
        setPopoverDate(dayInfo.dayString);

        // Fetch consumed calories
        let consumedCalories = 0;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/meals/today_calories/${userId}/${dayInfo.dayString}`);
            if (res.ok) {
                const data = await res.json();
                consumedCalories = data.totalCalories;
            } else {
                console.error("Failed to fetch consumed calories:", await res.text());
            }
        } catch (error) {
            console.error("Error fetching consumed calories:", error);
        }

        const todaysEvents = events.filter(e => e.date.split('T')[0] === dayInfo.dayString);
        const completedEventsCount = todaysEvents.filter(e => e.completed).length;
        const steps = pedometerDataByDate[dayInfo.dayString]?.steps || 0;

        // Calculate graph progress for calories
        const graphPathLength = 283; // From Pedometer.js
        let progressPercent = (consumedCalories / dailyCalorieGoal) * 100;
        progressPercent = Math.min(100, Math.max(0, progressPercent));
        const strokeDashoffset = graphPathLength - (graphPathLength * progressPercent) / 100;

        // Fetch todos for the day
        let completedTodosCount = 0;
        let totalTodos = 0;
        try {
            const todosRes = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${userId}/${dayInfo.dayString}`);
            if (todosRes.ok) {
                const todosData = await todosRes.json();
                totalTodos = todosData.length;
                completedTodosCount = todosData.filter(todo => todo.completed).length;
            } else {
                console.error("Failed to fetch todos:", await todosRes.text());
            }
        } catch (error) {
            console.error("Error fetching todos:", error);
        }

        setSummaryData({
            steps: steps,
            completedEvents: completedEventsCount,
            totalEvents: todaysEvents.length,
            completedTodos: completedTodosCount, // New
            totalTodos: totalTodos, // New
            targetCalories: dailyCalorieGoal, // Use the state for target calories
            consumedCalories: consumedCalories,
            calorieGraphProgress: progressPercent, // New
            calorieStrokeDashoffset: strokeDashoffset, // New
            calorieGraphPathLength: graphPathLength, // New
        });
    };

    const handleClosePopover = () => {
        sessionStorage.removeItem('popoverOpenForDate'); // Clear popover state
        setPopoverAnchorEl(null);
        setPopoverDate(null);
        setSummaryData(null);
        setClickedCellEl(null);
    };

    // Effect to set the anchor element after the DOM has been updated
    useEffect(() => {
        if (clickedCellEl) {
            const anchor = clickedCellEl.querySelector('.selected-day-indicator');
            setPopoverAnchorEl(anchor || clickedCellEl);
        }
    }, [popoverDate, clickedCellEl]);

    // On initial mount, check if a popover should be reopened
    useEffect(() => {
        const popoverDateToOpen = sessionStorage.getItem('popoverOpenForDate');
        if (popoverDateToOpen && calendarDaysRef.current) {
            const dayCell = calendarDaysRef.current.querySelector(`[data-date="${popoverDateToOpen}"]`);
            if (dayCell) {
                // Mock event to open popover for the persisted date
                handleDateClick({ currentTarget: dayCell }, { dayString: popoverDateToOpen });
            }
        }
    }, []); // Empty array ensures this runs only once on mount

    const dt = new Date();
    if (nav !== 0) dt.setMonth(new Date().getMonth() + nav);
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const paddingDays = firstDayOfMonth.getDay();

    const days = [];

    if (isMonthView) {
        // Previous month's padding days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = paddingDays; i > 0; i--) {
            days.push({ day: prevMonthLastDay - i + 1, isOtherMonth: true });
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                dayString,
                events: events.filter(e => e.date.split('T')[0] === dayString),
            });
        }

        // Next month's padding days
        const nextMonthDays = 42 - days.length;
        for (let i = 1; i <= nextMonthDays; i++) {
            days.push({ day: i, isOtherMonth: true });
        }
    } else {
        // Week view logic
        const currentSelectedDate = new Date(selectedDate);
        const startOfWeek = new Date(currentSelectedDate);
        startOfWeek.setDate(currentSelectedDate.getDate() - currentSelectedDate.getDay()); // Go to Sunday

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const dayString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            days.push({
                day: day.getDate(),
                dayString,
                isToday: new Date().getFullYear() === day.getFullYear() && new Date().getMonth() === day.getMonth() && new Date().getDate() === day.getDate(),
                isSelected: dayString === selectedDate,
                events: events.filter(e => e.date.split('T')[0] === dayString),
            });
        }
    }

    const isDateInDraggedRange = (currentDayString) => {
        if (!dragStartDayString || !dragEndDayString) return false;
        const start = new Date(dragStartDayString);
        const end = new Date(dragEndDayString);
        const current = new Date(currentDayString);
        start.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0); current.setHours(0, 0, 0, 0);
        const minDate = start < end ? start : end;
        const maxDate = start < end ? end : start;
        return current >= minDate && current <= maxDate;
    };

    return (
        <div className="calendar-wrapper">
            {/* Removed ViewToggle from here */}
            <div className="calendar-header">
                <div className="month-year-container">
                    <p className="month-text">{monthNames[month]}</p>
                    <p className="year-text">{year}</p>
                </div>
                <div className="calendar-nav">
                    <button onClick={() => setNav(nav - 1)} className="nav-btn">&lt;</button>
                    <button onClick={() => setNav(nav + 1)} className="nav-btn">&gt;</button>
                </div>
            </div>

            <div className={`calendar-grid ${!isMonthView ? 'week-view' : ''}`}> {/* Conditionally add week-view class */}
                <div className="calendar-weekdays">
                    {weekdays.map(day => <div key={day} className="weekday">{day}</div>)}
                </div>
                <div className="calendar-days" ref={calendarDaysRef}>
                    {days.map((dayInfo, index) => (
                        <div
                            key={index}
                            data-date={dayInfo.dayString} // Add data-date for easy selection
                            className={`day-cell ${dayInfo.isOtherMonth ? 'other-month' : ''} ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isSelected ? 'selected' : ''} ${isDateInDraggedRange(dayInfo.dayString) ? 'drag-selected' : ''}`}
                            onClick={(e) => dayInfo.dayString && handleDateClick(e, dayInfo)}
                            onMouseDown={() => dayInfo.dayString && onDragStart(dayInfo.dayString)}
                            onMouseEnter={() => dayInfo.dayString && onDragMove(dayInfo.dayString)}
                            onMouseUp={onDragEnd}
                        >
                            <p>{dayInfo.day}</p>
                            {popoverDate === dayInfo.dayString && !dayInfo.isOtherMonth && (
                                <div className="selected-day-indicator"></div>
                            )}
                            <div className="events-container">
                                {dayInfo.events && dayInfo.events.map(event => {
                                    const style = {};
                                    if (event.color) {
                                        style.backgroundColor = event.color;
                                        // Basic luminance check to set text color
                                        try {
                                            const hex = event.color.replace('#', '');
                                            if (hex.length === 6) {
                                                const r = parseInt(hex.substring(0, 2), 16);
                                                const g = parseInt(hex.substring(2, 4), 16);
                                                const b = parseInt(hex.substring(4, 6), 16);
                                                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                                                style.color = luminance > 0.5 ? 'black' : 'white';
                                            }
                                        } catch (e) {
                                            // if color is not a valid hex, do nothing, defaults will be used
                                            console.error("Could not parse event color: ", event.color, e);
                                        }
                                    }

                                    return (
                                        <div
                                            key={event.id}
                                            className="event"
                                            style={style}
                                        >
                                            {event.title}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {popoverAnchorEl && (
                <DaySummaryPopover
                    date={popoverDate}
                    anchorEl={popoverAnchorEl}
                    onClose={handleClosePopover}
                    summaryData={summaryData}
                    isLoading={!summaryData}
                />
            )}
        </div>
    );
};

export default Calendar;