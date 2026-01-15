import React, { useState, useEffect } from 'react';
import { useData } from './DataContext';
import { useProfile } from './ProfileContext';
import './Pedometer.css';

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
    const strokeDashoffset = graphPathLength - (graphPathLength * graphProgress) / 100;

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
            // Reset to original weight on invalid input
            setWeightInput(profile.weight ? String(profile.weight) : '');
            setIsEditingWeight(false);
            return;
        }
        try {
            await updateWeight(weightInput);
            // alert("체중이 성공적으로 업데이트되었습니다."); // Optional: remove alert for seamless experience
            setIsEditingWeight(false); // Exit editing mode on successful save
        } catch (error) {
            console.error(error);
            alert(error.message || "체중 업데이트에 실패했습니다.");
            setIsEditingWeight(false); // Also exit editing mode on failure
        }
    };
    
    const handleWeightInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger onBlur to save
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

    return (
        <div className="pedometer-wrapper">
            <div className="section-header">
                <h3>섭취 칼로리</h3>
            </div>
            <div className="healthcare-content-box">
                <div className="pedometer-info-wrapper">
                    <div className="pedometer-column weight-column">
                        <div className="weight-info">
                            {profileLoading ? (
                                <p>로딩 중...</p>
                            ) : isEditingWeight ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={weightInput}
                                    onChange={(e) => setWeightInput(e.target.value)}
                                    onBlur={handleSaveWeight} // Save on blur
                                    onKeyDown={handleWeightInputKeyDown} // Save on Enter
                                    placeholder="kg"
                                    autoFocus
                                />
                            ) : (
                                <div className="weight-display-container" onClick={() => setIsEditingWeight(true)}>
                                    {profile.weight ? (
                                        <p>{profile.weight} kg</p>
                                    ) : (
                                        <p>현재 체중</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pedometer-column calorie-column">
                        <p className="calorie-display-format">
                            <span className="calorie-value">{Math.round(dietTotals.calories)}kcal</span> / <span className="calorie-goal-value">{dailyCalorieGoal}kcal</span>
                        </p>
                    </div>
                </div>
                <div className="pedometer-graph-wrapper">
                    <svg className="pedometer-graph" viewBox="0 0 100 100">
                        <circle className="pedometer-graph-background" cx="50" cy="50" r="45"></circle>
                        <circle
                            className="pedometer-graph-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray={graphPathLength}
                            strokeDashoffset={strokeDashoffset}
                        ></circle>
                    </svg>
                    <div className="pedometer-graph-text">
                        <h4>{kcalRemaining}</h4>
                        <p>kcal 남음</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pedometer;
