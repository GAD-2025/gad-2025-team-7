import React, { useState, useEffect } from 'react';
import Schedule from './Schedule';
import TodoList from './TodoList';
import Modal from './Modal';
import Template from './Template';

const HomeTab = ({
    selectedDate,
    events,
    setEvents,
    todos,
    setTodos,
    // New props for event modal from drag selection
    showScheduleModal, // This is now a prop
    setShowScheduleModal, // This is now a prop
    initialScheduleStartDate,
    initialScheduleEndDate,
}) => {
    // const [showScheduleModal, setShowScheduleModal] = useState(false); // Removed local state
    const [showTodoModal, setShowTodoModal] = useState(false);

    // Schedule Modal State
    const [newScheduleTitle, setNewScheduleTitle] = useState('');
    const [newScheduleTime, setNewScheduleTime] = useState('');
    const [newScheduleStartDate, setNewScheduleStartDate] = useState(selectedDate);
    const [newScheduleEndDate, setNewScheduleEndDate] = useState('');
    const [newScheduleSetReminder, setNewScheduleSetReminder] = useState(false); // New state for reminder setting


    // Todo Form State
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoSelectedDays, setNewTodoSelectedDays] = useState([]);
    const [newScheduleSelectedDays, setNewScheduleSelectedDays] = useState([]);
    const [showTodoDayPicker, setShowTodoDayPicker] = useState(false);
    const [showScheduleDayPicker, setShowScheduleDayPicker] = useState(false);

    const handleShowTodoDayPickerChange = (e) => {
        const isChecked = e.target.checked;
        setShowTodoDayPicker(isChecked);
        if (!isChecked) {
            setNewTodoSelectedDays([]);
        }
    };

    const handleShowScheduleDayPickerChange = (e) => {
        const isChecked = e.target.checked;
        setShowScheduleDayPicker(isChecked);
        if (!isChecked) {
            setNewScheduleSelectedDays([]);
        }
    };

    const handleDayOfWeekChange = (e) => {
        const dayIndex = parseInt(e.target.value, 10);
        if (e.target.checked) {
            setNewTodoSelectedDays([...newTodoSelectedDays, dayIndex]);
        } else {
            setNewTodoSelectedDays(newTodoSelectedDays.filter(d => d !== dayIndex));
        }
    };

    const handleScheduleDayOfWeekChange = (e) => {
        const dayIndex = parseInt(e.target.value, 10);
        if (e.target.checked) {
            setNewScheduleSelectedDays([...newScheduleSelectedDays, dayIndex]);
        } else {
            setNewScheduleSelectedDays(newScheduleSelectedDays.filter(d => d !== dayIndex));
        }
    };
    // Reminders
    const [reminders, setReminders] = useState([]);

    useEffect(() => {
        const today = new Date(selectedDate);
        const upcomingEvents = events
            .filter(e => new Date(e.date) >= today && e.setReminder) // Filter by setReminder
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 6);
        
        const reminderData = upcomingEvents.map(event => {
            const eventDate = new Date(event.date);
            const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            return { ...event, dDay: diffDays };
        });
        setReminders(reminderData);
    }, [selectedDate, events]);

    useEffect(() => {
        // Initialize dates from drag selection if provided
        if (showScheduleModal && initialScheduleStartDate) {
            setNewScheduleStartDate(initialScheduleStartDate);
            setNewScheduleEndDate(initialScheduleEndDate || initialScheduleStartDate); // If only start date, end date is same
        } else {
            setNewScheduleStartDate(selectedDate);
            setNewScheduleEndDate(''); // Clear end date if not from drag
        }
    }, [selectedDate, showScheduleModal, initialScheduleStartDate, initialScheduleEndDate]);

    const handleSaveSchedule = () => {
        if (!newScheduleTitle) return;

        const resetForm = () => {
            setNewScheduleTitle('');
            setNewScheduleTime('');
            setNewScheduleStartDate(selectedDate);
            setNewScheduleEndDate('');
            setNewScheduleSetReminder(false);
            setNewScheduleSelectedDays([]);
            setShowScheduleDayPicker(false);
            setShowScheduleModal(false);
        };

        let newEvents = [];
        if (newScheduleSelectedDays.length > 0) {
            const startDate = new Date(newScheduleStartDate);
            for (let i = 0; i < 365; i++) {
                const day = new Date(startDate);
                day.setDate(day.getDate() + i);

                if (newScheduleSelectedDays.includes(day.getDay())) {
                    const newEvent = {
                        id: Date.now() + i,
                        date: day.toISOString().split('T')[0],
                        title: newScheduleTitle,
                        time: newScheduleTime,
                        category: 'personal',
                        completed: false,
                        setReminder: newScheduleSetReminder
                    };
                    newEvents.push(newEvent);
                }
            }
        } else {
            // Handle single day or dragged range event
            const start = new Date(newScheduleStartDate);
            const end = new Date(newScheduleEndDate || newScheduleStartDate); // If no end date, it's a single day

            let currentDate = new Date(start);
            while (currentDate <= end) {
                const newEvent = {
                    id: Date.now() + newEvents.length, // Ensure unique ID for each day's event
                    date: currentDate.toISOString().split('T')[0],
                    title: newScheduleTitle,
                    time: newScheduleTime,
                    category: 'personal',
                    completed: false,
                    setReminder: newScheduleSetReminder
                };
                newEvents.push(newEvent);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        setEvents([...events, ...newEvents]);
        resetForm();
    };

    const handleSaveTodo = () => {
        if (newTodoTitle) {
            let newTodos = [];
            if (newTodoSelectedDays.length > 0) {
                const startDate = new Date(selectedDate);
                for (let i = 0; i < 365; i++) {
                    const day = new Date(startDate);
                    day.setDate(day.getDate() + i);

                    if (newTodoSelectedDays.includes(day.getDay())) {
                        const newTodo = {
                            id: Date.now() + i,
                            date: day.toISOString().split('T')[0],
                            title: newTodoTitle,
                            completed: false,
                        };
                        newTodos.push(newTodo);
                    }
                }
            } else {
                const newTodo = {
                    id: Date.now(),
                    date: selectedDate,
                    title: newTodoTitle,
                    completed: false,
                };
                newTodos.push(newTodo);
            }

            setTodos([...todos, ...newTodos]);
            setShowTodoModal(false);
            // Reset form
            setNewTodoTitle('');
            setNewTodoSelectedDays([]);
            setShowTodoDayPicker(false);
        }
    };

    const handleScheduleTemplateClick = (template) => {
        const newEvent = {
            id: Date.now(),
            date: selectedDate,
            title: template.title,
            category: template.category || 'custom',
            completed: false,
            setReminder: false, // Default for template events
        };
        setEvents([...events, newEvent]);
    };

    const handleTodoTemplateClick = (template) => {
        const newTodo = {
            id: Date.now(),
            date: selectedDate,
            title: template.title,
            completed: false,
        };
        setTodos([...todos, newTodo]);
    };

    return (
        <div id="home-tab" className="dash-tab-content active">
            <div className="schedule-container">
                <div className="dashboard-section schedule-main">
                    <div className="section-header">
                        <h3>오늘의 일정</h3>
                        <div className="header-actions">
                            <button className="add-btn" onClick={() => setShowScheduleModal(true)}>+</button>
                        </div>
                    </div>
                    <Schedule selectedDate={selectedDate} events={events} setEvents={setEvents} />
                </div>

                <div className="dashboard-section schedule-add">
                    <div className="section-header">
                        <h3>일정 추가</h3>
                    </div>
                    <div className="section-content">
                        <p>새로운 일정을 추가하려면 위 버튼을 클릭하세요.</p>
                    </div>
                    <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
                </div>
            </div>

            <div className="todo-container">
                <div className="dashboard-section todo-main">
                    <div className="section-header">
                        <h3>투두리스트</h3>
                                            <div className="header-actions">
                                                <button className="add-btn" onClick={() => setShowTodoModal(true)}>+</button>
                                            </div>
                                        </div>
                                        <Modal show={showTodoModal} onClose={() => setShowTodoModal(false)}>
                                            <h3>새 투두리스트 추가</h3>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            placeholder="새로운 할 일"
                                                                                                            value={newTodoTitle}
                                                                                                            onChange={(e) => setNewTodoTitle(e.target.value)}
                                                                                                        />
                                                                                                        <div>
                                                                                                            <label>
                                                                                                                <input type="checkbox" checked={showTodoDayPicker} onChange={handleShowTodoDayPickerChange} />
                                                                                                                요일
                                                                                                            </label>
                                                                                                        </div>
                                                                                                        {showTodoDayPicker && (
                                                                                                            <div className="days-of-week">
                                                                                                                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                                                                                                    <label key={day}>
                                                                                                                        <input
                                                                                                                            type="checkbox"
                                                                                                                            value={index}
                                                                                                                            onChange={handleDayOfWeekChange}
                                                                                                                            checked={newTodoSelectedDays.includes(index)}
                                                                                                                        />
                                                                                                                        {day}
                                                                                                                    </label>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div className="modal-actions">
                                                                                                            <button onClick={handleSaveTodo}>저장</button>
                                                                                                            <button onClick={() => setShowTodoModal(false)}>취소</button>
                                                                                                        </div>                                                            </Modal>                                        <TodoList selectedDate={selectedDate} todos={todos} setTodos={setTodos} />
                                    </div>
                <div className="dashboard-section todo-add">
                    <div className="section-header">
                        <h3>투두리스트 추가</h3>
                    </div>
                    <Template type="todo" onTemplateClick={handleTodoTemplateClick} />
                </div>
            </div>
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>리마인더</h3>
                </div>
                <div id="reminder-list" className="section-content reminder-grid">
                    {reminders.length > 0 ? (
                        reminders.map(reminder => (
                            <div key={reminder.id} className="reminder-card" style={{ backgroundColor: reminder.dDay <= 3 ? 'var(--primary-color)' : 'white', color: reminder.dDay <= 3 ? 'white' : '#888' }}>
                                <div className="d-day">D-{reminder.dDay}</div>
                                <div className="event-title">{reminder.title}</div>
                            </div>
                        ))
                    ) : (
                        <p>남은 일정이 없습니다.</p>
                    )}
                </div>
            </div>

            <Modal show={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
                <h3>새 일정 추가</h3>
                <input
                    type="text"
                    placeholder="일정명"
                    value={newScheduleTitle}
                    onChange={(e) => setNewScheduleTitle(e.target.value)}
                />
                <input type="time" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} />
                
                <div>
                    <label>
                        <input type="checkbox" checked={showScheduleDayPicker} onChange={handleShowScheduleDayPickerChange} />
                        요일
                    </label>
                </div>
                {showScheduleDayPicker && (
                    <div className="days-of-week">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                            <label key={day}>
                                <input
                                    type="checkbox"
                                    value={index}
                                    onChange={handleScheduleDayOfWeekChange}
                                    checked={newScheduleSelectedDays.includes(index)}
                                />
                                {day}
                            </label>
                        ))}
                    </div>
                )}

                <div>
                    <label><input type="checkbox" checked={newScheduleSetReminder} onChange={() => setNewScheduleSetReminder(!newScheduleSetReminder)} /> 리마인더 설정</label>
                </div>

                <div className="modal-actions">
                    <button onClick={handleSaveSchedule}>저장</button>
                    <button onClick={() => setShowScheduleModal(false)}>취소</button>
                </div>
            </Modal>
        </div>
    );
};

export default HomeTab;

