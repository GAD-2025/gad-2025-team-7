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
        <div id="schedule-list" className="section-content">
            {eventsForDay.length === 0 ? (
                <p>등록된 일정이 없습니다.</p>
            ) : (
                <ul>
                    {eventsForDay.map(event => (
                        <li key={event.id} className={`schedule-item ${event.completed ? 'completed' : ''}`}>
                            <input 
                                type="checkbox" 
                                checked={event.completed} 
                                onChange={() => toggleEventCompletion(event.id)} 
                            />
                            <span className="schedule-title">{event.title}</span>
                            {event.time && <span className="schedule-time">{event.time}</span>}
                            <button className="delete-item-btn" onClick={() => deleteEvent(event.id)}>×</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>    );
};

export default Schedule;
