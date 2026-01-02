import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { useProfile } from './ProfileContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// --- HELPER FUNCTIONS ---
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const STORAGE_KEY = 'oneDayHealthData';

// --- INITIAL STATE LOADER ---
const loadStateFromStorage = () => {
    try {
        const storedState = sessionStorage.getItem(STORAGE_KEY);
        if (storedState) {
            return JSON.parse(storedState);
        }
    } catch (e) {
        console.error("Failed to parse state from sessionStorage", e);
    }
    return { meals: {}, pedometer: {} }; // Default structure
};

// Helper to get initial date from sessionStorage or default to today
const getInitialDate = () => {
    try {
        const storedDate = sessionStorage.getItem('selectedDate');
        if (storedDate) {
            return storedDate;
        }
    } catch (e) {
        console.error("Failed to load selectedDate from sessionStorage", e);
    }
    return new Date().toISOString().split('T')[0];
};

export const DataProvider = ({ children }) => {
    const { profile } = useProfile();
    const userId = profile?.userId;

    const [selectedDate, setSelectedDate] = useState(getInitialDate);
    
    const [mealsByDate, setMealsByDate] = useState(() => loadStateFromStorage().meals);
    const [pedometerDataByDate, setPedometerDataByDate] = useState(() => loadStateFromStorage().pedometer);
    const [dietTotals, setDietTotals] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
    
    // --- DEBOUNCED SAVE FUNCTIONS ---
    const debouncedSaveApiMealsRef = useRef(debounce((date, cards) => saveMeals(date, cards), 1500));
    const debouncedSaveApiStepsRef = useRef(debounce((date, steps) => saveSteps(date, steps), 1500));
    const debouncedSaveToStorageRef = useRef(debounce((data) => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save state to sessionStorage", e);
        }
    }, 500));

    // --- SAVE SELECTED DATE EFFECT ---
    useEffect(() => {
        try {
            sessionStorage.setItem('selectedDate', selectedDate);
        } catch (e) {
            console.error("Failed to save selectedDate to sessionStorage", e);
        }
    }, [selectedDate]);

    // --- API FUNCTIONS ---
    async function saveMeals(dateToSave, mealCardsToSave) {
        if (!userId || !dateToSave || !mealCardsToSave) return;
        if (mealCardsToSave.length === 0 || (mealCardsToSave.length === 1 && mealCardsToSave[0].foods.length === 0)) return; 
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/meals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date: dateToSave, mealCards: mealCardsToSave }),
            });
        } catch (error) { console.error(`Error saving meals for date ${dateToSave}:`, error); }
    }

    async function saveSteps(dateToSave, stepsToSave) {
        if (!userId || !dateToSave || stepsToSave === undefined) return;
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/healthcare/steps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date: dateToSave, steps: stepsToSave }),
            });
        } catch (error) { console.error(`Error saving steps for date ${dateToSave}:`, error); }
    }

    // --- DATA FETCHING EFFECT ---
    useEffect(() => {
        if (!userId || !selectedDate) return;

        if (mealsByDate[selectedDate] === undefined) {
            fetch(`${process.env.REACT_APP_API_URL}/api/meals/${userId}/${selectedDate}`)
                .then(res => res.json())
                .then(data => setMealsByDate(prev => ({ ...prev, [selectedDate]: data || [] })))
                .catch(error => {
                    console.error("Error fetching meals:", error);
                    setMealsByDate(prev => ({ ...prev, [selectedDate]: [] }));
                });
        }

        if (pedometerDataByDate[selectedDate] === undefined) {
            fetch(`${process.env.REACT_APP_API_URL}/api/healthcare/steps/${userId}/${selectedDate}`)
                .then(res => res.json())
                .then(data => setPedometerDataByDate(prev => ({ ...prev, [selectedDate]: { steps: data.steps || 0 } })))
                .catch(error => {
                    console.error("Error fetching steps:", error);
                    setPedometerDataByDate(prev => ({ ...prev, [selectedDate]: { steps: 0 } }));
                });
        }
    }, [userId, selectedDate, mealsByDate, pedometerDataByDate]);

    // --- SAVE TO STORAGE EFFECT ---
    useEffect(() => {
        debouncedSaveToStorageRef.current({
            meals: mealsByDate,
            pedometer: pedometerDataByDate
        });
    }, [mealsByDate, pedometerDataByDate]);

    // --- CALCULATION & API SAVE EFFECTS ---
    useEffect(() => {
        const currentMealCards = mealsByDate[selectedDate] || [];
        const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
        currentMealCards.forEach(card => {
            card.foods.forEach(food => {
                totals.calories += (food.calories || 0) * (food.qty || 1);
                totals.carbs += (food.carbs || 0) * (food.qty || 1);
                totals.protein += (food.protein || 0) * (food.qty || 1);
                totals.fat += (food.fat || 0) * (food.qty || 1);
            });
        });
        setDietTotals(totals);
        debouncedSaveApiMealsRef.current(selectedDate, currentMealCards);
    }, [mealsByDate, selectedDate]);

    useEffect(() => {
        const currentSteps = pedometerDataByDate[selectedDate]?.steps;
        if (currentSteps !== undefined) {
            debouncedSaveApiStepsRef.current(selectedDate, currentSteps);
        }
    }, [pedometerDataByDate, selectedDate]);

    // --- HANDLER FUNCTIONS ---
    const updateCurrentMeals = (updateFn) => setMealsByDate(prev => ({ ...prev, [selectedDate]: updateFn(prev[selectedDate] || []) }));
    const updateSteps = (newSteps) => setPedometerDataByDate(prev => ({ ...prev, [selectedDate]: { steps: newSteps } }));
    const addMealCard = () => updateCurrentMeals(cards => [...cards, { id: Date.now(), category: '점심', foods: [], searchQuery: '' }]);
    const handleCategoryChange = (cardId, newCategory) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, category: newCategory } : card));
    const deleteMealCard = (cardId) => updateCurrentMeals(cards => cards.length > 1 ? cards.filter(card => card.id !== cardId) : cards);
    const removeFoodFromCard = (cardId, foodId) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, foods: card.foods.filter(f => f.id !== foodId) } : card));
    const updateFoodQty = (cardId, foodId, qty) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, foods: card.foods.map(f => f.id === foodId ? { ...f, qty: parseFloat(qty) || 1 } : f) } : cards));
    const addFoodToCard = (cardId, food) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, foods: [...card.foods, { ...food, qty: 1, id: Date.now() }], searchQuery: '' } : card));
    const setSearchQuery = (cardId, query) => updateCurrentMeals(cards => cards.map(card => card.id === cardId ? { ...card, searchQuery: query } : card));

    // --- CONTEXT VALUE ---
    const value = {
        selectedDate, setSelectedDate,
        mealsByDate, // Expose full cache
        pedometerDataByDate, // Expose full cache
        mealCards: mealsByDate[selectedDate] || [],
        dietTotals,
        steps: pedometerDataByDate[selectedDate]?.steps || 0,
        updateSteps,
        addMealCard, deleteMealCard, handleCategoryChange,
        addFoodToCard, removeFoodFromCard, updateFoodQty, setSearchQuery
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
