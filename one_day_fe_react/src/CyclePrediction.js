import React, { useState, useEffect } from 'react';

const CyclePrediction = () => {
    const [cycleHistory, setCycleHistory] = useState([]);
    const [dDay, setDDay] = useState('?');
    const [predictedStartDate, setPredictedStartDate] = useState('----.--.--');
    const [predictedEndDate, setPredictedEndDate] = useState('----.--.--');

    useEffect(() => {
        calculateAndShowPrediction();
    }, [cycleHistory]);

    const calculateAndShowPrediction = () => {
        if (cycleHistory.length < 2) {
            setDDay('?');
            setPredictedStartDate('----.--.--');
            setPredictedEndDate('----.--.--');
            return;
        }
        const sortedHistory = [...cycleHistory].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        let cycleLengths = [];
        for (let i = 1; i < sortedHistory.length; i++) {
            cycleLengths.push(Math.ceil(Math.abs(new Date(sortedHistory[i].start_date) - new Date(sortedHistory[i - 1].start_date)) / (1000 * 60 * 60 * 24)));
        }
        const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
        let durations = [];
        sortedHistory.forEach(cycle => {
            durations.push(Math.ceil(Math.abs(new Date(cycle.end_date) - new Date(cycle.start_date)) / (1000 * 60 * 60 * 24)) + 1);
        });
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const lastStartDate = new Date(sortedHistory[sortedHistory.length - 1].start_date);
        const predictedStart = new Date(new Date(lastStartDate).setDate(lastStartDate.getDate() + Math.round(avgCycleLength)));
        const predictedEnd = new Date(new Date(predictedStart).setDate(predictedStart.getDate() + Math.round(avgDuration - 1)));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dDayValue = Math.ceil((predictedStart - today) / (1000 * 60 * 60 * 24));
        const formatDate = (date) => date.toISOString().split('T')[0];

        setDDay(dDayValue >= 0 ? `-${dDayValue}` : `+${Math.abs(dDayValue)}`);
        setPredictedStartDate(formatDate(predictedStart));
        setPredictedEndDate(formatDate(predictedEnd));
    };

    return (
        <div className="dashboard-section healthcare-item">
            <div className="section-header">
                <h3>월경 예정일</h3>
                <div className="header-actions">
                    <button className="edit-btn" id="edit-cycle-btn">수정</button>
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
    );
};

export default CyclePrediction;
