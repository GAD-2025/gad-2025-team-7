import React from 'react';
import './DaySummaryPopover.css';

const DaySummaryPopover = ({ date, anchorEl, onClose, summaryData, isLoading }) => {
    if (!anchorEl || !date) {
        return null;
    }

    const rect = anchorEl.getBoundingClientRect();
    const style = {
        top: `${rect.bottom + 20}px`, // 20px distance below the anchor
        left: `${rect.left + (rect.width / 2) - 125}px`, // 125 is half of popover width (250px) - 125px left shift
    };

    // Format date to "M/D"
    const [, month, day] = date.split('-');
    const formattedDate = `${parseInt(month, 10)}/${parseInt(day, 10)}`;

    return (
        <div className="day-summary-popover-overlay" onClick={onClose}>
            <div className="day-summary-popover" style={style} onClick={(e) => e.stopPropagation()}>
                <div className="day-summary-header">
                    <h3>하루 요약 <span className="popover-date-text">{formattedDate}</span></h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="day-summary-content">
                    {isLoading ? (
                        <p>로딩 중...</p>
                    ) : summaryData ? (
                        <div className="summary-grid">
                            <div className="summary-items-left"> {/* New container for stacked items */}
                                <div className="summary-item">
                                    <span className="summary-label">일정 완료</span>
                                    <span className="summary-value">{summaryData.completedEvents} / {summaryData.totalEvents}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">투두 완료</span>
                                    <span className="summary-value">{summaryData.completedTodos} / {summaryData.totalTodos}</span>
                                </div>
                            </div>
                            <div className="summary-item pedometer-graph-wrapper"> {/* Use pedometer-graph-wrapper for styling */}
                                <svg className="pedometer-graph" viewBox="0 0 100 100">
                                    <circle className="pedometer-graph-background" cx="50" cy="50" r="45"></circle>
                                    <circle
                                        className="pedometer-graph-progress"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        strokeDasharray={summaryData.calorieGraphPathLength}
                                        strokeDashoffset={summaryData.calorieStrokeDashoffset}
                                    ></circle>
                                </svg>
                                <div className="pedometer-graph-text">
                                    <p><span className="calorie-value">{summaryData.consumedCalories}</span> / {summaryData.targetCalories} kcal</p>
                                </div>
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