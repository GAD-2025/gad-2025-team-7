import React, { useState, useEffect } from 'react';
import './HomeTab.css';
import Modal from './Modal';
import Template from './Template';

const getUrgencyClass = (eventDate, selectedDate) => {
    const today = new Date(selectedDate);
    const date = new Date(eventDate);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'urgency-high'; // D-3 or less
    if (diffDays <= 7) return 'urgency-medium'; // D-7 or less
    return 'urgency-low';
};

const getDday = (eventDate, selectedDate) => {
    const today = new Date(selectedDate);
    const date = new Date(eventDate);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '완료';
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
}

const HomeTab = ({
    userId,
    selectedDate,
    dayEvents,
    todos,
    onDataUpdate,
    showScheduleModal,
    setShowScheduleModal,
    initialScheduleStartDate,
    initialScheduleEndDate,
}) => {
    const [showTodoModal, setShowTodoModal] = useState(false);
    const [newScheduleTitle, setNewScheduleTitle] = useState('');
    const [newScheduleTime, setNewScheduleTime] = useState('');
    const [newScheduleStartDate, setNewScheduleStartDate] = useState(selectedDate);
    const [newScheduleEndDate, setNewScheduleEndDate] = useState('');
    const [newScheduleSetReminder, setNewScheduleSetReminder] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoSelectedDays, setNewTodoSelectedDays] = useState([]);
    const [newScheduleSelectedDays, setNewScheduleSelectedDays] = useState([]);
    const [showTodoDayPicker, setShowTodoDayPicker] = useState(false);
    const [showScheduleDayPicker, setShowScheduleDayPicker] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchUpcomingEvents = async () => {
            setIsLoadingEvents(true);
            const startDate = selectedDate;
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            const endDateString = endDate.toISOString().split('T')[0];
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events/range/${userId}?startDate=${startDate}&endDate=${endDateString}`);
                const data = await res.json();
                if (res.ok) {
                    setUpcomingEvents(data.slice(0, 3));
                } else {
                    setUpcomingEvents([]);
                    console.error("Failed to fetch upcoming events:", data.msg);
                }
            } catch (error) {
                setUpcomingEvents([]);
                console.error("Error fetching upcoming events:", error);
            } finally {
                setIsLoadingEvents(false);
            }
        };
        fetchUpcomingEvents();
    }, [userId, selectedDate, onDataUpdate]);

    const handleShowTodoDayPickerChange = (e) => {
        const isChecked = e.target.checked;
        setShowTodoDayPicker(isChecked);
        if (!isChecked) setNewTodoSelectedDays([]);
    };

    const handleShowScheduleDayPickerChange = (e) => {
        const isChecked = e.target.checked;
        setShowScheduleDayPicker(isChecked);
        if (!isChecked) setNewScheduleSelectedDays([]);
    };

    const handleDayOfWeekChange = (e) => {
        const dayIndex = parseInt(e.target.value, 10);
        if (e.target.checked) setNewTodoSelectedDays([...newTodoSelectedDays, dayIndex]);
        else setNewTodoSelectedDays(newTodoSelectedDays.filter(d => d !== dayIndex));
    };

    const handleScheduleDayOfWeekChange = (e) => {
        const dayIndex = parseInt(e.target.value, 10);
        if (e.target.checked) setNewScheduleSelectedDays([...newScheduleSelectedDays, dayIndex]);
        else setNewScheduleSelectedDays(newScheduleSelectedDays.filter(d => d !== dayIndex));
    };

    useEffect(() => {
        if (showScheduleModal && initialScheduleStartDate) {
            setNewScheduleStartDate(initialScheduleStartDate);
            setNewScheduleEndDate(initialScheduleEndDate || '');
        } else {
            setNewScheduleStartDate(selectedDate);
            setNewScheduleEndDate('');
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
        if (showScheduleDayPicker && !newScheduleEndDate) {
            alert('요일 반복 일정은 종료일을 반드시 지정해야 합니다.');
            return;
        }
        const body = { userId, title: newScheduleTitle, time: newScheduleTime || null, setReminder: newScheduleSetReminder, startDate: newScheduleStartDate, endDate: newScheduleEndDate, selectedDays: newScheduleSelectedDays };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save schedule');
            onDataUpdate();
            resetScheduleForm();
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert(`일정 저장에 실패했습니다: ${error.message}`);
        }
    };

    const handleSaveTodo = async () => {
        if (!newTodoTitle) return;
        const body = { userId, title: newTodoTitle, date: selectedDate, selectedDays: newTodoSelectedDays };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save todo');
            onDataUpdate();
            setShowTodoModal(false);
            setNewTodoTitle('');
            setNewTodoSelectedDays([]);
            setShowTodoDayPicker(false);
        } catch (error) {
            console.error('Error saving todo:', error);
            alert(`투두리스트 저장에 실패했습니다: ${error.message}`);
        }
    };
    
    const handleScheduleTemplateClick = async (template) => {
        const body = { userId, title: template.title, startDate: selectedDate, category: template.category || 'custom' };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save schedule from template');
            onDataUpdate();
        } catch (error) { console.error('Error saving schedule from template:', error); }
    };

    const handleTodoTemplateClick = async (template) => {
        const body = { userId, title: template.title, date: selectedDate };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save todo from template');
            onDataUpdate();
        } catch (error) { console.error('Error saving todo from template:', error); }
    };

    const handleToggleSchedule = async (eventId, currentStatus) => {
        const body = { completed: !currentStatus };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/complete`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to update schedule status');
            onDataUpdate();
        } catch (error) {
            console.error('Error updating schedule status:', error);
        }
    };

    const handleToggleTodo = async (todoId, currentStatus) => {
        const body = { completed: !currentStatus };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${todoId}/complete`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to update todo status');
            onDataUpdate();
        } catch (error) {
            console.error('Error updating todo status:', error);
        }
    };

    return (
        <div className="home-tab-content">
            <div className="dashboard-section-row">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>오늘의 일정</h3>
                    </div>
                    <div className="section-content">
                        {dayEvents.length > 0 ? (
                            dayEvents.map(event => (
                                <div key={event.id} className="schedule-item-detail">
                                    <div className={`checkbox-icon ${event.completed ? 'completed' : ''}`} onClick={() => handleToggleSchedule(event.id, event.completed)}></div>
                                    <span className="schedule-item-title">{event.title}</span>
                                    <span className="schedule-item-time">{event.time}</span>
                                </div>
                            ))
                        ) : (
                            <p>오늘의 일정이 없습니다.</p>
                        )}
                    </div>
                </div>
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>일정 추가</h3>
                        <button className="add-btn" onClick={() => setShowScheduleModal(true)}>+</button>
                    </div>
                    <div className="section-content">
                        <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
                    </div>
                </div>
            </div>

            <div className="dashboard-section-row">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>투두리스트</h3>
                    </div>
                    <div className="section-content">
                        {todos.length > 0 ? (
                            todos.map(todo => (
                                <div key={todo.id} className="todo-item-detail">
                                    <div className={`checkbox-icon ${todo.completed ? 'completed' : ''}`} onClick={() => handleToggleTodo(todo.id, todo.completed)}></div>
                                    <span className="todo-item-title">{todo.title}</span>
                                </div>
                            ))
                        ) : (
                            <p>오늘 할 일이 없습니다.</p>
                        )}
                    </div>
                </div>
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>투두리스트 추가</h3>
                        <button className="add-btn" onClick={() => setShowTodoModal(true)}>+</button>
                    </div>
                    <div className="section-content">
                        <Template type="todo" onTemplateClick={handleTodoTemplateClick} />
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>리마인더</h3>
                </div>
                <div className="reminders-container">
                    {isLoadingEvents ? <p>로딩 중...</p> : upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => (
                            <div key={event.id} className={`reminder-card ${getUrgencyClass(event.date, selectedDate)}`}>
                                <div className="reminder-dday">{getDday(event.date, selectedDate)}</div>
                                <p className="reminder-title">{event.title}</p>
                            </div>
                        ))
                    ) : <p>다가오는 일정이 없습니다.</p>}
                </div>
            </div>

            <Modal show={showTodoModal} onClose={() => setShowTodoModal(false)}>
                <h3>새 투두리스트 추가</h3>
                <input type="text" placeholder="새로운 할 일" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
                <div><label><input type="checkbox" checked={showTodoDayPicker} onChange={handleShowTodoDayPickerChange} /> 요일</label></div>
                {showTodoDayPicker && (
                    <div className="days-of-week">{['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (<label key={day}><input type="checkbox" value={index} onChange={handleDayOfWeekChange} checked={newTodoSelectedDays.includes(index)} />{day}</label>))}</div>
                )}
                <div className="modal-actions"><button onClick={handleSaveTodo}>저장</button><button onClick={() => setShowTodoModal(false)}>취소</button></div>
            </Modal>
            <Modal show={showScheduleModal} onClose={resetScheduleForm}>
                <h3>새 일정 추가</h3>
                <input type="text" placeholder="일정명" value={newScheduleTitle} onChange={(e) => setNewScheduleTitle(e.target.value)} />
                <input type="time" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} />
                <div><label><input type="checkbox" checked={showScheduleDayPicker} onChange={handleShowScheduleDayPickerChange} /> 요일 반복</label></div>
                {showScheduleDayPicker && (
                    <>
                        <div className="days-of-week">{['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (<label key={day}><input type="checkbox" value={index} onChange={handleScheduleDayOfWeekChange} checked={newScheduleSelectedDays.includes(index)} />{day}</label>))}</div>
                        <div><label>종료일: <input type="date" value={newScheduleEndDate} onChange={(e) => setNewScheduleEndDate(e.target.value)} /></label></div>
                    </>
                )}
                <div><label><input type="checkbox" checked={newScheduleSetReminder} onChange={() => setNewScheduleSetReminder(!newScheduleSetReminder)} /> 리마인더 설정</label></div>
                <div className="modal-actions"><button onClick={handleSaveSchedule}>저장</button><button onClick={resetScheduleForm}>취소</button></div>
            </Modal>
        </div>
    );
};

export default HomeTab;
