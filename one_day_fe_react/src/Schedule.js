import React from 'react';

const Schedule = ({ selectedDate, events, setEvents }) => {
    const eventsForDay = events.filter(e => e.date === selectedDate);

    const toggleEventCompletion = (eventId) => {
        setEvents(events.map(event => 
            event.id === eventId ? { ...event, completed: !event.completed } : event
        ));
    };

    const deleteEvent = (eventId) => {
        setEvents(events.filter(event => event.id !== eventId));
    };

    return (
        <div className="dashboard-section schedule-main">
            <div className="section-header">
                <h3>오늘의 일정</h3>
                <div className="header-actions">
                    <button className="add-btn" id="add-schedule-btn">+</button>
                </div>
            </div>

            <div id="schedule-list" className="section-content">
                {eventsForDay.length === 0 ? (
                    <p>등록된 일정이 없습니다.</p>
                ) : (
                    <ul>
                        {eventsForDay.map(event => (
                            <li key={event.id} className={event.completed ? 'completed' : ''}>
                                <input 
                                    type="checkbox" 
                                    checked={event.completed} 
                                    onChange={() => toggleEventCompletion(event.id)} 
                                />
                                <span>{event.isImportant ? '[중요] ' : ''}{event.title}</span>
                                <button className="delete-item-btn" onClick={() => deleteEvent(event.id)}>×</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Schedule;
