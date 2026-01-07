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
        setNewScheduleStartDate(selectedDate);
    }, [selectedDate]);

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
                    setUpcomingEvents(data.filter(event => event.setReminder).slice(0, 3));
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

    const handleToggleSchedule = async (eventId, currentStatus) => {
        const body = { completed: !currentStatus };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Failed to update schedule status');
            onDataUpdate();
        } catch (error) {
            console.error('Error updating schedule status:', error);
        }
    };

    const handleDeleteSchedule = async (eventId) => {
        if (!window.confirm('일정을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete schedule');
            onDataUpdate();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert(`일정 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    };
    
    const handleScheduleTemplateClick = (template) => {
        setNewScheduleTitle(template.title);
    };

    const handleTodoTemplateClick = async (template) => {
        const body = { userId, title: template.title, date: selectedDate };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save todo from template');
            onDataUpdate();
        } catch (error) { console.error('Error saving todo from template:', error); }
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hour] = time.split(':');
        return `${parseInt(hour, 10)}시`;
    };
    
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

    const handleShowTodoDayPickerChange = (e) => {
        const isChecked = e.target.checked;
        setShowTodoDayPicker(isChecked);
        if (!isChecked) setNewTodoSelectedDays([]);
    };

    const handleDayOfWeekChange = (e) => {
        const dayIndex = parseInt(e.target.value, 10);
        if (e.target.checked) setNewTodoSelectedDays([...newTodoSelectedDays, dayIndex]);
        else setNewTodoSelectedDays(newTodoSelectedDays.filter(d => d !== dayIndex));
    };
    
    const handleShowScheduleDayPickerChange = (e) => {
        const isChecked = e.target.checked;
        setShowScheduleDayPicker(isChecked);
        if (!isChecked) setNewScheduleSelectedDays([]);
    };

    const handleScheduleDayOfWeekChange = (e) => {
        const dayIndex = parseInt(e.target.value, 10);
        if (e.target.checked) setNewScheduleSelectedDays([...newScheduleSelectedDays, dayIndex]);
        else setNewScheduleSelectedDays(newScheduleSelectedDays.filter(d => d !== dayIndex));
    };

    return (
        <div className="home-tab-content">
            <div className="combined-content-box"> {/* New wrapper */}
                <div className="home-section-grid">
                    {/* 오늘의 일정 */}
                    <div className="dashboard-section">
                        <div className="home-card-header">
                            <h3 className="home-card-title">오늘의 일정</h3>
                        </div>
                        <div className="home-card-body">
                            {dayEvents.length > 0 ? (
                                dayEvents.map(event => (
                                    <div key={event.id} className={`schedule-item ${event.completed ? 'completed' : ''}`}>
                                        <div className="item-checkbox-container" onClick={() => handleToggleSchedule(event.id, event.completed)}>
                                            <div className={`item-checkbox circle ${event.completed ? 'completed' : ''}`}></div>
                                        </div>
                                        <span className={`item-title ${event.completed ? 'completed' : ''}`}>{event.title}</span>
                                        <span className="item-time">{formatTime(event.time)}</span>
                                        <button className="delete-schedule-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(event.id); }}>x</button>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-message">오늘의 일정이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    {/* 일정 추가 */}
                    <div className="dashboard-section">
                        <div className="home-card-header">
                            <h3 className="home-card-title">일정 추가</h3>
                        </div>
                        <div className="home-card-body">
                            <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
                            <button className="home-add-btn" onClick={() => setShowScheduleModal(true)}>+</button>
                        </div>
                    </div>
                </div>

                <div className="home-section-grid">
                    {/* 투두리스트 */}
                    <div className="dashboard-section">
                        <div className="home-card-header">
                            <h3 className="home-card-title">투두리스트</h3>
                        </div>
                        <div className="home-card-body">
                            {todos.length > 0 ? (
                                todos.map(todo => (
                                    <div key={todo.id} className="todo-item" onClick={() => handleToggleTodo(todo.id, todo.completed)}>
                                         <div className="item-checkbox-container">
                                            <div className={`item-checkbox square ${todo.completed ? 'completed' : ''}`}>
                                                {todo.completed && <span className="checkmark">✔</span>}
                                            </div>
                                        </div>
                                        <span className={`item-title ${todo.completed ? 'completed' : ''}`}>{todo.title}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-message">오늘 할 일이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid-separator"></div>

                    {/* 투두리스트 추가 */}
                    <div className="dashboard-section">
                        <div className="home-card-header">
                            <h3 className="home-card-title">투두리스트 추가</h3>
                        </div>
                        <div className="home-card-body">
                           <Template type="todo" onTemplateClick={handleTodoTemplateClick} />
                           <button className="home-add-btn" onClick={() => setShowTodoModal(true)}>+</button>
                        </div>
                    </div>
                </div>
                
                {/* 리마인더 */}
                <div className="dashboard-section">
                    <div className="home-card-header">
                        <h3 className="home-card-title">리마인더</h3>
                    </div>
                    <div className="home-card-body reminder-body">
                         {isLoadingEvents ? <p>로딩 중...</p> : upcomingEvents.length > 0 ? (
                            upcomingEvents.map(event => (
                                <div key={event.id} className={`reminder-card ${getUrgencyClass(event.date, selectedDate)}`}>
                                    <div className="reminder-dday-badge">{getDday(event.date, selectedDate)}</div>
                                    <div className="reminder-title">{event.title}</div>
                                    <button className="delete-reminder-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(event.id); }}>x</button>
                                </div>
                            ))
                        ) : <p className="empty-message">리마인더가 없습니다.</p>}
                    </div>
                </div>
            </div> {/* End of combined-content-box */}

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
                <div className="schedule-modal-header">
                    <h3 className="schedule-modal-title">새 일정 추가</h3>
                    <span className="schedule-modal-date">{new Date(selectedDate).getMonth() + 1}월 {new Date(selectedDate).getDate()}일</span>
                    <button className="modal-close-btn" onClick={resetScheduleForm}>x</button>
                </div>
                <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
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
                <div className="modal-actions"><button onClick={handleSaveSchedule}>저장</button></div>
            </Modal>
        </div>
    );
};

export default HomeTab;
