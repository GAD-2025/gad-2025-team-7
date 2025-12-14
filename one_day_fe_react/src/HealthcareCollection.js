import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';

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

    // This component no longer needs its own loading or error state,
    // as it's just a view of the already-loaded (or loading) data in the context.
    
    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/home')} style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer' }}>
                &larr; 홈으로 돌아가기
            </button>
            <h1>헬스케어 모아보기 (주간 요약)</h1>
            <p>지난 7일간의 건강 기록입니다.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {weeklyData.length === 0 ? (
                    <p>표시할 주간 기록이 없습니다.</p>
                ) : (
                    weeklyData.map(day => (
                        <div key={day.date} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                            <h3>{day.date}</h3>
                            <p>걸음 수: {day.steps} 걸음</p>
                            <p>소모 칼로리: {day.caloriesBurned} kcal</p>
                            <p>총 섭취 칼로리: {day.totalConsumedCalories} kcal</p>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100px', borderBottom: '1px solid #eee', marginTop: '10px' }}>
                                <div style={{ 
                                    width: '30%', 
                                    height: `${Math.min(100, (day.steps / 10000) * 100)}%`, 
                                    backgroundColor: 'skyblue', 
                                    marginRight: '5%', 
                                    display: 'flex', 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.8em'
                                }}>{day.steps}</div>
                                <div style={{ 
                                    width: '30%', 
                                    height: `${Math.min(100, (day.totalConsumedCalories / 2500) * 100)}%`, 
                                    backgroundColor: 'lightcoral', 
                                    marginRight: '5%',
                                    display: 'flex', 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.8em'
                                }}>{Math.round(day.totalConsumedCalories)}</div>
                                <div style={{ 
                                    width: '30%', 
                                    height: `${Math.min(100, (day.caloriesBurned / 500) * 100)}%`, 
                                    backgroundColor: 'lightgreen', 
                                    display: 'flex', 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.8em'
                                }}>{day.caloriesBurned}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginTop: '5px' }}>
                                <span>걸음</span><span>섭취</span><span>소모</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HealthcareCollection;