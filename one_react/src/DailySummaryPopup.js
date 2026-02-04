import React from 'react';
import './DailySummaryPopup.css';

const DailySummaryPopup = ({ show, onClose, date, dailyData }) => {
    if (!show) return null;

    // Default empty arrays if dailyData or its properties are undefined
    const completedSchedules = dailyData?.completedSchedules || [];
    const addedSchedules = dailyData?.addedSchedules || [];

    return (
        <div className="daily-summary-popup">
            <div className="popup-header">
                <h3>{date}</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className="popup-content">
                <h4>일정 완료: {completedSchedules.length}/{addedSchedules.length}</h4>
                {completedSchedules.length === 0 && addedSchedules.length === 0 && <p>일정이 없습니다.</p>}
            </div>
        </div>
    );
};

export default DailySummaryPopup;