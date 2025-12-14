import React, { useState, useEffect } from 'react';
import { useData } from './DataContext';
import { useProfile } from './ProfileContext';

const Pedometer = ({ userId }) => {
    // --- Get Data From Contexts ---
    const { steps, updateSteps, dietTotals } = useData();
    const { profile, loading: profileLoading, updateWeight } = useProfile();
    
    // --- Local UI State ---
    const [isEditingWeight, setIsEditingWeight] = useState(false);
    // Local state to manage the input field value during editing
    const [weightInput, setWeightInput] = useState('');
    
    // --- Local Derived State ---
    const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
    const [kcalRemaining, setKcalRemaining] = useState(0);
    const [graphProgress, setGraphProgress] = useState(0);
    const graphPathLength = 283;

    // Sync local input with context profile weight when not editing
    useEffect(() => {
        if (profile.weight !== null) {
            setWeightInput(String(profile.weight));
        } else {
            setWeightInput('');
        }
    }, [profile.weight]);

    // --- Update Calorie Goal based on weight ---
    useEffect(() => {
        const newGoal = profile.weight ? Math.round(parseFloat(profile.weight) * 25) : 2000;
        setDailyCalorieGoal(newGoal);
    }, [profile.weight]);

    // --- Save Weight (using context) ---
    const handleSaveWeight = async () => {
        if (!weightInput || isNaN(weightInput) || parseFloat(weightInput) <= 0) {
            alert('유효한 체중을 입력해주세요.');
            return;
        }
        try {
            await updateWeight(weightInput);
            alert("체중이 성공적으로 업데이트되었습니다.");
            setIsEditingWeight(false);
        } catch (error) {
            console.error(error);
            alert(error.message || "체중 업데이트에 실패했습니다.");
        }
    };
    
    const handleCancelEdit = () => {
        // Reset input to the value from context
        setWeightInput(profile.weight ? String(profile.weight) : '');
        setIsEditingWeight(false);
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

    return (
        <div className="dashboard-section healthcare-item">
            <div className="section-header">
                <h3>오늘의 건강</h3>
            </div>
            <div className="section-content health-content-grid">
                {/* Compact Weight Input UI */}
                <div className="weight-input-container compact">
                    {profileLoading ? (
                        <p>로딩 중...</p>
                    ) : isEditingWeight ? (
                        <>
                            <label>체중 (kg):</label>
                            <input
                                type="number"
                                step="0.01"
                                value={weightInput}
                                onChange={(e) => setWeightInput(e.target.value)}
                                placeholder="kg"
                            />
                            <button onClick={handleSaveWeight}>저장</button>
                            <button onClick={handleCancelEdit}>취소</button>
                        </>
                    ) : (
                        <>
                            <p>현재 체중: {profile.weight ? `${profile.weight} kg` : '미입력'}</p>
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
                        <button id="add-steps-btn" onClick={() => updateSteps(steps + 100)}>+100</button>
                        <button id="reset-steps-btn" onClick={() => updateSteps(0)}>리셋</button>
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

export default Pedometer;
