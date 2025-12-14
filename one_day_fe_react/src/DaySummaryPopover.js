import React from 'react';
import './DaySummaryPopover.css';

const DaySummaryPopover = ({ date, anchorEl, onClose, summaryData, isLoading }) => {
    if (!anchorEl) {
        return null;
    }

    const rect = anchorEl.getBoundingClientRect();
    const style = {
        top: `${rect.bottom + window.scrollY + 5}px`, // Add a small gap
        left: `${rect.left + window.scrollX}px`,
    };

    return (
        <div className="day-summary-popover-overlay" onClick={onClose}>
            <div className="day-summary-popover" style={style} onClick={(e) => e.stopPropagation()}>
                <div className="day-summary-header">
                    <h3>하루 요약 ({date})</h3>
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