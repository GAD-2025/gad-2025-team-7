import React from 'react';
import './Calendar.css';

const Calendar = ({ nav, setNav, selectedDate, setSelectedDate, events }) => {
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
                            return (
                                <div
                                    key={index}
                                    className={`date-cell ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedDate(dayInfo.dayString)}
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
