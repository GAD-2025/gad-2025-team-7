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
    const [showTodoForm, setShowTodoForm] = useState(false);

    // Schedule Modal State
    const [newScheduleTitle, setNewScheduleTitle] = useState('');
    const [newScheduleImportant, setNewScheduleImportant] = useState(false);
    const [newScheduleAllday, setNewScheduleAllday] = useState(false);
    const [newScheduleRepeat, setNewScheduleRepeat] = useState(false);
    const [newScheduleTime, setNewScheduleTime] = useState('');
    const [newScheduleDayOfWeek, setNewScheduleDayOfWeek] = useState([]);
    const [newScheduleStartDate, setNewScheduleStartDate] = useState(selectedDate);
    const [newScheduleEndDate, setNewScheduleEndDate] = useState('');
    const [newScheduleSetReminder, setNewScheduleSetReminder] = useState(false); // New state for reminder setting


    // Todo Form State
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoRepeat, setNewTodoRepeat] = useState(false);
    const [newTodoEndDate, setNewTodoEndDate] = useState('');

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
            setNewScheduleImportant(false);
            setNewScheduleAllday(false);
            setNewScheduleRepeat(false);
            setNewScheduleTime('');
            setNewScheduleDayOfWeek([]);
            setNewScheduleStartDate(selectedDate);
            setNewScheduleEndDate('');
            setNewScheduleSetReminder(false); // Reset new state
            setShowScheduleModal(false); // Use prop setter
        };

        if (newScheduleRepeat) {
            const dayMapping = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
            let recurringEvents = [];
            let currentDate = new Date(newScheduleStartDate);
            let endDate = new Date(newScheduleEndDate);

            while (currentDate <= endDate) {
                const dayOfWeek = dayMapping[currentDate.getDay()];
                if (newScheduleDayOfWeek.includes(dayOfWeek)) {
                    const newEvent = {
                        id: Date.now() + recurringEvents.length, // Ensure unique ID
                        date: currentDate.toISOString().split('T')[0],
                        title: newScheduleTitle,
                        isImportant: newScheduleImportant,
                        isAllDay: newScheduleAllday,
                        isRepeat: true,
                        time: newScheduleTime,
                        category: 'personal',
                        completed: false,
                        setReminder: newScheduleSetReminder // Include new state
                    };
                    recurringEvents.push(newEvent);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setEvents([...events, ...recurringEvents]);
        } else {
            // Handle single day or dragged range event
            const start = new Date(newScheduleStartDate);
            const end = new Date(newScheduleEndDate || newScheduleStartDate); // If no end date, it's a single day

            let newEvents = [];
            let currentDate = new Date(start);
            while (currentDate <= end) {
                const newEvent = {
                    id: Date.now() + newEvents.length, // Ensure unique ID for each day's event
                    date: currentDate.toISOString().split('T')[0],
                    title: newScheduleTitle,
                    isImportant: newScheduleImportant,
                    isAllDay: newScheduleAllday,
                    isRepeat: false,
                    time: newScheduleTime,
                    category: 'personal',
                    completed: false,
                    setReminder: newScheduleSetReminder // Include new state
                };
                newEvents.push(newEvent);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setEvents([...events, ...newEvents]);
        }
        
        resetForm();
    };

    const handleSaveTodo = () => {
        if (newTodoTitle) {
            const newTodo = {
                id: Date.now(),
                date: selectedDate,
                title: newTodoTitle,
                completed: false,
            };
            setTodos([...todos, newTodo]);
            setShowTodoForm(false);
            // Reset form
            setNewTodoTitle('');
            setNewTodoRepeat(false);
            setNewTodoEndDate('');
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
                            <button className="add-btn" onClick={() => setShowTodoForm(!showTodoForm)}>+</button>
                        </div>
                    </div>
                    {showTodoForm && (
                        <div id="add-todo-form" className="inline-form">
                            <input
                                type="text"
                                placeholder="새로운 할 일"
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                            />
                            <div>
                                <label><input type="checkbox" checked={newTodoRepeat} onChange={() => setNewTodoRepeat(!newTodoRepeat)} /> 매주 반복</label>
                            </div>
                            {newTodoRepeat && (
                                <div id="repeat-end-date-container">
                                    <label htmlFor="new-todo-end-date">언제까지:</label>
                                    <input
                                        type="date"
                                        id="new-todo-end-date"
                                        value={newTodoEndDate}
                                        onChange={(e) => setNewTodoEndDate(e.target.value)}
                                    />
                                </div>
                            )}
                            <button onClick={handleSaveTodo}>저장</button>
                        </div>
                    )}
                    <TodoList selectedDate={selectedDate} todos={todos} setTodos={setTodos} />
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
                <div>
                    <label><input type="checkbox" checked={newScheduleImportant} onChange={() => setNewScheduleImportant(!newScheduleImportant)} /> 중요</label>
                    <label><input type="checkbox" checked={newScheduleAllday} onChange={() => setNewScheduleAllday(!newScheduleAllday)} /> 하루 종일</label>
                    <label><input type="checkbox" checked={newScheduleRepeat} onChange={() => setNewScheduleRepeat(!newScheduleRepeat)} /> 반복</label>
                    <label><input type="checkbox" checked={newScheduleSetReminder} onChange={() => setNewScheduleSetReminder(!newScheduleSetReminder)} /> 리마인더 설정</label> {/* New checkbox */}
                </div>
                
                {!newScheduleAllday && <input type="time" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} />}
                
                {newScheduleRepeat && (
                    <div className="repeat-options">
                        <div>
                            <label>시작일:</label>
                            <input type="date" value={newScheduleStartDate} onChange={(e) => setNewScheduleStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label>종료일:</label>
                            <input type="date" value={newScheduleEndDate} onChange={(e) => setNewScheduleEndDate(e.target.value)} />
                        </div>
                        <select multiple value={newScheduleDayOfWeek} onChange={(e) => setNewScheduleDayOfWeek(Array.from(e.target.selectedOptions, option => option.value))}>
                            <option value="">요일 선택</option>
                            <option value="sun">일요일</option>
                            <option value="mon">월요일</option>
                            <option value="tue">화요일</option>
                            <option value="wed">수요일</option>
                            <option value="thu">목요일</option>
                            <option value="fri">금요일</option>
                            <option value="sat">토요일</option>
                        </select>
                    </div>
                )}

                <div className="modal-actions">
                    <button onClick={handleSaveSchedule}>저장</button>
                    <button onClick={() => setShowScheduleModal(false)}>취소</button>
                </div>
            </Modal>
        </div>
    );
};

export default HomeTab;

