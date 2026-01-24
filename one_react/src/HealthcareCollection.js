import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import './HealthcareCollection.css';
import DateFilter from './DateFilter';
import IllustratedCalendarIcon from './IllustratedCalendarIcon';

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

const getLastSevenDays = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates.reverse();
};

const HealthcareCollection = () => {
    const navigate = useNavigate();
    const { mealsByDate, pedometerDataByDate } = useData();

    const [sortOrder, setSortOrder] = useState('desc');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterRange, setFilterRange] = useState({ startDate: '', endDate: '' });

    const processedData = useMemo(() => {
        const datesToProcess = filterRange.startDate && filterRange.endDate
            ? getDatesInRange(filterRange.startDate, filterRange.endDate)
            : getLastSevenDays();

        return datesToProcess.map(date => {
            const weight = pedometerDataByDate[date]?.weight || 0;
            const mealCards = mealsByDate[date] || [];
            
            const macros = { calories: 0, carbs: 0, protein: 0, fat: 0 };
            mealCards.forEach(card => {
                card.foods.forEach(food => {
                    macros.calories += (food.calories || 0) * (food.qty || 1);
                    macros.carbs += (food.carbs || 0) * (food.qty || 1);
                    macros.protein += (food.protein || 0) * (food.qty || 1);
                    macros.fat += (food.fat || 0) * (food.qty || 1);
                });
            });
            
            return {
                date: date,
                weight: weight,
                totalConsumedCalories: Math.round(macros.calories),
                carbs: Math.round(macros.carbs),
                protein: Math.round(macros.protein),
                fat: Math.round(macros.fat)
            };
        });
    }, [mealsByDate, pedometerDataByDate, filterRange]);

    const sortedData = useMemo(() => {
        return [...processedData].sort((a, b) => {
            return sortOrder === 'desc' 
                ? b.totalConsumedCalories - a.totalConsumedCalories 
                : a.totalConsumedCalories - b.totalConsumedCalories;
        });
    }, [processedData, sortOrder]);

    const handleApplyFilter = (range) => {
        setFilterRange(range);
        setIsFilterVisible(false);
    };

    const handleClearFilter = () => {
        setFilterRange({ startDate: '', endDate: '' });
    };

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
                                    <span className="metric-item-label">체중</span>
                                    <span className="metric-item-value">{day.weight}</span>
                                    <span className="metric-item-unit">kg</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-item-label">총 섭취 칼로리</span>
                                    <span className="metric-item-value">{day.totalConsumedCalories}</span>
                                    <span className="metric-item-unit">kcal</span>
                                </div>
                                <div className="metric-item metric-item-macros">
                                    <span className="metric-item-label">탄/단/지</span>
                                    <span className="metric-item-value-small">{day.carbs}g / {day.protein}g / {day.fat}g</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HealthcareCollection;