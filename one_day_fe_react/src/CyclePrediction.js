import React, { useState, useEffect } from 'react';

const CyclePrediction = ({ userId, selectedCycleStartDate }) => {
    // --- All State Hooks ---
    const [cycleHistory, setCycleHistory] = useState([]);
    const [dDay, setDDay] = useState('?');
    const [predictedStartDate, setPredictedStartDate] = useState('----.--.--');
    const [predictedEndDate, setPredictedEndDate] = useState('----.--.--');
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [startDateInput, setStartDateInput] = useState('');
    const [endDateInput, setEndDateInput] = useState('');
    const [editingCycleId, setEditingCycleId] = useState(null);

    // --- Effects ---
    useEffect(() => {
        if (selectedCycleStartDate) {
            setStartDateInput(selectedCycleStartDate);
        }
    }, [selectedCycleStartDate]);

    const fetchCycleHistory = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/healthcare/cycles/${userId}`);
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
                setCycleHistory([]);
                setDDay('?');
                setPredictedStartDate('----.--.--');
                setPredictedEndDate('----.--.--');
            }
        } catch (error) {
            console.error("Error fetching cycle history:", error);
            // Reset state on error
            setCycleHistory([]);
            setDDay('?');
            setPredictedStartDate('----.--.--');
            setPredictedEndDate('----.--.--');
        }
    };

    useEffect(() => {
        fetchCycleHistory();
    }, [userId]);

    // --- Helper Functions ---
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

    // --- Handlers ---
    const handleSaveCycleRecord = async () => {
        if (!userId) return alert('로그인이 필요합니다.');
        if (!startDateInput || !endDateInput) return alert('시작일과 종료일을 모두 선택해주세요.');
        if (new Date(startDateInput) > new Date(endDateInput)) return alert('종료일은 시작일보다 빠를 수 없습니다.');

        try {
            const res = await fetch('http://localhost:3001/api/healthcare/cycles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, startDate: startDateInput, endDate: endDateInput }),
            });
            const responseData = await res.json();
            if (res.ok) {
                alert('기록이 추가되었습니다.');
                resetForm();
                fetchCycleHistory();
            } else {
                alert(responseData.error ? `서버 오류: ${responseData.error}` : '기록 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error("Error saving cycle record:", error);
            alert('기록 추가 중 오류가 발생했습니다.');
        }
    };

    const handleUpdateCycleRecord = async () => {
        if (!editingCycleId) return;
        if (!startDateInput || !endDateInput) return alert('시작일과 종료일을 모두 선택해주세요.');
        if (new Date(startDateInput) > new Date(endDateInput)) return alert('종료일은 시작일보다 빠를 수 없습니다.');

        try {
            const res = await fetch(`http://localhost:3001/api/healthcare/cycles/${editingCycleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: startDateInput, endDate: endDateInput }),
            });
            const responseData = await res.json();
            if (res.ok) {
                alert('기록이 수정되었습니다.');
                resetForm();
                fetchCycleHistory();
            } else {
                alert(responseData.error ? `서버 오류: ${responseData.error}` : '기록 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error("Error updating cycle record:", error);
            alert('기록 수정 중 오류가 발생했습니다.');
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
        if (!cycleId) return alert('삭제할 항목의 ID가 올바르지 않습니다.');
        if (!window.confirm('이 기록을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/healthcare/cycles/${cycleId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                alert('기록이 삭제되었습니다.');
                fetchCycleHistory();
            } else {
                alert('기록 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error("Error deleting cycle record:", error);
            alert('기록 삭제 중 오류가 발생했습니다.');
        }
    };

    // --- Render JSX ---
    return (
        <>
            <div className="dashboard-section healthcare-item">
                <div className="section-header">
                    <h3>월경 예정일</h3>
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

            {showCycleModal && (
                <div id="cycle-edit-modal" className="modal-overlay" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h3>월경 기록</h3>
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
                                                <button className="delete-record-btn" onClick={() => handleDeleteCycle(record.id)}>삭제</button> {/* Changed class name here */}
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
                </div>
            )}
        </>
    );
};

export default CyclePrediction;
