import React from 'react';
import './DailySummaryPopup.css';

const DailySummaryPopup = ({ show, onClose, date, dailyData }) => {
    if (!show) return null;

    // Extract counts from dailyData
    const completedTodosCount = dailyData?.completedTodosCount || 0;
    const totalTodosCount = dailyData?.totalTodosCount || 0;
    const completedEventsCount = dailyData?.completedEventsCount || 0;
    const totalEventsCount = dailyData?.totalEventsCount || 0;

    return (
        <div className="daily-summary-popup">
            <div className="popup-header">
                <h3>{date}</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className="popup-content">
                <h4>일정 완료: {completedEventsCount}/{totalEventsCount}</h4>
                <h4>투두 완료: {completedTodosCount}/{totalTodosCount}</h4>
            </div>
        </div>
    );
};

export default DailySummaryPopup;