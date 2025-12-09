import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const HealthcareCollection = () => {
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    const userId = localStorage.getItem('userId');
    const endDate = new Date().toISOString().split('T')[0]; // Today's date as end date for the week

    useEffect(() => {
        const fetchWeeklySummary = async () => {
            if (!userId) {
                setError("로그인이 필요합니다.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3001/api/healthcare/weekly_summary/${userId}/${endDate}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setWeeklyData(data);
            } catch (err) {
                console.error("Failed to fetch weekly summary:", err);
                setError("주간 요약 데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklySummary();
    }, [userId, endDate]);

    if (loading) {
        return <div style={{ padding: '20px' }}>로딩 중...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

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
                            
                            {/* Simple Bar Chart for illustration */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100px', borderBottom: '1px solid #eee', marginTop: '10px' }}>
                                <div style={{ 
                                    width: '30%', 
                                    height: `${(day.steps / 10000) * 100}%`, /* Max 10000 steps for 100% height */
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
                                    height: `${(day.totalConsumedCalories / 2500) * 100}%`, /* Max 2500 kcal for 100% height */
                                    backgroundColor: 'lightcoral', 
                                    marginRight: '5%',
                                    display: 'flex', 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.8em'
                                }}>{day.totalConsumedCalories}</div>
                                <div style={{ 
                                    width: '30%', 
                                    height: `${(day.caloriesBurned / 500) * 100}%`, /* Max 500 kcal for 100% height */
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
