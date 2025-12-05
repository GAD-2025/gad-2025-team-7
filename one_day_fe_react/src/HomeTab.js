import React, { useState, useEffect } from 'react';
import Schedule from './Schedule';
import TodoList from './TodoList';
import Modal from './Modal';
import Template from './Template';

const HomeTab = ({
    userId,
    selectedDate,
    events,
    todos,
    onDataUpdate,
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

    

        const resetScheduleForm = () => {

            setNewScheduleTitle('');

            setNewScheduleTime('');

            setNewScheduleStartDate(selectedDate);

            setNewScheduleEndDate('');

            setNewScheduleSetReminder(false);

            setNewScheduleSelectedDays([]);

            setShowScheduleDayPicker(false);

            setShowScheduleModal(false);

        };

    

        const handleSaveSchedule = async () => {

            if (!newScheduleTitle) return;

    

            const body = {

                userId,

                title: newScheduleTitle,

                time: newScheduleTime || null,

                setReminder: newScheduleSetReminder,

                startDate: newScheduleStartDate,

                endDate: newScheduleEndDate,

                selectedDays: newScheduleSelectedDays,

            };

    

                    try {

    

                        const res = await fetch('http://localhost:3001/api/events', {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify(body),

                });

    

                if (!res.ok) throw new Error('Failed to save schedule');

    

                onDataUpdate(); // Refetch data

                resetScheduleForm();

            } catch (error) {

                console.error('Error saving schedule:', error);

            }

        };

    

        const handleSaveTodo = async () => {

            if (newTodoTitle) {

    

                const body = {

                    userId,

                    title: newTodoTitle,

                    date: selectedDate,

                    selectedDays: newTodoSelectedDays,

                };

    

                            try {

    

                                const res = await fetch('http://localhost:3001/api/todos', {

                        method: 'POST',

                        headers: { 'Content-Type': 'application/json' },

                        body: JSON.stringify(body),

                    });

    

                    if (!res.ok) throw new Error('Failed to save todo');

    

                    onDataUpdate(); // Refetch data

    

                    // Reset form

                    setShowTodoModal(false);

                    setNewTodoTitle('');

                    setNewTodoSelectedDays([]);

                    setShowTodoDayPicker(false);

                } catch (error) {

                    console.error('Error saving todo:', error);

                }

            }

        };

    

        const handleScheduleTemplateClick = async (template) => {
            const body = {
                userId,
                title: template.title,
                startDate: selectedDate,
                category: template.category || 'custom',
            };

            try {
                const res = await fetch('http://localhost:3001/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!res.ok) throw new Error('Failed to save schedule from template');

                onDataUpdate(); // Refetch data
            } catch (error) {
                console.error('Error saving schedule from template:', error);
            }
        };

    

        const handleTodoTemplateClick = async (template) => {
            const body = {
                userId,
                title: template.title,
                date: selectedDate,
            };

            try {
                const res = await fetch('http://localhost:3001/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!res.ok) throw new Error('Failed to save todo from template');

                onDataUpdate(); // Refetch data
            } catch (error) {
                console.error('Error saving todo from template:', error);
            }
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

                        <Schedule selectedDate={selectedDate} events={events} onDataUpdate={onDataUpdate} />

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

                            </div>

                        </Modal>

                        <TodoList selectedDate={selectedDate} todos={todos} onDataUpdate={onDataUpdate} />

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

    

                <Modal show={showScheduleModal} onClose={resetScheduleForm}>

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

                        <button onClick={resetScheduleForm}>취소</button>

                    </div>

                </Modal>

            </div>

        );

    };

    

export default HomeTab;

