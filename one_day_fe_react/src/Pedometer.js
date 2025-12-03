import React, { useState, useEffect } from 'react';

const Pedometer = ({ totalCalories, recommendedCalories }) => {
    const [steps, setSteps] = useState(0);
    const [kcalRemaining, setKcalRemaining] = useState(0);
    const [graphProgress, setGraphProgress] = useState(0);

    useEffect(() => {
        const caloriesBurned = steps * 0.04;
        const initialExcess = totalCalories - recommendedCalories;
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
    }, [steps, totalCalories, recommendedCalories]);

    const graphPathLength = 283; // 2 * Math.PI * 45;

    return (
        <div className="dashboard-section healthcare-item">
            <div className="section-header">
                <h3>오늘의 건강</h3>
            </div>
            <div className="section-content health-content-grid">
                <div className="pedometer">
                    <h4>만보기</h4>
                    <div id="step-count" className="pedometer-display">{steps}</div>
                    <p>걸음</p>
                    <div className="pedometer-controls" style={{display: 'flex !important'}}>
                        <button id="add-steps-btn" onClick={() => setSteps(steps + 100)}>+100</button>
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

export default Pedometer;
