import React, { useState } from 'react';
import './Calendar.css';
import { useData } from './DataContext';
import DaySummaryPopover from './DaySummaryPopover';

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
}) => {
    const { selectedDate, setSelectedDate, pedometerDataByDate } = useData();
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const [popoverDate, setPopoverDate] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [view, setView] = useState('Month'); // 'Month' or 'Week'

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (event, dayInfo) => {
        setSelectedDate(dayInfo.dayString);
        setPopoverAnchorEl(event.currentTarget);
        setPopoverDate(dayInfo.dayString);
        const todaysEvents = events.filter(e => e.date === dayInfo.dayString);
        const completedEventsCount = todaysEvents.filter(e => e.completed).length;
        const steps = pedometerDataByDate[dayInfo.dayString]?.steps || 0;
        setSummaryData({
            steps: steps,
            completedEvents: completedEventsCount,
            totalEvents: todaysEvents.length,
        });
    };

    const handleClosePopover = () => {
        setPopoverAnchorEl(null);
        setPopoverDate(null);
        setSummaryData(null);
    };

    const dt = new Date();
    if (nav !== 0) dt.setMonth(new Date().getMonth() + nav);
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const paddingDays = firstDayOfMonth.getDay();

    const days = [];
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
            isToday: new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === i,
            isSelected: dayString === selectedDate,
            events: events.filter(e => e.date === dayString),
        });
    }

    // Next month's padding days
    const nextMonthDays = 42 - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
        days.push({ day: i, isOtherMonth: true });
    }

    const isDateInDraggedRange = (currentDayString) => {
        if (!dragStartDayString || !dragEndDayString || !currentDayString) return false;
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
            <div className="calendar-header">
                <div className="view-toggle">
                    <button className={view === 'Month' ? 'active' : ''} onClick={() => setView('Month')}>Month</button>
                    <button className={view === 'Week' ? 'active' : ''} onClick={() => setView('Week')}>Week</button>
                </div>
                <div className="month-year-container">
                    <p className="month-text">{monthNames[month]}</p>
                    <p className="year-text">{year}</p>
                </div>
                <div className="calendar-nav">
                    <button onClick={() => setNav(nav - 1)} className="nav-btn">&lt;</button>
                    <button onClick={() => setNav(nav + 1)} className="nav-btn">&gt;</button>
                </div>
            </div>

            <div className="calendar-grid">
                <div className="calendar-weekdays">
                    {weekdays.map(day => <div key={day} className="weekday">{day}</div>)}
                </div>
                <div className="calendar-days">
                    {days.map((dayInfo, index) => (
                        <div
                            key={index}
                            className={`day-cell ${dayInfo.isOtherMonth ? 'other-month' : ''} ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isSelected ? 'selected' : ''} ${isDateInDraggedRange(dayInfo.dayString) ? 'drag-selected' : ''}`}
                            onClick={(e) => dayInfo.dayString && handleDateClick(e, dayInfo)}
                            onMouseDown={() => dayInfo.dayString && onDragStart(dayInfo.dayString)}
                            onMouseEnter={() => dayInfo.dayString && onDragMove(dayInfo.dayString)}
                            onMouseUp={onDragEnd}
                        >
                            <p>{dayInfo.day}</p>
                            {dayInfo.isToday && !dayInfo.isOtherMonth && (
                                <div className="today-dot"></div>
                            )}
                            <div className="events-container">
                                {dayInfo.events && dayInfo.events.map(event => (
                                    <div key={event.id} className="event">
                                        {event.title}
                                    </div>
                                ))}
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
