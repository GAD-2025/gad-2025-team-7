import React from 'react';
import './Calendar.css';

const Calendar = ({
    nav,
    setNav,
    selectedDate,
    setSelectedDate,
    events,
    // New props for drag selection
    isDragging,
    dragStartDayString,
    dragEndDayString,
    onDragStart,
    onDragMove,
    onDragEnd,
}) => {
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

    const days = [];
    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;
        if (i > paddingDays) {
            const currentDayDate = new Date(dayString);
            const dayEvents = events.filter(event => {
                const eventStartDate = new Date(event.startDate || event.date); // Use startDate or date
                const eventEndDate = new Date(event.endDate || event.startDate || event.date); // Use endDate or startDate/date

                // Normalize dates to start of day for accurate comparison
                eventStartDate.setHours(0, 0, 0, 0);
                eventEndDate.setHours(0, 0, 0, 0);
                currentDayDate.setHours(0, 0, 0, 0);

                return currentDayDate >= eventStartDate && currentDayDate <= eventEndDate;
            });

            days.push({
                day: i - paddingDays,
                dayString,
                isToday: i - paddingDays === day && nav === 0,
                isSelected: dayString === selectedDate,
                events: dayEvents,
            });
        } else {
            days.push(null);
        }
    }

    // Function to check if a date is within the dragged range
    const isDateInDraggedRange = (currentDayString) => {
        if (!dragStartDayString || !dragEndDayString) return false;

        const start = new Date(dragStartDayString);
        const end = new Date(dragEndDayString);
        const current = new Date(currentDayString);

        // Normalize dates to start of day for accurate comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        current.setHours(0, 0, 0, 0);

        // Ensure minDate is always before maxDate
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
                            const eventClasses = dayInfo.events.map(event => {
                                const eventStartDate = new Date(event.startDate || event.date);
                                const eventEndDate = new Date(event.endDate || event.startDate || event.date);
                                eventStartDate.setHours(0, 0, 0, 0);
                                eventEndDate.setHours(0, 0, 0, 0);
                                const currentDayDate = new Date(dayInfo.dayString);
                                currentDayDate.setHours(0, 0, 0, 0);

                                if (eventStartDate.getTime() === eventEndDate.getTime()) {
                                    return 'event-single';
                                } else if (currentDayDate.getTime() === eventStartDate.getTime()) {
                                    return 'event-start';
                                } else if (currentDayDate.getTime() === eventEndDate.getTime()) {
                                    return 'event-end';
                                } else if (currentDayDate > eventStartDate && currentDayDate < eventEndDate) {
                                    return 'event-middle';
                                }
                                return '';
                            }).join(' ');

                            return (
                                <div
                                    key={index}
                                    className={`date-cell ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isSelected ? 'selected' : ''} ${isInDraggedRange ? 'drag-selected' : ''} ${eventClasses}`}
                                    onClick={() => setSelectedDate(dayInfo.dayString)}
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
        </div>
    );
};

export default Calendar;
