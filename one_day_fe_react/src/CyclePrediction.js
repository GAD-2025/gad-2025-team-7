import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from './DataContext'; // Import useData

const CyclePrediction = ({ userId, selectedCycleStartDate }) => {
    // --- Get selectedDate from Context ---
    const { selectedDate } = useData();

    // --- Component State ---
    const [cycleHistory, setCycleHistory] = useState([]);
    const [dDay, setDDay] = useState('?');
    const [predictedStartDate, setPredictedStartDate] = useState('----.--.--');
    const [predictedEndDate, setPredictedEndDate] = useState('----.--.--');
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [startDateInput, setStartDateInput] = useState('');
    const [endDateInput, setEndDateInput] = useState('');
    const [editingCycleId, setEditingCycleId] = useState(null);

    useEffect(() => {
        if (selectedCycleStartDate) {
            setStartDateInput(selectedCycleStartDate);
        }
    }, [selectedCycleStartDate]);

    // --- Data Fetching ---
    const fetchCycleHistory = async () => {
        if (!userId) return;
        try {
            // FIX: Pass the selectedDate from the context as a query parameter
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/healthcare/cycles/${userId}?relativeDate=${selectedDate}`);
            const data = await res.json();
            if (res.ok && data.history) {
                setCycleHistory(data.history);
                if (data.prediction) {
                    setDDay(data.prediction.dDay >= 0 ? `-${data.prediction.dDay}` : `+${Math.abs(data.prediction.dDay)}`);
                    setPredictedStartDate(data.prediction.startDate);
                    setPredictedEndDate(data.prediction.endDate);
                } else {
                    setDDay('?');
                    setPredictedStartDate('----.--.--');
                    setPredictedEndDate('----.--.--');
                }
            } else {
                // Reset on failure
                setCycleHistory([]);
                setDDay('?');
                setPredictedStartDate('----.--.--');
                setPredictedEndDate('----.--.--');
            }
        } catch (error) {
            console.error("Error fetching cycle history:", error);
            setCycleHistory([]);
            setDDay('?');
            setPredictedStartDate('----.--.--');
            setPredictedEndDate('----.--.--');
        }
    };

    // FIX: Re-fetch data whenever the selectedDate from the context changes
    useEffect(() => {
        fetchCycleHistory();
    }, [userId, selectedDate]);

    // ... (rest of the helper and handler functions remain the same)

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const resetForm = () => {
        setStartDateInput('');
        setEndDateInput('');
        setEditingCycleId(null);
    };

    const handleSaveCycleRecord = async () => {
        if (!userId) { console.warn('User not logged in. Cannot save cycle record.'); return; }
        if (!startDateInput || !endDateInput) { console.warn('Start and end dates are required.'); return; }
        if (new Date(startDateInput) > new Date(endDateInput)) { console.warn('End date cannot be earlier than start date.'); return; }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/healthcare/cycles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, startDate: startDateInput, endDate: endDateInput }),
            });
            const responseData = await res.json();
            if (res.ok) {
                console.log('Cycle record added successfully.');
                resetForm();
                fetchCycleHistory();
            } else {
                console.error('Failed to add cycle record:', responseData.error || 'Unknown error');
            }
        } catch (error) {
            console.error("Error saving cycle record:", error);
            console.error('Error while adding cycle record.');
        }
    };

    const handleUpdateCycleRecord = async () => {
        if (!editingCycleId) return;
        if (!startDateInput || !endDateInput) { console.warn('Start and end dates are required for update.'); return; }
        if (new Date(startDateInput) > new Date(endDateInput)) { console.warn('End date cannot be earlier than start date for update.'); return; }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/healthcare/cycles/${editingCycleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: startDateInput, endDate: endDateInput }),
            });
            const responseData = await res.json();
            if (res.ok) {
                console.log('Cycle record updated successfully.');
                resetForm();
                fetchCycleHistory();
            } else {
                console.error('Failed to update cycle record:', responseData.error || 'Unknown error');
            }
        } catch (error) {
            console.error("Error updating cycle record:", error);
            console.error('Error while updating cycle record.');
        }
    };

    const handleEditClick = (record) => {
        setEditingCycleId(record.id);
        setStartDateInput(formatDate(record.start_date));
        setEndDateInput(formatDate(record.end_date));
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDeleteCycle = async (cycleId) => {
        if (!cycleId) { console.warn('Invalid ID for deletion.'); return; }
        if (!window.confirm('이 기록을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/healthcare/cycles/${cycleId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                console.log('Cycle record deleted successfully.');
                fetchCycleHistory();
            } else {
                console.error('Failed to delete cycle record.');
            }
        } catch (error) {
            console.error("Error deleting cycle record:", error);
            alert('기록 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <div className="dashboard-section healthcare-item">
                <div className="section-header">
                    <h3>생리 주기 예측</h3>
                    <div className="header-actions">
                        <button className="edit-btn" onClick={() => setShowCycleModal(true)}>수정</button>
                    </div>
                </div>
                <div className="section-content" id="cycle-prediction-content">
                    <div className="prediction-main-info">
                        <p>다음 월경 시작일까지</p>
                        <h2 className="d-day-display">D{dDay}</h2>
                    </div>
                    <div className="predicted-dates-grid">
                        <div className="predicted-date-item">
                            <p>예상 시작일</p>
                            <span id="predicted-start-date" className="large-date">{predictedStartDate}</span>
                        </div>
                        <div className="predicted-date-item">
                            <p>예상 종료일</p>
                            <span id="predicted-end-date" className="large-date">{predictedEndDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showCycleModal && createPortal(
                <div id="cycle-edit-modal" className="modal-overlay">
                    <div className="modal-content">
                        <h3>생리 주기 기록</h3>
                        {cycleHistory.length < 2 && (
                            <p style={{ color: 'red', marginBottom: '15px' }}>
                                예측을 위해 최소 2번의 주기 기록이 필요합니다.
                            </p>
                        )}
                        <div className="cycle-input-form">
                            <label htmlFor="cycle-start-date">시작일:</label>
                            <input 
                                type="date" 
                                id="cycle-start-date" 
                                value={startDateInput} 
                                onChange={(e) => setStartDateInput(e.target.value)} 
                            />
                            <label htmlFor="cycle-end-date">종료일:</label>
                            <input 
                                type="date" 
                                id="cycle-end-date" 
                                value={endDateInput} 
                                onChange={(e) => setEndDateInput(e.target.value)} 
                            />
                            {editingCycleId ? (
                                <>
                                    <button onClick={handleUpdateCycleRecord}>기록 저장</button>
                                    <button onClick={handleCancelEdit}>취소</button>
                                </>
                            ) : (
                                <button onClick={handleSaveCycleRecord}>기록 추가</button>
                            )}
                        </div>
                        <hr />
                        <h4>과거 기록</h4>
                        <div id="past-cycles-list" className="section-content">
                            {cycleHistory.length > 0 ? (
                                <ul>
                                    {cycleHistory.map(record => (
                                        <li key={record.id}>
                                            <span>{formatDate(record.start_date)} ~ {formatDate(record.end_date)}</span>
                                            <div className="record-actions">
                                                <button className="edit-record-btn" onClick={() => handleEditClick(record)}>수정</button>
                                                <button className="delete-record-btn" onClick={() => handleDeleteCycle(record.id)}>삭제</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>기록이 없습니다.</p>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button id="close-cycle-modal-btn" onClick={() => { setShowCycleModal(false); resetForm(); }}>닫기</button>
                        </div>
                    </div>
                </div>,
                document.getElementById('portal-root')
            )}
        </>
    );
};

export default CyclePrediction;