import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { HexColorPicker } from "react-colorful"; // Import HexColorPicker
import './HomeTab.css';
import Modal from './Modal';
import Template from './Template';
import ConfirmationModal from './ConfirmationModal';

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
    const [showCreateScheduleTemplateModal, setShowCreateScheduleTemplateModal] = useState(false);
    const [newScheduleTitle, setNewScheduleTitle] = useState('');
    const [newScheduleTemplateTitle, setNewScheduleTemplateTitle] = useState('');
    const [newScheduleTemplateColor, setNewScheduleTemplateColor] = useState('#FFE79D'); // Default color
    const defaultColors = ['#FFE79D', '#9DDBFF', '#A5A5A5', '#9DFFA7', '#FFA544'];
    const [newScheduleTime, setNewScheduleTime] = useState('');
    const [newScheduleStartDate, setNewScheduleStartDate] = useState(selectedDate);
    const [newScheduleEndDate, setNewScheduleEndDate] = useState('');
    const [newScheduleSetReminder, setNewScheduleSetReminder] = useState(false);
    const [showScheduleTimePicker, setShowScheduleTimePicker] = useState(false); // New state for time chip
    const [showScheduleRepeat, setShowScheduleRepeat] = useState(false); // New state for repeat chip
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoSelectedDays, setNewTodoSelectedDays] = useState([]);
    const [newScheduleSelectedDays, setNewScheduleSelectedDays] = useState([]);
    const [showTodoDayPicker, setShowTodoDayPicker] = useState(false);
    const [showScheduleDayPicker, setShowScheduleDayPicker] = useState(false);
    const [newTodoColor, setNewTodoColor] = useState('#FFE79D'); // Default color for todo
    const [showTodoColorPicker, setShowTodoColorPicker] = useState(false); // For todo custom color picker
    const todoColorPickerBtnRef = useRef(null); // Ref for the todo custom color button
    const todoColorPickerPaletteRef = useRef(null); // Ref for the todo color picker palette

    // Effect to close todo color picker on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showTodoColorPicker &&
                todoColorPickerPaletteRef.current &&
                !todoColorPickerPaletteRef.current.contains(event.target) &&
                todoColorPickerBtnRef.current &&
                !todoColorPickerBtnRef.current.contains(event.target)
            ) {
                setShowTodoColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTodoColorPicker]);

    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [showColorPicker, setShowColorPicker] = useState(false); // For custom color picker
    const colorPickerBtnRef = useRef(null); // Ref for the custom color button
    const colorPickerPaletteRef = useRef(null); // Ref for the color picker palette

    // Effect to close color picker on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showColorPicker &&
                colorPickerPaletteRef.current &&
                !colorPickerPaletteRef.current.contains(event.target) &&
                colorPickerBtnRef.current &&
                !colorPickerBtnRef.current.contains(event.target)
            ) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showColorPicker]);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({
        message: '',
        onConfirm: () => {},
    });

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

    const handleDeleteSchedule = (eventId) => {
        setConfirmationModalProps({
            message: '일정을 삭제하시겠습니까?',
            onConfirm: () => {
                (async () => {
                    try {
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`, {
                            method: 'DELETE',
                        });
                        if (!res.ok) throw new Error('Failed to delete schedule');
                        onDataUpdate();
                    } catch (error) {
                        console.error('Error deleting schedule:', error);
                        alert(`일정 삭제 중 오류가 발생했습니다: ${error.message}`);
                    } finally {
                        setShowConfirmationModal(false);
                    }
                })();
            },
        });
        setShowConfirmationModal(true);
    };

    const handleDeleteTodo = (todoId) => {
        setConfirmationModalProps({
            message: '투두를 삭제하시겠습니까?',
            onConfirm: () => {
                (async () => {
                    try {
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${todoId}`, {
                            method: 'DELETE',
                        });
                        if (!res.ok) throw new Error('Failed to delete todo');
                        onDataUpdate();
                    } catch (error) {
                        console.error('Error deleting todo:', error);
                        alert(`투두 삭제 중 오류가 발생했습니다: ${error.message}`);
                    } finally {
                        setShowConfirmationModal(false);
                    }
                })();
            },
        });
        setShowConfirmationModal(true);
    };
    
    const handleScheduleTemplateClick = async (template) => {
        const body = {
            userId,
            title: template.title,
            time: null, // Default to no specific time
            setReminder: false, // Default to no reminder
            startDate: selectedDate, // Default to the currently selected date
            endDate: null, // Default to no end date
            selectedDays: [], // Default to no specific days
        };
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Failed to save schedule from template');
            onDataUpdate(); // Refresh data
        } catch (error) {
            console.error('Error saving schedule from template:', error);
            alert(`템플릿 일정 저장에 실패했습니다: ${error.message}`);
        }
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

    const resetTodoForm = () => {
        setNewTodoTitle('');
        setNewTodoSelectedDays([]);
        setShowTodoDayPicker(false);
        setNewTodoColor('#FFE79D'); // Reset todo color
        setShowTodoModal(false);
    };

    const handleCreateScheduleTemplate = async () => {
        if (!newScheduleTemplateTitle) return;
        const body = { userId, title: newScheduleTemplateTitle, type: 'schedule', color: newScheduleTemplateColor }; // Add color
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Failed to save schedule template');
            onDataUpdate(); // Refresh data
            setShowCreateScheduleTemplateModal(false);
            setNewScheduleTemplateTitle('');
        } catch (error) {
            console.error('Error saving schedule template:', error);
            alert(`일정 템플릿 저장에 실패했습니다: ${error.message}`);
        }
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
        const body = { userId, title: newTodoTitle, date: selectedDate, selectedDays: newTodoSelectedDays, color: newTodoColor }; // Add color
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Failed to save todo');
            onDataUpdate();
            setShowTodoModal(false);
            setNewTodoTitle('');
            setNewTodoSelectedDays([]);
            setShowTodoDayPicker(false);
            setNewTodoColor('#FFE79D'); // Reset color
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

    const handleShowScheduleTimePickerChange = (e) => {
        setShowScheduleTimePicker(e.target.checked);
        if (!e.target.checked) setNewScheduleTime(''); // Clear time if unchecked
    };

    const handleShowScheduleRepeatChange = (e) => {
        setShowScheduleRepeat(e.target.checked);
        if (!e.target.checked) {
            setShowScheduleDayPicker(false); // Hide day picker if repeat is unchecked
            setNewScheduleSelectedDays([]); // Clear selected days
            setNewScheduleEndDate(''); // Clear end date
        }
    };

    const handleOpenCreateTemplateModal = () => {
        setNewScheduleTemplateColor('#FFE79D'); // Reset to default color
        setShowCreateScheduleTemplateModal(true);
    };

    return (
        <div className="home-tab-content dash-tab-content active">
            <div className="combined-content-box"> {/* New wrapper */}
                <div className="home-section-grid schedule-section-grid">
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
                    <div className="dashboard-section add-schedule-section">
                        <div className="home-card-header">
                            <h3 className="home-card-title">일정 추가</h3>
                        </div>
                        <div className="home-card-body">
                            <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
                            <button className="home-add-btn" onClick={() => setShowScheduleModal(true)}>+</button>
                        </div>
                    </div>
                </div>

                <div className="home-section-grid todo-section-grid">
                    {/* 투두리스트 */}
                    <div className="dashboard-section">
                        <div className="home-card-header">
                            <h3 className="home-card-title">투두리스트</h3>
                        </div>
                        <div className="home-card-body">
                            {todos.length > 0 ? (
                                todos.map(todo => (
                                    <div key={todo.id} className="todo-item" >
                                         <div className="item-checkbox-container" onClick={() => handleToggleTodo(todo.id, todo.completed)}>
                                            <div className={`item-checkbox square ${todo.completed ? 'completed' : ''}`}>
                                                {todo.completed && <span className="checkmark">✔</span>}
                                            </div>
                                        </div>
                                        <span className={`item-title ${todo.completed ? 'completed' : ''}`}>{todo.title}</span>
                                        <button className="delete-todo-btn" onClick={(e) => { e.stopPropagation(); handleDeleteTodo(todo.id); }}>x</button>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-message">오늘 할 일이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid-separator"></div>

                    {/* 투두리스트 추가 */}
                    <div className="dashboard-section add-todo-section">
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
                <div className="dashboard-section reminder-section">
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

            <Modal show={showTodoModal} onClose={resetTodoForm}>
                <div className="schedule-modal-header">
                    <h3 className="schedule-modal-title">새 투두리스트 추가</h3>
                    <span className="schedule-modal-date">{new Date(selectedDate).getMonth() + 1}월 {new Date(selectedDate).getDate()}일</span>
                    <button className="modal-close-btn" onClick={resetTodoForm}>x</button>
                </div>
                <input type="text" className="schedule-title-input" placeholder="새로운 할 일" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
                <div className="chip-container">
                    <div><label className="chip-checkbox-label"><input type="checkbox" checked={showTodoDayPicker} onChange={handleShowTodoDayPickerChange} /><span> 요일</span></label></div>
                </div>
                {showTodoDayPicker && (
                    <div className="schedule-option-box">
                        <div className="days-of-week-container">{['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (<label key={day}><input type="checkbox" value={index} onChange={handleDayOfWeekChange} checked={newTodoSelectedDays.includes(index)} />{day}</label>))}</div>
                    </div>
                )}
                <div className="template-color-picker">
                    {defaultColors.map(color => {
                        const isSelected = newTodoColor === color;
                        const style = isSelected
                            ? {
                                borderColor: color,
                                backgroundColor: hexToRgba(color, 0.5),
                                border: '2px solid #d3d3d3',
                              }
                            : { backgroundColor: color, border: '1px solid transparent' };

                        return (
                            <div
                                key={color}
                                className={`color-circle ${isSelected ? 'selected' : ''}`}
                                style={style}
                                onClick={() => setNewTodoColor(color)}
                            ></div>
                        );
                    })}
                    {/* Custom Color Circle for Todo */}
                    <div
                        ref={todoColorPickerBtnRef}
                        className={`color-circle custom-color-circle ${newTodoColor && !defaultColors.includes(newTodoColor) ? 'selected' : ''}`}
                        style={{
                            backgroundColor: newTodoColor,
                            borderColor: newTodoColor,
                            borderStyle: 'solid',
                        }}
                        onClick={() => setShowTodoColorPicker(!showTodoColorPicker)}
                    >
                        {defaultColors.includes(newTodoColor) && (
                            <div className="plus-icon"></div>
                        )}
                    </div>
                </div>
                {showTodoColorPicker && (
                    <div ref={todoColorPickerPaletteRef} className="expanded-color-palette">
                        <HexColorPicker color={newTodoColor} onChange={setNewTodoColor} />
                    </div>
                )}
                <div className="modal-actions"><button onClick={handleSaveTodo}>저장</button><button onClick={resetTodoForm}>취소</button></div>
            </Modal>
            <Modal show={showScheduleModal} onClose={resetScheduleForm}>
                <div className="schedule-modal-header">
                    <h3 className="schedule-modal-title">새 일정 추가</h3>
                    <span className="schedule-modal-date">{new Date(selectedDate).getMonth() + 1}월 {new Date(selectedDate).getDate()}일</span>
                    <button className="modal-close-btn" onClick={resetScheduleForm}>x</button>
                </div>
                {showScheduleTimePicker && (
                    <div className="schedule-option-box">
                        <input type="time" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} />
                    </div>
                )}
                <div className="chip-container">
                    <div><label className="chip-checkbox-label"><input type="checkbox" checked={showScheduleTimePicker} onChange={handleShowScheduleTimePickerChange} /><span> 시간</span></label></div>
                    <div><label className="chip-checkbox-label"><input type="checkbox" checked={showScheduleRepeat} onChange={handleShowScheduleRepeatChange} /><span> 반복</span></label></div>
                    <div><label className="chip-checkbox-label"><input type="checkbox" checked={showScheduleDayPicker} onChange={handleShowScheduleDayPickerChange} /><span> 요일</span></label></div>
                    <div><label className="chip-checkbox-label"><input type="checkbox" checked={newScheduleSetReminder} onChange={() => setNewScheduleSetReminder(!newScheduleSetReminder)} /><span> 리마인더</span></label></div>
                </div>
                {showScheduleRepeat && showScheduleDayPicker && (
                    <div className="schedule-option-box">
                        <div className="days-of-week-container">{['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (<label key={day}><input type="checkbox" value={index} onChange={handleScheduleDayOfWeekChange} checked={newScheduleSelectedDays.includes(index)} />{day}</label>))}</div>
                        <div className="end-date-container"><label>종료일: <input type="date" value={newScheduleEndDate} onChange={(e) => setNewScheduleEndDate(e.target.value)} /></label></div>
                    </div>
                )}
                <input type="text" className="schedule-title-input" placeholder="일정명을 입력해주세요" value={newScheduleTitle} onChange={(e) => setNewScheduleTitle(e.target.value)} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '10px' }}>
                    <Template type="schedule" onTemplateClick={handleScheduleTemplateClick} />
                    <button className="home-add-btn" onClick={handleOpenCreateTemplateModal}>+</button>
                </div>
                <div className="modal-actions"><button onClick={handleSaveSchedule}>저장</button><button onClick={resetScheduleForm}>취소</button></div>
            </Modal>
            <ConfirmationModal
                show={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={confirmationModalProps.onConfirm}
                message={confirmationModalProps.message}
            />

            <Modal show={showCreateScheduleTemplateModal} onClose={() => setShowCreateScheduleTemplateModal(false)}>
                
                <input
                    type="text"
                    placeholder="템플릿명을 입력하세요."
                    value={newScheduleTemplateTitle}
                    onChange={(e) => setNewScheduleTemplateTitle(e.target.value)}
                />
                <div className="template-color-picker">
                    {defaultColors.map(color => {
                                                const isSelected = newScheduleTemplateColor === color;
                                                const style = isSelected
                                                    ? {
                                                        borderColor: color,
                                                        backgroundColor: hexToRgba(color, 0.5),
                                                        border: '2px solid #d3d3d3', // Light gray border for selected
                                                      }
                                                    : { backgroundColor: color, border: '1px solid transparent' };
                        return (
                            <div
                                key={color}
                                className={`color-circle ${isSelected ? 'selected' : ''}`}
                                style={style}
                                onClick={() => setNewScheduleTemplateColor(color)}
                            ></div>
                        );
                    })}
                    {/* Custom Color Circle */}
                    <div
                        ref={colorPickerBtnRef}
                        className={`color-circle custom-color-circle ${newScheduleTemplateColor && !defaultColors.includes(newScheduleTemplateColor) ? 'selected' : ''}`}
                        style={{
                            backgroundColor: newScheduleTemplateColor,
                            borderColor: newScheduleTemplateColor,
                            borderStyle: 'solid',
                        }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                        {defaultColors.includes(newScheduleTemplateColor) && (
                            <div className="plus-icon"></div>
                        )}
                    </div>
                </div>
                {showColorPicker && (
                    <div ref={colorPickerPaletteRef} className="expanded-color-palette">
                        <HexColorPicker color={newScheduleTemplateColor} onChange={setNewScheduleTemplateColor} />
                    </div>
                )}
                <div className="modal-actions">
                    <button onClick={handleCreateScheduleTemplate}>저장</button>
                    <button onClick={() => setShowCreateScheduleTemplateModal(false)}>취소</button>
                </div>
            </Modal>
        </div>
    );
};

// Helper function to convert hex to RGBA
const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default HomeTab;
