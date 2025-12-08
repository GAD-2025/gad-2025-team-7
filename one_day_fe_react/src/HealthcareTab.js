import React, { useState } from 'react';
import CyclePrediction from './CyclePrediction';
import Pedometer from './Pedometer';
import Diet from './Diet';
import Calendar from './Calendar'; // Import Calendar

const HealthcareTab = ({ userId }) => {
    const [dietTotals, setDietTotals] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
    const [selectedCycleStartDate, setSelectedCycleStartDate] = useState(null); // New state for cycle start date
    const [nav, setNav] = useState(0); // For calendar navigation
    const [selectedDate, setSelectedDate] = useState(null); // To satisfy Calendar's prop requirements, though not directly used by CyclePrediction
    const [events, setEvents] = useState([]); // To satisfy Calendar's prop requirements

    const recommendedCalories = 2000;
    const recommendedCarbs = 275; // Based on 2000kcal, 55%
    const recommendedProtein = 100;  // Based on 2000kcal, 20% (4kcal/g)
    const recommendedFat = 65;    // Based on 2000kcal, 25% (9kcal/g)

    // Temporary dummy values for selectedDate for Diet component
    const dummySelectedDate = new Date().toISOString().split('T')[0]; // Current date

    return (
        <div id="healthcare-tab" className="dash-tab-content active">
            <div className="healthcare-row">
                {/* Calendar for Cycle Prediction */}
                <div className="calendar-for-cycle-prediction">
                    <Calendar
                        nav={nav}
                        setNav={setNav}
                        selectedDate={selectedCycleStartDate} // Use selectedCycleStartDate here
                        setSelectedDate={setSelectedCycleStartDate} // Use setSelectedCycleStartDate here
                        events={events} // Can be empty or actual events if needed
                        isDragging={false} // Placeholder
                        dragStartDayString={null} // Placeholder
                        dragEndDayString={null} // Placeholder
                        onDragStart={() => {}} // Placeholder
                        onDragMove={() => {}} // Placeholder
                        onDragEnd={() => {}} // Placeholder
                    />
                </div>
                <CyclePrediction userId={dummyUserId} selectedCycleStartDate={selectedCycleStartDate} />
                <Pedometer totalCalories={dietTotals.calories} recommendedCalories={recommendedCalories} />
            </div>
            <Diet setDietTotals={setDietTotals} userId={dummyUserId} selectedDate={dummySelectedDate} />

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
