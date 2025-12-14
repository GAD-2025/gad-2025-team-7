import React from 'react';
import './DaySummaryPopover.css';

const DaySummaryPopover = ({ date, anchorEl, onClose }) => {
    if (!anchorEl) {
        return null;
    }

    const rect = anchorEl.getBoundingClientRect();
    const style = {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
    };

    return (
        <div className="day-summary-popover-overlay" onClick={onClose}>
            <div className="day-summary-popover" style={style} onClick={(e) => e.stopPropagation()}>
                <div className="day-summary-header">
                    <h3>하루 요약</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="day-summary-content">
                    <p>선택된 날짜: {date}</p>
                    {/* 여기에 해당 날짜의 요약 내용을 추가합니다. */}
                </div>
            </div>
        </div>
    );
};

export default DaySummaryPopover;
