import React, { useState } from 'react';
import CyclePrediction from './CyclePrediction';
import Pedometer from './Pedometer';
import Diet from './Diet';

const HealthcareTab = ({ userId }) => {
    const [dietTotals, setDietTotals] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
    const [selectedCycleStartDate, setSelectedCycleStartDate] = useState(null); 

    // Temporary dummy values for selectedDate for Diet component
    const dummySelectedDate = new Date().toISOString().split('T')[0]; // Current date

    // Default recommended calories for macro calculations in this component
    const defaultRecommendedCalories = 2000;
    const recommendedCarbs = Math.round(defaultRecommendedCalories * 0.55 / 4); // 55% of calories, 4kcal/g
    const recommendedProtein = Math.round(defaultRecommendedCalories * 0.20 / 4); // 20% of calories, 4kcal/g
    const recommendedFat = Math.round(defaultRecommendedCalories * 0.25 / 9);    // 25% of calories, 9kcal/g

    return (
        <div id="healthcare-tab" className="dash-tab-content active">
            <div className="healthcare-row">
                <CyclePrediction userId={userId} selectedCycleStartDate={selectedCycleStartDate} />
                <Pedometer userId={userId} dietTotals={dietTotals} /> {/* Pass userId and dietTotals to Pedometer */}
            </div>
            
            <Diet setDietTotals={setDietTotals} userId={userId} selectedDate={dummySelectedDate} />

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>탄단지 계산</h3>
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