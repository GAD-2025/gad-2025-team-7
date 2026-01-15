import React from 'react';
import './DaySummaryPopover.css';

const DaySummaryPopover = ({ date, anchorEl, onClose, summaryData, isLoading }) => {
    if (!anchorEl || !date) {
        return null;
    }

    const rect = anchorEl.getBoundingClientRect();
    const style = {
        top: `${rect.bottom + window.scrollY - 40}px`, // -40px distance
        left: `${rect.left + window.scrollX + (rect.width / 2) - 250}px`, // 125 is half of popover width (250px) - 125px left shift
    };

    // Format date to "M/D"
    const [, month, day] = date.split('-');
    const formattedDate = `${parseInt(month, 10)}/${parseInt(day, 10)}`;

    return (
        <div className="day-summary-popover-overlay" onClick={onClose}>
            <div className="day-summary-popover" style={style} onClick={(e) => e.stopPropagation()}>
                <div className="day-summary-header">
                    <h3>하루 요약 ({formattedDate})</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="day-summary-content">
                    {isLoading ? (
                        <p>로딩 중...</p>
                    ) : summaryData ? (
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">👟 걸음수</span>
                                <span className="summary-value">{summaryData.steps.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">✅ 일정 완료</span>
                                <span className="summary-value">{summaryData.completedEvents} / {summaryData.totalEvents}</span>
                            </div>
                        </div>
                    ) : (
                        <p>데이터를 불러올 수 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DaySummaryPopover;