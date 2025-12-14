import React, { useState, useEffect } from 'react';
import Schedule from './Schedule';
import TodoList from './TodoList';
import Modal from './Modal';
import Template from './Template';
import './UpcomingEvents.css';

const getUrgencyClass = (eventDate, selectedDate) => {
    const today = new Date(selectedDate);
    const date = new Date(eventDate);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'urgency-high';
    if (diffDays <= 3) return 'urgency-medium';
    if (diffDays <= 7) return 'urgency-low';
    return 'urgency-default';
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
                const res = await fetch(`http://localhost:3001/api/events/range/${userId}?startDate=${startDate}&endDate=${endDateString}`);
                const data = await res.json();
                if (res.ok) {
                    setUpcomingEvents(data.slice(0, 10));
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
            setNewScheduleEndDate(initialScheduleEndDate || ''); // FIX: Default endDate to empty string
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
        // FIX: Add validation for end date when repeating
        if (showScheduleDayPicker && !newScheduleEndDate) {
            alert('요일 반복 일정은 종료일을 반드시 지정해야 합니다.');
            return;
        }
        const body = { userId, title: newScheduleTitle, time: newScheduleTime || null, setReminder: newScheduleSetReminder, startDate: newScheduleStartDate, endDate: newScheduleEndDate, selectedDays: newScheduleSelectedDays };
        try {
            const res = await fetch('http://localhost:3001/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
            const res = await fetch('http://localhost:3001/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
            const res = await fetch('http://localhost:3001/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save schedule from template');
            onDataUpdate();
        } catch (error) { console.error('Error saving schedule from template:', error); }
    };

    const handleTodoTemplateClick = async (template) => {
        const body = { userId, title: template.title, date: selectedDate };
        try {
            const res = await fetch('http://localhost:3001/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save todo from template');
            onDataUpdate();
        } catch (error) { console.error('Error saving todo from template:', error); }
    };

    return (
        <div id="home-tab" className="dash-tab-content active">
            <div className="schedule-container">
                <div className="dashboard-section schedule-main">
                    <div className="section-header"><h3>오늘의 일정</h3><div className="header-actions"><button className="add-btn" onClick={() => setShowScheduleModal(true)}>+</button></div></div>
                    <Schedule selectedDate={selectedDate} events={dayEvents} onDataUpdate={onDataUpdate} />
                </div>
                <div className="dashboard-section schedule-add">
                    <div className="section-header"><h3>일정 추가</h3></div>
                    <div className="section-content"><p>새로운 일정을 추가하려면 위 버튼을 클릭하세요.</p></div>
                    <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
                </div>
            </div>
            <div className="todo-container">
                <div className="dashboard-section todo-main">
                    <div className="section-header"><h3>투두리스트</h3><div className="header-actions"><button className="add-btn" onClick={() => setShowTodoModal(true)}>+</button></div></div>
                    <TodoList selectedDate={selectedDate} todos={todos} onDataUpdate={onDataUpdate} />
                </div>
                <div className="dashboard-section todo-add">
                    <div className="section-header"><h3>투두리스트 추가</h3></div>
                    <Template type="todo" onTemplateClick={handleTodoTemplateClick} />
                </div>
            </div>
            <div className="dashboard-section">
                <div className="section-header"><h3>리마인더</h3></div>
                <div className="upcoming-events-list section-content">
                    {isLoadingEvents ? <p>로딩 중...</p> : upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => (
                            <div key={event.id} className={`upcoming-event-card ${getUrgencyClass(event.date, selectedDate)}`}>
                                <div className="event-card-content">
                                    <p className="event-card-title">{event.title}</p>
                                    <p className="event-card-body">{new Date(event.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</p>
                                </div>
                                <span className="event-card-dday">{getDday(event.date, selectedDate)}</span>
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
