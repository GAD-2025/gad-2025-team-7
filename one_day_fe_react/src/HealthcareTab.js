import React, { useState } from 'react';
import CyclePrediction from './CyclePrediction';
import Pedometer from './Pedometer';
import Diet from './Diet';
import { useData } from './DataContext';
import './HealthcareTab.css'; // Import the new CSS file

const HealthcareTab = ({ userId }) => {
    const { dietTotals } = useData();
    const [selectedCycleStartDate, setSelectedCycleStartDate] = useState(null); 

    const defaultRecommendedCalories = 2000;
    const recommendedCarbs = Math.round(defaultRecommendedCalories * 0.55 / 4);
    const recommendedProtein = Math.round(defaultRecommendedCalories * 0.20 / 4);
    const recommendedFat = Math.round(defaultRecommendedCalories * 0.25 / 9);

    return (
        <div id="healthcare-tab" className="healthcare-tab-content dash-tab-content active">
            <div className="healthcare-row">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>생리 주기 예측</h3>
                        <i className="fas fa-venus icon"></i> {/* Icon for cycle prediction */}
                    </div>
                    <CyclePrediction userId={userId} selectedCycleStartDate={selectedCycleStartDate} />
                </div>
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>오늘의 건강</h3>
                        <i className="fas fa-heartbeat icon"></i> {/* Icon for health */}
                    </div>
                    <Pedometer userId={userId} />
                </div>
            </div>
            
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>식단 기록</h3>
                    <i className="fas fa-utensils icon"></i> {/* Icon for diet record */}
                </div>
                <Diet />
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>탄단지 계산</h3>
                    <i className="fas fa-calculator icon"></i> {/* Icon for macronutrient calculation */}
                </div>
                <div id="macros-content" className="section-content">
                    <div className="total-calorie-display">
                        오늘 먹은 총 칼로리: <span id="total-intake-display">{Math.round(dietTotals.calories)}</span> kcal
                    </div>
                    <div className="macro-bars-container">
                        <div className="macro-item">
                            <label>탄수화물</label>
                            <div className="macro-bar">
                                <div 
                                    id="carb-bar" 
                                    className="macro-bar-progress" 
                                    style={{ width: `${Math.min(100, (dietTotals.carbs / recommendedCarbs) * 100)}%` }}
                                ></div>
                            </div>
                            <span id="carb-amount">{Math.round(dietTotals.carbs)}g</span>
                        </div>
                        <div className="macro-item">
                            <label>단백질</label>
                            <div className="macro-bar">
                                <div 
                                    id="protein-bar" 
                                    className="macro-bar-progress"
                                    style={{ width: `${Math.min(100, (dietTotals.protein / recommendedProtein) * 100)}%` }}
                                ></div>
                            </div>
                            <span id="protein-amount">{Math.round(dietTotals.protein)}g</span>
                        </div>
                        <div className="macro-item">
                            <label>지방</label>
                            <div className="macro-bar">
                                <div 
                                    id="fat-bar" 
                                    className="macro-bar-progress"
                                    style={{ width: `${Math.min(100, (dietTotals.fat / recommendedFat) * 100)}%` }}
                                ></div>
                            </div>
                            <span id="fat-amount">{Math.round(dietTotals.fat)}g</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareTab;