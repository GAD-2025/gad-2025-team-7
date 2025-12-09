import React, { useState, useEffect, useCallback, useRef } from 'react';

const Pedometer = ({ userId, dietTotals }) => { // Changed props
    const [steps, setSteps] = useState(0);
    const [kcalRemaining, setKcalRemaining] = useState(0);
    const [graphProgress, setGraphProgress] = useState(0);

    // States moved from HealthcareTab.js
    const [userWeight, setUserWeight] = useState('');
    const [isEditingWeight, setIsEditingWeight] = useState(false);
    const [loadingWeight, setLoadingWeight] = useState(true);
    const [errorWeight, setErrorWeight] = useState(null);
    const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);

    // This effect now explicitly connects userWeight to dailyCalorieGoal
    useEffect(() => {
        const newGoal = userWeight ? Math.round(parseFloat(userWeight) * 25) : 2000;
        setDailyCalorieGoal(newGoal);
    }, [userWeight]);

    const dummySelectedDate = new Date().toISOString().split('T')[0]; // Current date

    // --- Data Fetching ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) return;
            setLoadingWeight(true);
            setErrorWeight(null);
            try {
                const response = await fetch(`http://localhost:3001/api/auth/profile/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch user profile');
                const data = await response.json();
                if (data && data.weight !== null) setUserWeight(data.weight);
                else setUserWeight('');
            } catch (error) {
                console.error(error);
                setErrorWeight("프로필 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoadingWeight(false);
            }
        };

        const fetchInitialSteps = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:3001/api/healthcare/steps/${userId}/${dummySelectedDate}`);
                if (!response.ok) throw new Error('Failed to fetch steps');
                const data = await response.json();
                setSteps(data.steps || 0);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserProfile();
        fetchInitialSteps();
    }, [userId, dummySelectedDate]);


    // --- Data Saving ---
    const debouncedSaveSteps = useRef(
        useCallback(
            debounce((newSteps) => {
                if (!userId || !dummySelectedDate) return;
                fetch('http://localhost:3001/api/healthcare/steps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, date: dummySelectedDate, steps: newSteps }),
                }).catch(console.error);
            }, 2000),
            [userId, dummySelectedDate]
        )
    ).current;

    useEffect(() => {
        // Do not save the initial 0 steps if fetched steps will overwrite it
        if (steps > 0 || (steps === 0 && !loadingWeight)) { // Avoid saving initial render's 0
            debouncedSaveSteps(steps);
        }
    }, [steps, loadingWeight, debouncedSaveSteps]);


    const handleSaveWeight = async () => {
        if (!userWeight || isNaN(userWeight) || parseFloat(userWeight) <= 0) {
            alert('유효한 체중을 입력해주세요.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/auth/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weight: parseFloat(userWeight) }),
            });
            if (!response.ok) throw new Error('Failed to update weight');
            const data = await response.json();
            alert("프로필이 성공적으로 업데이트되었습니다.");
            setIsEditingWeight(false);
            if (data.user && data.user.weight !== null) {
                setUserWeight(data.user.weight);
            }
        } catch (error) {
            console.error(error);
            setErrorWeight("체중 업데이트에 실패했습니다.");
            alert("체중 업데이트에 실패했습니다.");
        }
    };

    // --- Graph Calculation ---
    useEffect(() => {
        const caloriesBurned = steps * 0.04;
        const initialExcess = dietTotals.calories - dailyCalorieGoal;
        const kcalToBurn = Math.max(0, initialExcess - caloriesBurned);
        setKcalRemaining(Math.round(kcalToBurn));

        const totalExcessToBurn = Math.max(0, initialExcess);
        let progressPercent = 0;
        if (totalExcessToBurn > 0) {
            const burnedAmount = totalExcessToBurn - kcalToBurn;
            progressPercent = Math.min(100, (burnedAmount / totalExcessToBurn) * 100);
        } else {
            progressPercent = 100;
        }
        setGraphProgress(progressPercent);
    }, [steps, dietTotals, dailyCalorieGoal]);


    const graphPathLength = 283; // 2 * Math.PI * 45;

    return (
        <div className="dashboard-section healthcare-item">
            <div className="section-header">
                <h3>오늘의 건강</h3>
            </div>
            <div className="section-content health-content-grid">
                {/* Compact Weight Input UI */}
                <div className="weight-input-container compact">
                    {loadingWeight ? (
                        <p>로딩 중...</p>
                    ) : errorWeight ? (
                        <p className="error-message">{errorWeight}</p>
                    ) : isEditingWeight ? (
                        <>
                            <label>체중 (kg):</label>
                            <input
                                type="number"
                                step="0.01"
                                value={userWeight}
                                onChange={(e) => setUserWeight(e.target.value)}
                                placeholder="kg"
                            />
                            <button onClick={handleSaveWeight}>저장</button>
                            <button onClick={() => setIsEditingWeight(false)}>취소</button>
                        </>
                    ) : (
                        <>
                            <p>현재 체중: {userWeight ? `${userWeight} kg` : '미입력'}</p>
                            <button onClick={() => setIsEditingWeight(true)}>수정</button>
                        </>
                    )}
                </div>

                {/* Calorie Info */}
                <div className="calorie-info">
                    <p>하루 평균 섭취 칼로리 목표: <span>{dailyCalorieGoal}</span> kcal</p>
                    <p>오늘 섭취한 총 칼로리: <span>{Math.round(dietTotals.calories)}</span> kcal</p>
                </div>

                {/* Pedometer and Graph */}
                <div className="pedometer">
                    <h4>만보기</h4>
                    <div id="step-count" className="pedometer-display">{steps}</div>
                    <p>걸음</p>
                    <div className="pedometer-controls" style={{display: 'flex !important'}}>
                        <button id="add-steps-btn" onClick={() => setSteps(prev => prev + 100)}>+100</button>
                        <button id="reset-steps-btn" onClick={() => setSteps(0)}>리셋</button>
                    </div>
                </div>
                <div className="calorie-graph-container">
                    <svg id="calorie-graph" viewBox="0 0 100 100">
                        <circle className="graph-bg" cx="50" cy="50" r="45"></circle>
                        <path 
                            id="graph-progress" 
                            className="graph-progress" 
                            d="M 50, 5 a 45,45 0 1,1 0,90 a 45,45 0 1,1 0,-90"
                            style={{ strokeDashoffset: graphPathLength * (1 - graphProgress / 100) }}
                        ></path>
                    </svg>
                    <div id="graph-text" className="graph-text">
                        오늘의 건강까지<br />
                        <span id="kcal-remaining">{kcalRemaining}</span>kcal
                    </div>
                </div>
            </div>
        </div>
    );
};

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

export default Pedometer;
