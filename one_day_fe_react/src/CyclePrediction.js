import React, { useState, useEffect } from 'react';

const CyclePrediction = ({ userId }) => {
    const [cycleHistory, setCycleHistory] = useState([]);
    const [dDay, setDDay] = useState('?');
    const [predictedStartDate, setPredictedStartDate] = useState('----.--.--');
    const [predictedEndDate, setPredictedEndDate] = useState('----.--.--');
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [startDateInput, setStartDateInput] = useState('');
    const [endDateInput, setEndDateInput] = useState('');

    const fetchCycleHistory = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:3000/api/healthcare/cycles/${userId}`);
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
            setCycleHistory([]);
            setDDay('?');
            setPredictedStartDate('----.--.--');
            setPredictedEndDate('----.--.--');
        }
    };

    useEffect(() => {
        fetchCycleHistory();
    }, [userId]);

    const handleSaveCycleRecord = async () => {
        if (!userId) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (!startDateInput || !endDateInput) {
            alert('시작일과 종료일을 모두 선택해주세요.');
            return;
        }
        if (new Date(startDateInput) > new Date(endDateInput)) {
            alert('종료일은 시작일보다 빠를 수 없습니다.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/healthcare/cycles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, startDate: startDateInput, endDate: endDateInput }),
            });
            if (res.ok) {
                alert('기록이 추가되었습니다.');
                setStartDateInput('');
                setEndDateInput('');
                fetchCycleHistory(); // Refresh data
            } else {
                alert('기록 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error("Error saving cycle record:", error);
            alert('기록 추가 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteCycle = async (cycleId) => {
        if (!window.confirm('이 기록을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/healthcare/cycles/${cycleId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                alert('기록이 삭제되었습니다.');
                fetchCycleHistory(); // Refresh data
            } else {
                alert('기록 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error("Error deleting cycle record:", error);
            alert('기록 삭제 중 오류가 발생했습니다.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

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

            {/* Menstrual Cycle Edit Modal */}
            {showCycleModal && (
                <div id="cycle-edit-modal" className="modal-overlay" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h3>월경 기록</h3>
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
                            <button id="save-cycle-record-btn" onClick={handleSaveCycleRecord}>기록 추가</button>
                        </div>
                        <hr />
                        <h4>과거 기록</h4>
                        <div id="past-cycles-list" className="section-content">
                            {cycleHistory.length > 0 ? (
                                <ul>
                                    {cycleHistory.map(record => (
                                        <li key={record.id}>
                                            {formatDate(record.start_date)} ~ {formatDate(record.end_date)}
                                            <button className="delete-item-btn" onClick={() => handleDeleteCycle(record.id)}>x</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>기록이 없습니다.</p>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button id="close-cycle-modal-btn" onClick={() => setShowCycleModal(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CyclePrediction;
