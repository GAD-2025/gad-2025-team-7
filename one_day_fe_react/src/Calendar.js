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
    // const [isMonthView, setIsMonthView] = useState(true); // Removed

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (event, dayInfo) => {
        setSelectedDate(dayInfo.dayString);
        sessionStorage.setItem('popoverOpenForDate', dayInfo.dayString); // Save popover state

        setClickedCellEl(event.currentTarget);
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
                events: events.filter(e => e.date === dayString),
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