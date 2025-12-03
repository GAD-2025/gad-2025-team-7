import React, { useState } from 'react';
import CyclePrediction from './CyclePrediction';
import Pedometer from './Pedometer';
import Diet from './Diet';

const HealthcareTab = () => {
    const [totalCalories, setTotalCalories] = useState(0);
    const recommendedCalories = 2000;

    return (
        <div id="healthcare-tab" className="dash-tab-content active">
            <div className="healthcare-row">
                <CyclePrediction />
                <Pedometer totalCalories={totalCalories} recommendedCalories={recommendedCalories} />
            </div>
            <Diet setTotalCalories={setTotalCalories} />

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>탄단지 계산</h3>
                </div>
                <div id="macros-content" className="section-content">
                    <div className="total-calorie-display">
                        오늘 먹은 총 칼로리: <span id="total-intake-display">{totalCalories}</span> kcal
                    </div>
                    <div className="macro-bars-container">
                        <div className="macro-item">
                            <label>탄수화물</label>
                            <div className="macro-bar">
                                <div id="carb-bar" className="macro-bar-progress"></div>
                            </div>
                            <span id="carb-amount">0g</span>
                        </div>
                        <div className="macro-item">
                            <label>단백질</label>
                            <div className="macro-bar">
                                <div id="protein-bar" className="macro-bar-progress"></div>
                            </div>
                            <span id="protein-amount">0g</span>
                        </div>
                        <div className="macro-item">
                            <label>지방</label>
                            <div className="macro-bar">
                                <div id="fat-bar" className="macro-bar-progress"></div>
                            </div>
                            <span id="fat-amount">0g</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareTab;
