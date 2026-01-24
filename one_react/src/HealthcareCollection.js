import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import './HealthcareCollection.css'; // Import the new CSS file
import DateFilter from './DateFilter'; // Import DateFilter
import IllustratedCalendarIcon from './IllustratedCalendarIcon'; // Import IllustratedCalendarIcon

// Helper function to get dates between a range
const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

// Helper function to get the last 7 days
const getLastSevenDays = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates.reverse(); // Return in chronological order
};

const HealthcareCollection = () => {
    const navigate = useNavigate();
    const { mealsByDate, pedometerDataByDate } = useData();

    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for high, 'asc' for low
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterRange, setFilterRange] = useState({ startDate: '', endDate: '' });

    const weeklyData = useMemo(() => {
        const datesToProcess = filterRange.startDate && filterRange.endDate
            ? getDatesInRange(filterRange.startDate, filterRange.endDate)
            : getLastSevenDays();

        return datesToProcess.map(date => {
            const steps = pedometerDataByDate[date]?.steps || 0;
            const mealCards = mealsByDate[date] || [];
            const totalConsumedCalories = mealCards.reduce((total, card) => {
                return total + card.foods.reduce((cardTotal, food) => {
                    return cardTotal + (food.calories || 0) * (food.qty || 1);
                }, 0);
            }, 0);
            
            return {
                date: date,
                steps: steps,
                caloriesBurned: Math.round(steps * 0.04),
                totalConsumedCalories: Math.round(totalConsumedCalories)
            };
        });
    }, [mealsByDate, pedometerDataByDate, filterRange]);

    const sortedData = useMemo(() => {
        return [...weeklyData].sort((a, b) => {
            return sortOrder === 'desc' 
                ? b.totalConsumedCalories - a.totalConsumedCalories 
                : a.totalConsumedCalories - b.totalConsumedCalories;
        });
    }, [weeklyData, sortOrder]);

    const handleApplyFilter = (range) => {
        setFilterRange(range);
        setIsFilterVisible(false);
    };

    const handleClearFilter = () => {
        setFilterRange({ startDate: '', endDate: '' });
    };

    const maxSteps = 10000;
    const maxConsumedCalories = 2500;
    const maxCaloriesBurned = 500;
    
    return (
        <div className="healthcare-container">
            {isFilterVisible && (
                <DateFilter 
                    onApply={handleApplyFilter}
                    onCancel={() => setIsFilterVisible(false)}
                />
            )}
            <header className="hc-header">
                <div className="hc-header-left">
                    <span className="hc-back-icon" onClick={() => navigate('/home')}>&larr;</span>
                    <h1 className="hc-title">헬스케어 모아보기</h1>
                </div>
                <div className="hc-header-right">
                    <div className="hc-filters">
                        <div className="filter-toggle">
                            <button className={sortOrder === 'desc' ? 'active' : ''} onClick={() => setSortOrder('desc')}>높은 순</button>
                            <button className={sortOrder === 'asc' ? 'active' : ''} onClick={() => setSortOrder('asc')}>낮은 순</button>
                        </div>
                    </div>
                    <IllustratedCalendarIcon onClick={() => setIsFilterVisible(true)} />
                </div>
            </header>
            
            {filterRange.startDate && filterRange.endDate ? (
                <div className="filter-status">
                    <p>
                        {`${filterRange.startDate} ~ ${filterRange.endDate}`}
                        <button onClick={handleClearFilter}>×</button>
                    </p>
                </div>
            ) : (
                <p className="hc-subtitle">지난 7일간의 건강 기록입니다.</p>
            )}

            <div className="weekly-summary-grid">
                {sortedData.length === 0 ? (
                    <p className="empty-weekly-data">표시할 주간 기록이 없습니다.</p>
                ) : (
                    sortedData.map(day => (
                        <div key={day.date} className="healthcare-daily-card">
                            <div className="daily-card-header">
                                <h3>{day.date}</h3>
                            </div>
                            
                            <div className="daily-card-metrics">
                                <div className="metric-item">
                                    <span className="metric-item-label">걸음 수</span>
                                    <span className="metric-item-value">{day.steps}</span>
                                    <span className="metric-item-unit">걸음</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-item-label">소모 칼로리</span>
                                    <span className="metric-item-value">{day.caloriesBurned}</span>
                                    <span className="metric-item-unit">kcal</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-item-label">총 섭취 칼로리</span>
                                    <span className="metric-item-value">{day.totalConsumedCalories}</span>
                                    <span className="metric-item-unit">kcal</span>
                                </div>
                            </div>
                            
                            <div className="daily-chart-container">
                                {/* Steps Bar */}
                                <div className="chart-bar-wrapper">
                                    <div 
                                        className="chart-bar chart-bar-steps" 
                                        style={{ height: `${Math.min(100, (day.steps / maxSteps) * 100)}%` }}
                                    ></div>
                                    <span className="bar-value">{day.steps}</span>
                                </div>
                                {/* Consumed Calories Bar */}
                                <div className="chart-bar-wrapper">
                                    <div 
                                        className="chart-bar chart-bar-consumed" 
                                        style={{ height: `${Math.min(100, (day.totalConsumedCalories / maxConsumedCalories) * 100)}%` }}
                                    ></div>
                                    <span className="bar-value">{Math.round(day.totalConsumedCalories)}</span>
                                </div>
                                {/* Burned Calories Bar */}
                                <div className="chart-bar-wrapper">
                                    <div 
                                        className="chart-bar chart-bar-burned" 
                                        style={{ height: `${Math.min(100, (day.caloriesBurned / maxCaloriesBurned) * 100)}%` }}
                                    ></div>
                                    <span className="bar-value">{day.caloriesBurned}</span>
                                </div>
                            </div>
                            <div className="chart-labels">
                                <span className="chart-label-item">걸음</span>
                                <span className="chart-label-item">섭취</span>
                                <span className="chart-label-item">소모</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HealthcareCollection;