import React, { useState, useEffect } from 'react';
import './MiniCalendar.css';

const MiniCalendar = ({ selectedDates, onDateChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const renderHeader = () => {
        return (
            <div className="mini-calendar-header">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>&lt;</button>
                <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>&gt;</button>
            </div>
        );
    };

    const renderDays = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        startDate.setDate(monthStart.getDate() - monthStart.getDay()); // Go to Sunday of the first week

        const days = [];
        let day = startDate;
        while (day <= monthEnd || days.length % 7 !== 0) { // Ensure full weeks are rendered
            const dayString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = selectedDates.includes(dayString);

            days.push(
                <div
                    key={dayString}
                    className={`mini-day-cell ${isCurrentMonth ? '' : 'other-month'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => isCurrentMonth && onDateChange(dayString)}
                >
                    {day.getDate()}
                </div>
            );
            day.setDate(day.getDate() + 1);
        }
        return days;
    };

    return (
        <div className="mini-calendar">
            {renderHeader()}
            <div className="mini-calendar-weekdays">
                {weekdays.map(day => <div key={day} className="mini-weekday">{day}</div>)}
            </div>
            <div className="mini-calendar-days">
                {renderDays()}
            </div>
        </div>
    );
};

export default MiniCalendar;