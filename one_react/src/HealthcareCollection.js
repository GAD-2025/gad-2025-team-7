import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import './HealthcareCollection.css'; // Import the new CSS file

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

    // useMemo will recalculate the weekly summary only when the underlying data changes
    const weeklyData = useMemo(() => {
        const lastSevenDays = getLastSevenDays();

        return lastSevenDays.map(date => {
            // Get steps for the day
            const steps = pedometerDataByDate[date]?.steps || 0;

            // Calculate total consumed calories for the day
            const mealCards = mealsByDate[date] || [];
            const totalConsumedCalories = mealCards.reduce((total, card) => {
                return total + card.foods.reduce((cardTotal, food) => {
                    return cardTotal + (food.calories || 0) * (food.qty || 1);
                }, 0);
            }, 0);
            
            return {
                date: date,
                steps: steps,
                caloriesBurned: Math.round(steps * 0.04), // 1 step = 0.04 kcal
                totalConsumedCalories: Math.round(totalConsumedCalories)
            };
        });
    }, [mealsByDate, pedometerDataByDate]);

    // Figma shows max values for progress bars
    const maxSteps = 10000;
    const maxConsumedCalories = 2500;
    const maxCaloriesBurned = 500;
    
    return (
        <div className="healthcare-container">
            <button onClick={() => navigate('/home')} className="healthcare-back-button">
                &larr; 홈으로 돌아가기
            </button>
            <div className="healthcare-header">
                <h1>헬스케어 모아보기 (주간 요약)</h1>
                <p>지난 7일간의 건강 기록입니다.</p>
            </div>

            <div className="weekly-summary-grid">
                {weeklyData.length === 0 ? (
                    <p className="empty-weekly-data">표시할 주간 기록이 없습니다.</p>
                ) : (
                    weeklyData.map(day => (
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