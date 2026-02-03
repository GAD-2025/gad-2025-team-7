import React from 'react';
import './DailySummaryPopup.css';

const DailySummaryPopup = ({ show, onClose, date }) => {
    if (!show) return null;

    return (
        <div className="daily-summary-popup">
            <div className="popup-header">
                <h3>{date}</h3>
                <button onClick={onClose}>X</button>
            </div>
            <div className="popup-content">
                {/* Content for daily summary will go here */}
                <p>하루 요약 내용</p>
            </div>
        </div>
    );
};

export default DailySummaryPopup;