import React, { useState, useEffect } from 'react';
import './Home.css';
import Calendar from './Calendar';
import Dashboard from './Dashboard';

const Home = () => {
    const [nav, setNav] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState(JSON.parse(localStorage.getItem('events')) || []);
    const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('todos')) || []);
    const [diaries, setDiaries] = useState(JSON.parse(localStorage.getItem('diaries')) || []);

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('diaries', JSON.stringify(diaries));
    }, [events, todos, diaries]);

    return (
        <div className="main-content-wrapper">
            <Calendar
                nav={nav}
                setNav={setNav}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                events={events}
            />
            <Dashboard
                selectedDate={selectedDate}
                events={events}
                setEvents={setEvents}
                todos={todos}
                setTodos={setTodos}
                diaries={diaries}
                setDiaries={setDiaries}
            />
        </div>
    );
};

export default Home;