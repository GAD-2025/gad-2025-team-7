import React, { useState } from 'react';
import './Calendar.css';
import { useData } from './DataContext'; // Import the hook
import DaySummaryPopover from './DaySummaryPopover'; // Import the new popover component

const Calendar = ({
    nav,
    setNav,
    events,
    // New props for drag selection
    isDragging,
    dragStartDayString,
    dragEndDayString,
    onDragStart,
    onDragMove,
    onDragEnd,
}) => {
    // Get date state and updater from the context
    const { selectedDate, setSelectedDate, getDataForDate } = useData();

    // State for the popover
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const [popoverDate, setPopoverDate] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    const dt = new Date();
    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }
    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dateString = firstDayOfMonth.toLocaleDateString('ko-kr', { weekday: 'long' });
    const paddingDays = weekdays.indexOf(dateString.charAt(0));

    const handleDateClick = async (event, dayInfo) => {
        // Set UI state immediately
        setSelectedDate(dayInfo.dayString);
        setPopoverDate(dayInfo.dayString);
        setPopoverAnchorEl(event.currentTarget);
        setIsLoadingSummary(true);
        setSummaryData(null); // Clear old data

        // Calculate completed events count
        const todaysEvents = events.filter(e => e.date === dayInfo.dayString);
        const completedEventsCount = todaysEvents.filter(e => e.completed).length;

        // Fetch steps data
        const { steps } = await getDataForDate(dayInfo.dayString);

        // Set the combined data
        setSummaryData({
            steps: steps,
            completedEvents: completedEventsCount,
            totalEvents: todaysEvents.length,
        });
        setIsLoadingSummary(false);
    };

    const handleClosePopover = () => {
        setPopoverAnchorEl(null);
        setPopoverDate(null);
        setSummaryData(null);
    };

    const days = [];
    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;
        if (i > paddingDays) {
            days.push({
                day: i - paddingDays,
                dayString,
                isToday: i - paddingDays === day && nav === 0,
                isSelected: dayString === selectedDate,
                events: events.filter(e => e.date === dayString),
            });
        } else {
            days.push(null);
        }
    }

    const isDateInDraggedRange = (currentDayString) => {
        if (!dragStartDayString || !dragEndDayString) return false;

        const start = new Date(dragStartDayString);
        const end = new Date(dragEndDayString);
        const current = new Date(currentDayString);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        current.setHours(0, 0, 0, 0);

        const minDate = start < end ? start : end;
        const maxDate = start < end ? end : start;

        return current >= minDate && current <= maxDate;
    };

    return (
        <div className="left-column">
            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={() => setNav(nav - 1)}>&lt;</button>
                    <h2>{`${year}년 ${month + 1}월`}</h2>
                    <button onClick={() => setNav(nav + 1)}>&gt;</button>
                </div>
                <div className="calendar-grid">
                    {weekdays.map(weekday => <div key={weekday} className="day-name">{weekday}</div>)}
                </div>
                <div className="calendar-body">
                    {days.map((dayInfo, index) => {
                        if (dayInfo) {
                            const isInDraggedRange = isDateInDraggedRange(dayInfo.dayString);
                            return (
                                <div
                                    key={index}
                                    className={`date-cell ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isSelected ? 'selected' : ''} ${isInDraggedRange ? 'drag-selected' : ''}`}
                                    onClick={(e) => handleDateClick(e, dayInfo)}
                                    onMouseDown={() => onDragStart(dayInfo.dayString)}
                                    onMouseEnter={() => onDragMove(dayInfo.dayString)}
                                    onMouseUp={onDragEnd}
                                >
                                    <div className="date-number">{dayInfo.day}</div>
                                    {dayInfo.events.map(event => (
                                        <div key={event.id} className={`event-preview event-${event.category}`}>
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            );
                        } else {
                            return <div key={index} className="date-cell other-month"></div>;
                        }
                    })}
                </div>
            </div>

            {popoverAnchorEl && (
                <DaySummaryPopover
                    date={popoverDate}
                    anchorEl={popoverAnchorEl}
                    onClose={handleClosePopover}
                    summaryData={summaryData}
                    isLoading={isLoadingSummary}
                />
            )}
        </div>
    );
};

export default Calendar;